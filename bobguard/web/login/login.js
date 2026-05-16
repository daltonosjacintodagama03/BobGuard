// Login Logic for BobGuard
(function() {
    'use strict';

    // DOM Elements
    const googleSignInBtn = document.getElementById('googleSignIn');
    const emailForm = document.getElementById('emailForm');
    const toggleModeLink = document.getElementById('toggleMode');
    const toggleText = document.getElementById('toggleText');
    const loadingDiv = document.getElementById('loading');
    const errorMessageDiv = document.getElementById('errorMessage');
    const successMessageDiv = document.getElementById('successMessage');
    const loginMethods = document.querySelector('.login-methods');

    // State
    let isSignUpMode = false;

    // Get callback URL from query params
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get('callback') || 'vscode://bobguard.bobguard/auth';

    // Initialize Firebase Auth
    let auth;
    try {
        auth = firebase.auth();
    } catch (error) {
        showError('Erro ao inicializar Firebase. Verifica a configuração.');
        console.error('Firebase initialization error:', error);
        return;
    }

    // Google Sign In
    googleSignInBtn.addEventListener('click', async () => {
        try {
            showLoading();
            
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            const result = await auth.signInWithPopup(provider);
            await handleAuthSuccess(result.user);
        } catch (error) {
            hideLoading();
            handleAuthError(error);
        }
    });

    // Email/Password Form
    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showError('Por favor, preenche todos os campos');
            return;
        }

        if (password.length < 6) {
            showError('Password deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            showLoading();

            let result;
            if (isSignUpMode) {
                // Sign Up
                result = await auth.createUserWithEmailAndPassword(email, password);
            } else {
                // Sign In
                result = await auth.signInWithEmailAndPassword(email, password);
            }

            await handleAuthSuccess(result.user);
        } catch (error) {
            hideLoading();
            handleAuthError(error);
        }
    });

    // Toggle Sign Up / Sign In
    toggleModeLink.addEventListener('click', (e) => {
        e.preventDefault();
        isSignUpMode = !isSignUpMode;

        if (isSignUpMode) {
            toggleText.textContent = 'Já tens conta?';
            toggleModeLink.textContent = 'Entrar';
            emailForm.querySelector('button[type="submit"]').textContent = 'Criar Conta';
        } else {
            toggleText.textContent = 'Não tens conta?';
            toggleModeLink.textContent = 'Criar conta';
            emailForm.querySelector('button[type="submit"]').textContent = 'Entrar';
        }
    });

    // Handle successful authentication
    async function handleAuthSuccess(user) {
        try {
            showSuccess('Autenticação bem sucedida! Redirecionando...');

            // Get ID token
            const idToken = await user.getIdToken();

            // Build redirect URL with auth data
            const redirectUrl = new URL(callbackUrl);
            redirectUrl.searchParams.set('token', idToken);
            redirectUrl.searchParams.set('userId', user.uid);
            redirectUrl.searchParams.set('email', user.email);

            // Redirect to VS Code
            setTimeout(() => {
                window.location.href = redirectUrl.toString();
            }, 1500);
        } catch (error) {
            hideLoading();
            showError('Erro ao processar autenticação: ' + error.message);
        }
    }

    // Handle authentication errors
    function handleAuthError(error) {
        console.error('Auth error:', error);

        let message = 'Erro ao autenticar';

        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Este email já está em uso';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            case 'auth/operation-not-allowed':
                message = 'Operação não permitida';
                break;
            case 'auth/weak-password':
                message = 'Password muito fraca';
                break;
            case 'auth/user-disabled':
                message = 'Utilizador desativado';
                break;
            case 'auth/user-not-found':
                message = 'Utilizador não encontrado';
                break;
            case 'auth/wrong-password':
                message = 'Password incorreta';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Login cancelado';
                break;
            case 'auth/network-request-failed':
                message = 'Erro de rede. Verifica a tua conexão';
                break;
            default:
                message = error.message || 'Erro desconhecido';
        }

        showError(message);
    }

    // UI Helper Functions
    function showLoading() {
        loginMethods.style.display = 'none';
        loadingDiv.style.display = 'block';
        errorMessageDiv.style.display = 'none';
        successMessageDiv.style.display = 'none';
    }

    function hideLoading() {
        loginMethods.style.display = 'flex';
        loadingDiv.style.display = 'none';
    }

    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
        successMessageDiv.style.display = 'none';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessageDiv.style.display = 'none';
        }, 5000);
    }

    function showSuccess(message) {
        successMessageDiv.textContent = message;
        successMessageDiv.style.display = 'block';
        errorMessageDiv.style.display = 'none';
    }

    // Check if already authenticated
    auth.onAuthStateChanged((user) => {
        if (user && !loadingDiv.style.display) {
            // User is already signed in, redirect immediately
            handleAuthSuccess(user);
        }
    });

    // Handle errors on page load
    window.addEventListener('error', (event) => {
        console.error('Page error:', event.error);
        if (event.error && event.error.message.includes('Firebase')) {
            showError('Erro ao carregar Firebase. Verifica a configuração.');
        }
    });

    console.log('BobGuard Login initialized');
})();
