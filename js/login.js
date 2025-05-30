// Elementos do DOM
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBackground = document.getElementById('login-background');
const loginButton = document.querySelector('.botao-login');

// Define a imagem de fundo
loginBackground.style.backgroundImage = `url('../assets/images/BackGround.png')`;

// Função para mostrar erro
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Função para alternar estado de loading
function setLoading(isLoading) {
    if (isLoading) {
        loginButton.disabled = true;
        loginButton.classList.add('loading');
        loginButton.textContent = '';
    } else {
        loginButton.disabled = false;
        loginButton.classList.remove('loading');
        loginButton.textContent = 'Login';
    }
}

// Função de login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validação básica
    if (!email || !password) {
        showError('Por favor, preencha todos os campos.');
        return;
    }
    
    setLoading(true);
    
    try {
        // Integração com Supabase
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva o token e informações do usuário
            localStorage.setItem('supabase.auth.token', data.access_token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userId', data.user.id);
            
            // Redireciona para o dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Trata erros específicos
            if (data.error === 'invalid_grant') {
                showError('Email ou senha incorretos.');
            } else {
                showError('Erro ao fazer login. Tente novamente.');
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
        setLoading(false);
    }
}

// Event listeners
loginForm.addEventListener('submit', handleLogin);

// Permite login com Enter
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && passwordInput.value) {
        handleLogin(e);
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && emailInput.value) {
        handleLogin(e);
    }
});

// Verifica se o usuário já está logado
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('supabase.auth.token');
    if (token) {
        // Verifica se o token ainda é válido
        fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': SUPABASE_ANON_KEY
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = 'dashboard.html';
            } else {
                // Token inválido, remove do localStorage
                localStorage.removeItem('supabase.auth.token');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userId');
            }
        });
    }
});