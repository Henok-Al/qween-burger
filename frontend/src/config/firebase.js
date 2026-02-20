import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyb3Spee6C0khbEccUmq07K6KdmPguZLI",
  authDomain: "clone-b54e6.firebaseapp.com",
  projectId: "clone-b54e6",
  storageBucket: "clone-b54e6.appspot.com",
  messagingSenderId: "137641596801",
  appId: "1:137641596801:web:ae66be1e290c7fb972fa80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Add scopes for additional user info
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set custom parameters for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
