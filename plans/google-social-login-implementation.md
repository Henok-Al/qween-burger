# Google Social Login Implementation Plan

## Overview

This document outlines the implementation plan for adding Google Social Login to the Qween Burger application using Firebase Authentication.

---

## Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Firebase
    participant Backend
    participant Database

    User->>Frontend: Click Sign in with Google
    Frontend->>Firebase: Google Sign-In Popup
    Firebase->>User: Google OAuth Consent
    User->>Firebase: Approve
    Firebase->>Frontend: ID Token + User Info
    Frontend->>Backend: POST /api/auth/google
    Backend->>Firebase: Verify ID Token
    Firebase->>Backend: Token Valid + User Data
    Backend->>Database: Create/Update User
    Database->>Backend: User Data
    Backend->>Frontend: JWT Token + User Data
    Frontend->>User: Redirect to Dashboard
```

---

## Prerequisites

### Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Google Sign-In:
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add authorized domains

4. Get Firebase Configuration:
   - Go to Project Settings > General
   - Add a web app
   - Copy the Firebase config object

5. Get Service Account for Backend:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Save the JSON file securely

---

## Implementation Steps

### Step 1: Update User Model

**File:** `backend/models/User.js`

Add fields for Google authentication:

```javascript
// Add to schema
googleId: {
  type: String,
  sparse: true,
  unique: true
},
authProvider: {
  type: String,
  enum: ['local', 'google'],
  default: 'local'
},
profilePicture: {
  type: String,
  trim: true
}
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install firebase-admin
```

### Step 3: Create Firebase Admin Configuration

**File:** `backend/config/firebase.js`

```javascript
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// Option 1: Using service account JSON file
// const serviceAccount = require('./serviceAccountKey.json');

// Option 2: Using environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
```

### Step 4: Add Google Login Controller

**File:** `backend/controllers/authController.js`

Add new function:

```javascript
const admin = require("../config/firebase");

/**
 * @description Google Sign-In
 * @route POST /api/auth/google
 * @access Public
 */
exports.googleLogin = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  if (!idToken) {
    return next(new ErrorHandler("No ID token provided", 400));
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid: googleId } = decodedToken;

    if (!email) {
      return next(new ErrorHandler("Email not provided by Google", 400));
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists - update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        if (picture) user.profilePicture = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: name || "Google User",
        email,
        googleId,
        authProvider: "google",
        profilePicture: picture,
        password: Math.random().toString(36).slice(-8) + "A1!", // Random password for validation
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Google login error:", error);
    return next(new ErrorHandler("Failed to authenticate with Google", 401));
  }
});
```

### Step 5: Add Google Login Route

**File:** `backend/routes/authRoutes.js`

```javascript
// Add route
router.post("/google", googleLogin);
```

### Step 6: Update Environment Variables

**File:** `backend/.env`

Add Firebase configuration:

```
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

### Step 7: Install Frontend Dependencies

```bash
cd frontend
npm install firebase
```

### Step 8: Create Firebase Configuration

**File:** `frontend/src/config/firebase.js`

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add scopes for additional user info
googleProvider.addScope("email");
googleProvider.addScope("profile");

export { auth, googleProvider };
```

### Step 9: Create Environment Variables

**File:** `frontend/.env`

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 10: Update API Service

**File:** `frontend/src/services/api.js`

Add Google login API method:

```javascript
// Add to authAPI object
googleLogin: (idToken) => api.post('/auth/google', { idToken }),
```

### Step 11: Update AuthContext

**File:** `frontend/src/context/AuthContext.jsx`

Add Google login function:

```javascript
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

// Add to AuthContext
const googleLogin = async () => {
  try {
    // Sign in with Google popup
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Get ID token
    const idToken = await user.getIdToken();

    // Send to backend
    const response = await authAPI.googleLogin(idToken);

    if (response.data.success) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
      setUser(response.data.data);
      return { success: true, user: response.data.data };
    }

    return { success: false, error: "Google login failed" };
  } catch (error) {
    console.error("Google login error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message || error.message || "Google login failed",
    };
  }
};
```

### Step 12: Update Login Page

**File:** `frontend/src/pages/Login.jsx`

Add Google Login button:

```jsx
import { useAuth } from "../context/AuthContext";

