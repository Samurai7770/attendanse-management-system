const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    // For production, use service account key from environment
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://your-project.firebaseio.com'
      });
    } else {
      // For development, use default credentials (requires gcloud auth)
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id'
      });
    }
  }
  console.log('Firebase initialized successfully');
};

module.exports = initializeFirebase;