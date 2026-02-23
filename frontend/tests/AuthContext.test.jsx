import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import * as api from '../src/services/api';

// Mock the API
jest.mock('../src/services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    googleLogin: jest.fn(),
    getMe: jest.fn(),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

// Mock socket service
jest.mock('../src/services/socket', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn(),
  joinRoom: jest.fn(),
  leaveRoom: jest.fn(),
}));

// Mock firebase
jest.mock('../src/config/firebase', () => ({
  auth: {},
  googleProvider: {},
}));

// Mock firebase auth
jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component to access auth context
const TestComponent = ({ onAuth }) => {
  const auth = useAuth();
  React.useEffect(() => {
    if (onAuth) onAuth(auth);
  }, [auth, onAuth]);
  return (
    <div>
      <span data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</span>
      <span data-testid="isLoading">{auth.isLoading.toString()}</span>
      <span data-testid="user">{auth.user ? auth.user.name : 'null'}</span>
      <button data-testid="loginBtn" onClick={() => auth.login('test@example.com', 'password123')}>
        Login
      </button>
      <button data-testid="logoutBtn" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    jest.clearAllMocks();
  });

  test('should provide initial auth state', async () => {
    const authState = {};
    
    render(
      <AuthProvider>
        <TestComponent onAuth={(auth) => Object.assign(authState, auth)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authState.isLoading).toBe(false);
    });

    expect(authState.isAuthenticated).toBe(false);
    expect(authState.user).toBe(null);
  });

  test('should login successfully', async () => {
    const mockUser = { _id: '1', name: 'John', email: 'test@example.com' };
    const mockToken = 'test-token';
    
    api.authAPI.login.mockResolvedValue({
      data: { success: true, data: mockUser, token: mockToken },
    });

    let authState;
    
    render(
      <AuthProvider>
        <TestComponent onAuth={(auth) => (authState = auth)} />
      </AuthProvider>
    );

    await act(async () => {
      await authState.login('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(authState.isAuthenticated).toBe(true);
    });

    expect(authState.user).toEqual(mockUser);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  test('should handle login failure', async () => {
    api.authAPI.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    let authState;
    
    render(
      <AuthProvider>
        <TestComponent onAuth={(auth) => (authState = auth)} />
      </AuthProvider>
    );

    let result;
    await act(async () => {
      result = await authState.login('test@example.com', 'wrongpassword');
    });

    expect(result.success).toBe(false);
    expect(authState.error).toBe('Invalid credentials');
  });

  test('should logout successfully', async () => {
    const mockUser = { _id: '1', name: 'John', email: 'test@example.com' };
    const mockToken = 'test-token';
    
    // Setup authenticated state
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    let authState;
    
    render(
      <AuthProvider>
        <TestComponent onAuth={(auth) => (authState = auth)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authState.isAuthenticated).toBe(true);
    });

    await act(async () => {
      authState.logout();
    });

    expect(authState.isAuthenticated).toBe(false);
    expect(authState.user).toBe(null);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  test('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleError.mockRestore();
  });

  test('should register successfully', async () => {
    const mockUser = { _id: '1', name: 'New User', email: 'new@example.com' };
    const mockToken = 'test-token';
    
    api.authAPI.register.mockResolvedValue({
      data: { success: true, data: mockUser, token: mockToken },
    });

    let authState;
    
    render(
      <AuthProvider>
        <TestComponent onAuth={(auth) => (authState = auth)} />
      </AuthProvider>
    );

    let result;
    await act(async () => {
      result = await authState.register('New User', 'new@example.com', 'password123', 'Address', '123456');
    });

    expect(result.success).toBe(true);
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user).toEqual(mockUser);
  });
});