// Inside component
const { googleLogin } = useAuth();

const handleGoogleLogin = async () => {
  const result = await googleLogin();
  if (result.success) {
    if (result.user?.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }
};

// Add button in JSX
<button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
  <span className="font-medium text-gray-700">Continue with Google</span>
</button>;
```

### Step 13: Update Register Page

**File:** `frontend/src/pages/Register.jsx`

Add the same Google Login button as in Login page.

---

## Files to Create/Modify

### Backend Files

| File                                    | Action | Description                                       |
| --------------------------------------- | ------ | ------------------------------------------------- |
| `backend/models/User.js`                | Modify | Add googleId, authProvider, profilePicture fields |
| `backend/config/firebase.js`            | Create | Firebase Admin SDK configuration                  |
| `backend/controllers/authController.js` | Modify | Add googleLogin function                          |
| `backend/routes/authRoutes.js`          | Modify | Add POST /auth/google route                       |
| `backend/.env`                          | Modify | Add Firebase environment variables                |

### Frontend Files

| File                                   | Action | Description                        |
| -------------------------------------- | ------ | ---------------------------------- |
| `frontend/src/config/firebase.js`      | Create | Firebase client configuration      |
| `frontend/src/services/api.js`         | Modify | Add googleLogin API method         |
| `frontend/src/context/AuthContext.jsx` | Modify | Add googleLogin function           |
| `frontend/src/pages/Login.jsx`         | Modify | Add Google Login button            |
| `frontend/src/pages/Register.jsx`      | Modify | Add Google Login button            |
| `frontend/.env`                        | Create | Add Firebase environment variables |

---

## Security Considerations

1. **Token Verification**: Always verify the Firebase ID token on the backend
2. **Environment Variables**: Never commit Firebase credentials to version control
3. **Service Account**: Keep the Firebase service account key secure
4. **Authorized Domains**: Configure authorized domains in Firebase Console
5. **Rate Limiting**: Implement rate limiting on the Google login endpoint

---

## Testing Checklist

- [ ] Google login button appears on Login page
- [ ] Google login button appears on Register page
- [ ] Google popup appears when clicking the button
- [ ] New user is created in database after first Google login
- [ ] Existing user can login with Google if email matches
- [ ] JWT token is returned and stored in localStorage
- [ ] User is redirected correctly after login
- [ ] Profile picture is saved from Google account
- [ ] Error handling works for cancelled popup
- [ ] Error handling works for network errors

---

## Firebase Console Configuration Steps

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Enter project name: "qween-burger"
   - Enable Google Analytics (optional)
   - Click "Create project"

2. **Enable Google Sign-In**
   - Go to Authentication > Sign-in method
   - Click on "Google"
   - Toggle to "Enable"
   - Add project support email
   - Click "Save"

3. **Add Authorized Domains**
   - In Authentication > Settings > Authorized domains
   - Add your production domain
   - localhost is already included for development

4. **Get Web App Configuration**
   - Go to Project Settings > General
   - Click "Add app" > Web
   - Enter app nickname
   - Copy the firebaseConfig object

5. **Get Service Account**
   - Go to Project Settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file securely (DO NOT COMMIT)
   - Add the values to your .env file

---

## Estimated Implementation Time

| Task                          | Complexity |
| ----------------------------- | ---------- |
| Firebase Console Setup        | Low        |
| Backend User Model Update     | Low        |
| Backend Firebase Admin Setup  | Medium     |
| Backend Google Login Endpoint | Medium     |
| Frontend Firebase Setup       | Low        |
| Frontend Google Login UI      | Low        |
| Frontend AuthContext Update   | Medium     |
| Testing                       | Medium     |

---

## Next Steps

1. Create Firebase project and get configuration
2. Implement backend changes
3. Implement frontend changes
4. Test the complete flow
5. Deploy and test on production domain
