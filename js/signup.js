// Elementos do DOM
const signupForm = document.getElementById('signup-form');
const errorMessage = document.getElementById('error-message');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBackground = document.getElementById('signup-background');
const signupButton = document.querySelector('.botao-signup');

// Define a imagem de fundo
signupBackground.style.backgroundImage = `url('../assets/images/BackGround.png')`;

// Função para mostrar erro
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Função de cadastro
async function handleSignup(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validação básica
    if (!email || !password) {
        showError('Por favor, preencha todos os campos.');
        return;
    }
    
    try {
        // Integração com Supabase
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
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
            alert('Cadastro realizado com sucesso! Verifique seu email para confirmação.');
            window.location.href = 'login.html';
        } else {
            showError('Erro ao cadastrar. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao conectar com o servidor. Tente novamente.');
    }
}

// Event listener para o formulário
signupForm.addEventListener('submit', handleSignup);