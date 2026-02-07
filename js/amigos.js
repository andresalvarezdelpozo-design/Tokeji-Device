// ==========================================
// INICIO
// ==========================================

function init() {
    console.log('🎮 Iniciando Tokeji...');
    
    // Cachear páginas iniciales
    pages = {
        splash: document.getElementById('page-splash'),
        consent: document.getElementById('page-consent'),
        'setup-name': document.getElementById('page-setup-name'),
        'setup-avatar': document.getElementById('page-setup-avatar'),
        home: document.getElementById('page-home'),
        menu: document.getElementById('page-menu')
    };
    
    // Función para añadir páginas dinámicas
    window.registrarPagina = function(nombre, elemento) {
        pages[nombre] = elemento;
        console.log('📄 Página registrada:', nombre);
    };
    
    // Verificar usuario
    const saved = loadUser();
    if (saved) {
        user = saved;
        isFirstTime = false;
        console.log('Usuario:', user.nombre);
    } else {
        isFirstTime = true;
        console.log('Primera vez');
    }
    
    // Inicializar
    initEvents();
    updateClock();
    setInterval(updateClock, 60000);
    
    // Mostrar splash
    showPage('splash');
    
    console.log('✅ Core listo, esperando módulos...');
}

// Arrancar cuando DOM listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
