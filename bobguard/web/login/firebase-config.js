// Firebase Configuration for BobGuard
// Configuração oficial do projeto BobGuard

const firebaseConfig = {
    apiKey: "AIzaSyBunarj3Gfies5ls-SGWoJ2QbDU442oRI0",
    authDomain: "bobguard-36fb0.firebaseapp.com",
    projectId: "bobguard-36fb0",
    storageBucket: "bobguard-36fb0.firebasestorage.app",
    messagingSenderId: "23080734713",
    appId: "1:23080734713:web:6af9a2d965acfc85747728",
    measurementId: "G-PG8JQWP36V"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    alert('Erro ao inicializar Firebase. Por favor, contacte o suporte.');
}

// Firebase já está configurado para o projeto BobGuard
// Se precisares usar tua própria instância Firebase:
// 1. Vai a https://console.firebase.google.com
// 2. Cria ou seleciona teu projeto
// 3. Vai a Project Settings > General
// 4. Em "Your apps", clica no ícone web (</>)
// 5. Regista tua app e copia a configuração
// 6. Substitui os valores acima pela tua configuração Firebase
// 7. Ativa métodos de autenticação (Email/Password e Google) na Firebase Console
// 8. Ativa Firestore Database na Firebase Console