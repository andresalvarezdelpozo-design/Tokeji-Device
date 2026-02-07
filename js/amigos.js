// ==========================================
// TOKEJI - MÓDULO 4: AMIGOS (VERSIÓN MÍNIMA DE PRUEBA)
// ==========================================

console.log('📦 amigos.js cargado');

// Esperar a que todo esté listo
setTimeout(function() {
    console.log('⏰ Iniciando...');
    
    // 1. CREAR PÁGINA SIMPLE
    const screen = document.querySelector('.screen');
    if (!screen) {
        console.error('❌ No hay .screen');
        return;
    }
    
    // Eliminar si existe
    const existente = document.getElementById('pagina-amigos');
    if (existente) existente.remove();
    
    // Crear página
    const pagina = document.createElement('div');
    pagina.id = 'pagina-amigos';
    pagina.innerHTML = `
        <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #f8fafc;
            z-index: 100;
            display: none;
            padding: 50px 20px 20px;
            box-sizing: border-box;
        ">
            <h1 style="color: #8b5cf6; text-align: center; margin: 0 0 20px 0;">AMIGOS</h1>
            <p style="text-align: center; color: #64748b;">Página de amigos funcionando</p>
            <button id="btn-volver" style="
                display: block;
                margin: 30px auto;
                padding: 15px 30px;
                background: #8b5cf6;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                cursor: pointer;
            ">Volver al menú</button>
        </div>
    `;
    
    screen.appendChild(pagina);
    console.log('✅ Página creada');
    
    // 2. FUNCIÓN PARA MOSTRAR
    window.mostrarPaginaAmigos = function() {
        console.log('👉 Mostrando página amigos');
        const p = document.getElementById('pagina-amigos');
        if (p) {
            p.style.display = 'block';
            window.currentPage = 'amigos';
        }
    };
    
    // 3. FUNCIÓN PARA OCULTAR
    window.ocultarPaginaAmigos = function() {
        console.log('👈 Ocultando página amigos');
        const p = document.getElementById('pagina-amigos');
        if (p) {
            p.style.display = 'none';
        }
    };
    
    // 4. BOTÓN VOLVER
    document.getElementById('btn-volver').onclick = function() {
        window.ocultarPaginaAmigos();
        // Mostrar menú
        const menu = document.getElementById('page-menu');
        if (menu) {
            menu.classList.add('active');
            menu.style.opacity = '1';
        }
        window.currentPage = 'menu';
    };
    
    // 5. INTEGRAR CON NAVEGACIÓN
    if (typeof window.onOk === 'function') {
        console.log('🔗 Integrando navegación...');
        
        const originalOnOk = window.onOk;
        
        window.onOk = function() {
            console.log('🎯 onOk, currentPage:', window.currentPage, 'selectedIndex:', window.selectedIndex);
            
            // Si estamos en menú y pulsamos Amigos (índice 0)
            if (window.currentPage === 'menu' && window.selectedIndex === 0) {
                console.log('👉 Detectado: Menú -> Amigos');
                
                // Ocultar menú
                const menu = document.getElementById('page-menu');
                if (menu) {
                    menu.classList.remove('active');
                    menu.style.opacity = '0';
                }
                
                // Mostrar amigos
                window.mostrarPaginaAmigos();
                
                // Sonido
                if (typeof soundSelect === 'function') soundSelect();
                
                return;
            }
            
            // Llamar original
            originalOnOk();
        };
        
        console.log('✅ Navegación integrada');
    } else {
        console.error('❌ onOk no existe aún');
    }
    
}, 1000); // Esperar 1 segundo a que el core cargue
