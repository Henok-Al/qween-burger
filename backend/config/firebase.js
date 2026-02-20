const admin = require('firebase-admin');

/**
 * Firebase Admin SDK Configuration
 * Used for verifying Firebase ID tokens from the frontend
 */

// Firebase project configuration
const firebaseProjectId = 'clone-b54e6';

// Initialize Firebase Admin SDK
// We use the project ID only - no service account needed for token verification
// This is more secure as we don't need to store service account credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseProjectId
  });
}

/**
 * Verify Firebase ID Token
 * @param {string} idToken - The Firebase ID token to verify
 * @returns {Promise<admin.auth.DecodedIdToken>} - The decoded token
 */
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification error:', error.message);
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  admin,
  verifyIdToken
};
