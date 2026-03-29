// ================================================================
//  FIREBASE CONFIGURATION — MindPulse
//
//  ⚠️  SETUP INSTRUCTIONS (one-time, ~5 minutes):
//
//  1. Go to https://console.firebase.google.com
//  2. Click "Create a project" → name it "mindpulse" → Continue
//  3. Disable Google Analytics (optional) → Create Project
//  4. Once created, click the web icon (</>) to add a web app
//  5. Register app name as "MindPulse" → Register app
//  6. Copy ONLY the firebaseConfig object values → paste below
//  7. Go to Authentication → Get started → Sign-in method:
//       • Enable "Email/Password"
//       • Enable "Google" (use your email as support email)
//  8. Go to Firestore Database → Create database
//       • Select "Start in test mode"
//       • Choose nearest region → Enable
//  9. (Production) Update Firestore rules to:
//       rules_version = '2';
//       service cloud.firestore {
//         match /databases/{database}/documents {
//           match /users/{userId}/{document=**} {
//             allow read, write: if request.auth != null
//                                && request.auth.uid == userId;
//           }
//         }
//       }
// ================================================================

const firebaseConfig = {
    apiKey: "AIzaSyArUELlHAmPqqUpcFCKJhbSBqFybpiebSE",
    authDomain: "mindpulse-7afe3.firebaseapp.com",
    projectId: "mindpulse-7afe3",
    storageBucket: "mindpulse-7afe3.firebasestorage.app",
    messagingSenderId: "741315000976",
    appId: "1:741315000976:web:9b09d7f6c8b8b771287615",
    measurementId: "G-7KQGY58XW0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence (data available even without internet)
db.enablePersistence({ synchronizeTabs: true }).catch(err => {
    if (err.code === 'failed-precondition') {
        console.warn('Firestore: Multiple tabs open, persistence in first tab only.');
    } else if (err.code === 'unimplemented') {
        console.warn('Firestore: Persistence not available in this browser.');
    }
});

// Google Auth Provider (reusable)
const googleProvider = new firebase.auth.GoogleAuthProvider();
