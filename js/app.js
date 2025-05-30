// Função para scroll suave até uma seção
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Função para voltar ao topo
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Adicionar animações ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar classe para animações de entrada
    const elements = document.querySelectorAll('.hero-content, .hero-image-frame, .caixa');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        observer.observe(element);
    });
});

// Adicionar efeito de hover nos botões
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Verificar Usuário Logado
async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        window.location.href = 'dashboard.html';
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', checkUser);