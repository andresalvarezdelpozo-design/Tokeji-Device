// ==========================================
// TOKEJI - MÓDULO 4: AMIGOS + QR (VERSIÓN ULTRA SIMPLE)
// ==========================================

// Datos
let contactos = {};
let botonSeleccionado = 0; // 0 = Escanear, 1 = Mi QR

// ==========================================
// INICIALIZACIÓN
// ==========================================

function initAmigos() {
    console.log('👥 Iniciando Amigos...');
    
    // Cargar contactos
    const saved = localStorage.getItem('tokeji_contactos');
    if (saved) {
        try { contactos = JSON.parse(saved); } catch(e) {}
    }
    
    crearPaginaAmigos();
    addEstilos();
    integrarConCore();
    
    console.log('✅ Amigos listo');
}

// ==========================================
// CREAR PÁGINA (DENTRO DEL SCREEN EXISTENTE)
// ==========================================

function crearPaginaAmigos() {
    const screen = document.querySelector('.screen');
    if (!screen) {
        console.error('❌ No hay .screen');
        return;
    }
    
    // No crear si ya existe
    if (document.getElementById('pagina-amigos')) return;
    
    const pagina = document.createElement('div');
    pagina.id = 'pagina-amigos';
    pagina.className = 'pagina-amigos';
    
    // Contenido simple
    pagina.innerHTML = `
        <div style="padding: 40px 15px 15px; height: 100%; display: flex; flex-direction: column;">
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 20px; font-weight: 900; color: #2d3748;">MIS AMIGOS</div>
                <div style="font-size: 12px; color: #8b5cf6; font-weight: 700;" id="contador-amigos">0 amigos</div>
            </div>
            
            <div style="flex: 1; overflow-y: auto; margin-bottom: 15px;" id="lista-amigos">
                <!-- Lista o mensaje vacío -->
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 10px; padding-top: 15px; border-top: 2px solid #e2e8f0;">
                <button id="btn-escanear" class="btn-amigo selected" style="display: flex; align-items: center; gap: 15px; background: white; border: 3px solid #8b5cf6; border-radius: 15px; padding: 15px; cursor: pointer; box-shadow: 0 6px 0 #8b5cf6; width: 100%; text-align: left;">
                    <span style="font-size: 28px;">📷</span>
                    <span style="font-size: 16px; font-weight: 800; color: #2d3748;">Escanear QR</span>
                </button>
                <button id="btn-miqr" class="btn-amigo" style="display: flex; align-items: center; gap: 15px; background: white; border: 3px solid transparent; border-radius: 15px; padding: 15px; cursor: pointer; box-shadow: 0 4px 0 #e2e8f0; width: 100%; text-align: left;">
                    <span style="font-size: 28px;">📱</span>
                    <span style="font-size: 16px; font-weight: 800; color: #2d3748;">Mi Código</span>
                </button>
            </div>
        </div>
    `;
    
    screen.appendChild(pagina);
    
    // Registrar en pages si existe
    if (typeof pages !== 'undefined') {
        pages.amigos = pagina;
    }
    
    console.log('✅ Página creada');
}

