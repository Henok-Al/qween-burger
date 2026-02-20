import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

// Action types
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGOUT = 'LOGOUT';
const UPDATE_PROFILE = 'UPDATE_PROFILE';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case LOGOUT:
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case UPDATE_PROFILE:
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
        error: null,
      };
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // Only parse user if it's a valid JSON string
    if (token && userStr && userStr !== 'undefined') {
      try {
        const user = JSON.parse(userStr);
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            token,
            user,
          },
        });
        
        // Connect to Socket.io
        socketService.connect().then(() => {
          socketService.joinRoom(user._id);
        });
      } catch {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const response = await authAPI.login({ email, password });
      
      // Backend returns { success: true, data: user, token }
      const { token, data: user } = response.data;
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { token, user },
      });
      
      // Connect to Socket.io
      socketService.connect().then(() => {
        socketService.joinRoom(user._id);
      });
      
      // Return the user data along with success status
      return { success: true, user };
    } catch (error) {
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || 'Login failed',
      });
      return { success: false, user: null };
    }
  };

  // Register user
  const register = async (name, email, password, address, phone) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const response = await authAPI.register({
        name,
        email,
        password,
        address,
        phone,
      });
      
      // Backend returns { success: true, data: user, token }
      const { token, data: user } = response.data;
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { token, user },
      });
      
      return { success: true, user };
    } catch (error) {
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || 'Registration failed',
      });
      return { success: false, user: null };
    }
  };

  // Google Login
  const googleLogin = async () => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get ID token
      const idToken = await user.getIdToken();
      
      // Send to backend
      const response = await authAPI.googleLogin(idToken);
      
      if (response.data.success) {
        const { token, data: userData } = response.data;
        
        dispatch({
          type: LOGIN_SUCCESS,
          payload: { token, user: userData },
        });
        
        // Connect to Socket.io
        socketService.connect().then(() => {
          socketService.joinRoom(userData._id);
        });
        
        return { success: true, user: userData };
      }
      
      return { success: false, error: 'Google login failed' };
    } catch (error) {
      console.error('Google login error:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message || 'Google login failed',
      });
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Google login failed' 
      };
    }
  };

  // Logout user
  const logout = () => {
    // Disconnect from Socket.io
    if (state.user) {
      socketService.leaveRoom(state.user._id);
      socketService.disconnect();
    }
    dispatch({ type: LOGOUT });
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const response = await authAPI.updateProfile(data);
      
      dispatch({
        type: UPDATE_PROFILE,
        payload: response.data.data,
      });
      
      return true;
    } catch (error) {
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || 'Profile update failed',
      });
      return false;
    }
  };

  // Update user password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      await authAPI.updatePassword({
        currentPassword,
        newPassword,
      });
      
      dispatch({ type: SET_LOADING, payload: false });
      return true;
    } catch (error) {
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || 'Password update failed',
      });
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: SET_ERROR, payload: null });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    updatePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
