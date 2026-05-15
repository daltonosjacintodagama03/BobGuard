// Firebase Configuration for BobGuard
// IMPORTANT: Replace these values with your actual Firebase project credentials

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    alert('Erro ao inicializar Firebase. Por favor, verifica a configuração em firebase-config.js');
}

// Instructions:
// 1. Go to https://console.firebase.google.com
// 2. Create or select your project
// 3. Go to Project Settings > General
// 4. Under "Your apps", click the web icon (</>)
// 5. Register your app and copy the configuration
// 6. Replace the values above with your actual Firebase config
// 7. Enable Authentication methods (Email/Password and Google) in Firebase Console
// 8. Enable Firestore Database in Firebase Console