function addEstilos() {
    if (document.getElementById('estilos-amigos')) return;
    
    const style = document.createElement('style');
    style.id = 'estilos-amigos';
    style.textContent = `
        .pagina-amigos {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #f8fafc;
            z-index: 10;
        }
        .pagina-amigos.activa {
            display: block;
        }
        .btn-amigo.selected {
            border-color: #8b5cf6 !important;
            background: #f3f0ff !important;
            box-shadow: 0 6px 0 #8b5cf6 !important;
            transform: translateX(5px);
        }
        .amigo-item {
            background: white;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 8px;
            border: 3px solid transparent;
            box-shadow: 0 4px 0 #e2e8f0;
        }
        .amigo-item.selected {
            border-color: #8b5cf6;
            background: #f3f0ff;
            box-shadow: 0 6px 0 #8b5cf6;
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// MOSTRAR/OCULTAR
// ==========================================

function mostrarAmigos() {
    console.log('👉 Mostrando Amigos');
    
    const pagina = document.getElementById('pagina-amigos');
    if (!pagina) {
        console.error('❌ No existe pagina-amigos');
        return;
    }
    
    // Ocultar todas las páginas del core
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.opacity = '0';
    });
    
    // Mostrar nuestra página
    pagina.style.display = 'block';
    pagina.classList.add('activa');
    
    // Actualizar currentPage global
    if (typeof currentPage !== 'undefined') {
        currentPage = 'amigos';
    }
    
    // Renderizar contenido
    renderLista();
    
    // Reset selección
    botonSeleccionado = 0;
    updateBotones();
}

function ocultarAmigos() {
    const pagina = document.getElementById('pagina-amigos');
    if (pagina) {
        pagina.style.display = 'none';
        pagina.classList.remove('activa');
    }
}

function renderLista() {
    const lista = document.getElementById('lista-amigos');
    const contador = document.getElementById('contador-amigos');
    
    if (!lista || !contador) return;
    
    const numAmigos = Object.keys(contactos).length;
    contador.textContent = `${numAmigos} amigo${numAmigos !== 1 ? 's' : ''}`;
    
    if (numAmigos === 0) {
        lista.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; opacity: 0.6; text-align: center;">
                <div style="font-size: 50px; margin-bottom: 10px;">👻</div>
                <div style="font-size: 16px; font-weight: 800; color: #2d3748;">No tienes amigos aún</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Escanea un QR para añadir</div>
            </div>
        `;
    } else {
        lista.innerHTML = '';
        Object.entries(contactos).forEach(([id, nombre], index) => {
            lista.innerHTML += `
                <div class="amigo-item ${index === 0 ? 'selected' : ''}" data-id="${id}">
                    <div style="font-size: 14px; font-weight: 800;">${nombre}</div>
                    <div style="font-size: 10px; color: #94a3b8;">${id}</div>
                </div>
            `;
        });
    }
}

function updateBotones() {
    const btnEscanear = document.getElementById('btn-escanear');
    const btnMiQR = document.getElementById('btn-miqr');
    
    if (btnEscanear && btnMiQR) {
        btnEscanear.classList.toggle('selected', botonSeleccionado === 0);
        btnMiQR.classList.toggle('selected', botonSeleccionado === 1);
    }
}

// ==========================================
// ACCIONES
// ==========================================

function accionEscanear() {
    console.log('📷 Escanear...');
    alert('📷 Aquí se abriría la cámara\n\nEn Dame un Toque funciona así:\n1. Se abre el video en pantalla completa\n2. jsQR escanea cada frame\n3. Al detectar QR, se procesa el código\n\nPara Tokeji necesitaríamos adaptar el mismo código pero dentro del tamaño de pantalla del dispositivo (310x380px)');
}

function accionMiQR() {
    console.log('📱 Mi QR...');
    
    // Obtener datos del usuario
    let nombre = 'Usuario';
    let id = '----';
    
    if (typeof user !== 'undefined' && user) {
        nombre = user.nombre || nombre;
        id = user.id || id;
    } else {
        const saved = localStorage.getItem('tokeji_user');
        if (saved) {
            try {
                const u = JSON.parse(saved);
                nombre = u.nombre || nombre;
                id = u.id || id;
            } catch(e) {}
        }
    }
    
    // Crear modal simple
    const screen = document.querySelector('.screen');
    const modal = document.createElement('div');
    modal.id = 'modal-miqr';
    modal.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #f8fafc; z-index: 20; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;';
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(id + '|' + nombre)}`;
    
    modal.innerHTML = `
        <div style="font-size: 20px; font-weight: 900; margin-bottom: 20px; color: #2d3748;">MI CÓDIGO</div>
        <div style="background: white; padding: 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <img src="${qrUrl}" style="width: 180px; height: 180px; display: block;">
        </div>
        <div style="text-align: center; margin-bottom: 10px;">
            <div style="font-size: 18px; font-weight: 800; color: #2d3748;">${nombre}</div>
            <div style="font-size: 12px; color: #64748b; font-family: monospace;">ID: ${id}</div>
        </div>
        <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 30px;">Muéstralo a tus amigos</div>
        <button onclick="cerrarModalQR()" style="padding: 12px 30px; background: #8b5cf6; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 0 #5b21b6;">◄ Volver</button>
    `;
    
    screen.appendChild(modal);
}

function cerrarModalQR() {
    const modal = document.getElementById('modal-miqr');
    if (modal) modal.remove();
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function navegarArriba() {
    if (typeof currentPage !== 'undefined' && currentPage !== 'amigos') return false;
    
    // Solo navegamos entre botones (simplificado)
    botonSeleccionado = 0;
    updateBotones();
    return true;
}

function navegarAbajo() {
    if (typeof currentPage !== 'undefined' && currentPage !== 'amigos') return false;
    
    botonSeleccionado = (botonSeleccionado + 1) % 2;
    updateBotones();
    return true;
}

function pulsarOk() {
    if (typeof currentPage !== 'undefined' && currentPage !== 'amigos') return false;
    
    if (botonSeleccionado === 0) {
        accionEscanear();
    } else {
        accionMiQR();
    }
    return true;
}

function pulsarBack() {
    // Si estamos en el modal de QR, cerrarlo
    const modal = document.getElementById('modal-miqr');
    if (modal) {
        modal.remove();
        return true;
    }
    
    // Si estamos en amigos, volver al menú
    if (typeof currentPage !== 'undefined' && currentPage === 'amigos') {
        ocultarAmigos();
        
        // Mostrar menú del core
        if (typeof pages !== 'undefined' && pages.menu) {
            pages.menu.classList.add('active');
            pages.menu.style.opacity = '1';
        }
        if (typeof currentPage !== 'undefined') {
            currentPage = 'menu';
        }
        return true;
    }
    
    return false;
}

// ==========================================
// INTEGRACIÓN CON CORE
// ==========================================

function integrarConCore() {
    console.log('🔗 Integrando con Core...');
    
    // Esperar a que existan las funciones del core
    const checkInterval = setInterval(() => {
        if (typeof onOk !== 'function') return;
        
        clearInterval(checkInterval);
        console.log('✅ Core listo, integrando...');
        
        // Guardar originales
        const core_onOk = window.onOk;
        const core_onBack = window.onBack;
        const core_onUp = window.onUp;
        const core_onDown = window.onDown;
        
        // Sobrescribir
        window.onOk = function() {
            // Menú -> Amigos (índice 0)
            if (typeof currentPage !== 'undefined' && currentPage === 'menu' && 
                typeof selectedIndex !== 'undefined' && selectedIndex === 0) {
                console.log('👉 Menú -> Amigos');
                mostrarAmigos();
                if (typeof soundSelect === 'function') soundSelect();
                return;
            }
            
            // Dentro de amigos
            if (pulsarOk()) {
                if (typeof soundSelect === 'function') soundSelect();
                return;
            }
            
            core_onOk();
        };
        
        window.onBack = function() {
            if (pulsarBack()) {
                if (typeof soundBack === 'function') soundBack();
                return;
            }
            core_onBack();
        };
        
        window.onUp = function() {
            if (navegarArriba()) {
                if (typeof soundNav === 'function') soundNav();
                return;
            }
            core_onUp();
        };
        
        window.onDown = function() {
            if (navegarAbajo()) {
                if (typeof soundNav === 'function') soundNav();
                return;
            }
            core_onDown();
        };
        
        console.log('✅ Integración completa');
        
    }, 100);
}

// ==========================================
// INICIO
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initAmigos, 500));
} else {
    setTimeout(initAmigos, 500);
}
