// ==========================================
// TOKEJI - MÓDULO 4: AMIGOS + QR (VERSIÓN DEPURACIÓN)
// ==========================================

// Datos
let contactos = {};
let amigosListIndex = 0;
let amigosActionIndex = 0;
let amigosMode = 'actions'; // Empezamos en botones porque la lista está vacía inicialmente

// ==========================================
// INICIALIZACIÓN
// ==========================================

function initAmigos() {
    console.log('👥 === INICIANDO MÓDULO AMIGOS ===');
    
    // Cargar contactos
    const saved = localStorage.getItem('tokeji_contactos');
    if (saved) {
        try { 
            contactos = JSON.parse(saved); 
            console.log('📋 Contactos cargados:', Object.keys(contactos).length);
        } catch(e) {
            console.error('Error cargando contactos:', e);
        }
    }
    
    // Crear páginas
    crearPaginasAmigos();
    
    // Añadir estilos
    addAmigosStyles();
    
    // Integrar con navegación
    integrarNavegacion();
    
    console.log('✅ === MÓDULO AMIGOS LISTO ===');
}

// ==========================================
// CREAR PÁGINAS
// ==========================================

function crearPaginasAmigos() {
    console.log('📄 Creando páginas de Amigos...');
    
    const screen = document.querySelector('.screen');
    if (!screen) {
        console.error('❌ ERROR: No se encontró .screen');
        return;
    }
    
    // 1. PÁGINA AMIGOS (LISTA)
    if (!document.getElementById('page-amigos')) {
        console.log('  → Creando page-amigos');
        
        const page = document.createElement('div');
        page.className = 'page amigos-page';
        page.id = 'page-amigos';
        page.style.cssText = 'display: none; opacity: 0;'; // Forzar estilo inicial
        
        page.innerHTML = `
            <div class="amigos-container">
                <div class="amigos-header">
                    <div class="amigos-title">MIS AMIGOS</div>
                    <div class="amigos-count" id="amigos-count">0 amigos</div>
                </div>
                
                <div class="amigos-lista" id="amigos-lista">
                    <!-- Aquí va la lista o mensaje vacío -->
                </div>
                
                <div class="amigos-botones">
                    <button class="amigo-btn selected" id="btn-escanear" data-action="escanear">
                        <span class="btn-icon">📷</span>
                        <span class="btn-text">Escanear QR</span>
                    </button>
                    <button class="amigo-btn" id="btn-miqr" data-action="miqr">
                        <span class="btn-icon">📱</span>
                        <span class="btn-text">Mi Código</span>
                    </button>
                </div>
            </div>
        `;
        
        screen.appendChild(page);
        
        // Registrar en pages global
        if (typeof pages !== 'undefined') {
            pages.amigos = page;
            console.log('  ✅ Registrada en pages.amigos');
        } else {
            console.error('  ❌ ERROR: pages no existe');
        }
        
        // También en window para acceso global
        window.pageAmigos = page;
    }
    
    // 2. PÁGINA ESCANEAR (CÁMARA)
    if (!document.getElementById('page-escanear')) {
        console.log('  → Creando page-escanear');
        
        const page = document.createElement('div');
        page.className = 'page escanear-page';
        page.id = 'page-escanear';
        page.style.cssText = 'display: none; opacity: 0; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: black; z-index: 100;';
        
        page.innerHTML = `
            <div class="escanear-header">
                <span>ESCANEAR QR</span>
                <button onclick="cerrarEscanear()" style="background:#ff4444;color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;">✕</button>
            </div>
            <div style="flex:1;position:relative;overflow:hidden;">
                <video id="qr-video" style="width:100%;height:100%;object-fit:cover;" autoplay playsinline></video>
                <canvas id="qr-canvas" style="display:none;"></canvas>
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:200px;height:200px;border:3px solid #00ff00;border-radius:20px;box-shadow:0 0 0 9999px rgba(0,0,0,0.5);"></div>
                <div style="position:absolute;bottom:20px;left:0;right:0;text-align:center;color:white;font-weight:bold;text-shadow:0 2px 4px rgba(0,0,0,0.8);">Apunta al código QR</div>
            </div>
        `;
        
        screen.appendChild(page);
        
        if (typeof pages !== 'undefined') {
            pages.escanear = page;
            console.log('  ✅ Registrada en pages.escanear');
        }
        window.pageEscanear = page;
    }
    
    // 3. PÁGINA MI QR
    if (!document.getElementById('page-miqr')) {
        console.log('  → Creando page-miqr');
        
        const page = document.createElement('div');
        page.className = 'page miqr-page';
        page.id = 'page-miqr';
        page.style.cssText = 'display: none; opacity: 0;';
        
        page.innerHTML = `
            <div class="miqr-container">
                <div class="amigos-header">
                    <div class="amigos-title">MI CÓDIGO QR</div>
                </div>
                <div class="miqr-content">
                    <div class="qr-box" id="qr-box">
                        <div style="padding:20px;color:#94a3b8;">Generando...</div>
                    </div>
                    <div class="miqr-datos">
                        <div id="miqr-nombre" style="font-size:18px;font-weight:900;"></div>
                        <div id="miqr-id" style="font-size:12px;color:#64748b;font-family:monospace;"></div>
                    </div>
                </div>
            </div>
        `;
        
        screen.appendChild(page);
        
        if (typeof pages !== 'undefined') {
            pages.miqr = page;
            console.log('  ✅ Registrada en pages.miqr');
        }
        window.pageMiQR = page;
    }
    
    console.log('✅ Páginas creadas');
}

// ==========================================
// ESTILOS
// ==========================================

function addAmigosStyles() {
    if (document.getElementById('amigos-styles')) return;
    
    console.log('🎨 Añadiendo estilos...');
    
    const style = document.createElement('style');
    style.id = 'amigos-styles';
    style.textContent = `
        /* CONTENEDOR PRINCIPAL */
        .amigos-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 40px 15px 15px;
        }
        
        /* HEADER */
        .amigos-header {
            text-align: center;
            margin-bottom: 15px;
            flex-shrink: 0;
        }
        
        .amigos-title {
            font-size: 20px;
            font-weight: 900;
            color: var(--text-color);
            margin-bottom: 5px;
        }
        
        .amigos-count {
            font-size: 13px;
            color: #8b5cf6;
            font-weight: 700;
        }
        
        /* LISTA DE AMIGOS */
        .amigos-lista {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .amigo-card {
            background: white;
            border-radius: 15px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 0 #e2e8f0;
            border: 3px solid transparent;
            transition: all 0.2s;
        }
        
        .amigo-card.selected {
            border-color: #8b5cf6;
            background: #f3f0ff;
            box-shadow: 0 6px 0 #8b5cf6;
            transform: translateX(5px);
        }
        
        .amigo-avatar {
            width: 45px;
            height: 45px;
            background: linear-gradient(145deg, #8b5cf6, #7c3aed);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .amigo-info {
            flex: 1;
            min-width: 0;
        }
        
        .amigo-nombre {
            font-size: 16px;
            font-weight: 800;
            color: var(--text-color);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .amigo-id {
            font-size: 11px;
            color: #94a3b8;
            font-family: monospace;
            margin-top: 2px;
        }
        
        /* ESTADO VACÍO */
        .amigos-vacio {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            opacity: 0.7;
            text-align: center;
            padding: 20px;
        }
        
        .vacio-icono {
            font-size: 60px;
            margin-bottom: 15px;
        }
        
        .vacio-texto {
            font-size: 18px;
            font-weight: 800;
            color: var(--text-color);
            margin-bottom: 5px;
        }
        
        .vacio-hint {
            font-size: 13px;
            color: #64748b;
        }
        
        /* BOTONES DE ACCIÓN */
        .amigos-botones {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            flex-shrink: 0;
        }
        
        .amigo-btn {
            display: flex;
            align-items: center;
            gap: 15px;
            background: white;
            border: 3px solid transparent;
            border-radius: 15px;
            padding: 15px;
            cursor: pointer;
            box-shadow: 0 4px 0 #e2e8f0;
            transition: all 0.2s;
            text-align: left;
            width: 100%;
        }
        
        .amigo-btn.selected {
            border-color: #8b5cf6;
            background: #f3f0ff;
            box-shadow: 0 6px 0 #8b5cf6;
            transform: translateX(5px);
        }
        
        .btn-icon {
            font-size: 28px;
        }
        
        .btn-text {
            font-size: 16px;
            font-weight: 800;
            color: var(--text-color);
        }
        
        /* PÁGINA ESCANEAR */
        .escanear-page {
            display: none;
            flex-direction: column;
        }
        
        .escanear-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: rgba(0,0,0,0.8);
            color: white;
            flex-shrink: 0;
        }
        
        /* PÁGINA MI QR */
        .miqr-page {
            display: none;
        }
        
        .miqr-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 40px 15px 15px;
        }
        
        .miqr-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }
        
        .qr-box {
            background: white;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        
        .qr-box img {
            width: 200px;
            height: 200px;
            display: block;
        }
        
        .miqr-datos {
            text-align: center;
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Estilos añadidos');
}

// ==========================================
// RENDERIZAR LISTA
// ==========================================

function renderAmigos() {
    console.log('🎨 Renderizando lista de amigos...');
    
    const lista = document.getElementById('amigos-lista');
    const count = document.getElementById('amigos-count');
    
    if (!lista) {
        console.error('❌ ERROR: No se encontró #amigos-lista');
        return;
    }
    if (!count) {
        console.error('❌ ERROR: No se encontró #amigos-count');
        return;
    }
    
    const amigosArray = Object.entries(contactos);
    console.log('  → Amigos encontrados:', amigosArray.length);
    
    count.textContent = `${amigosArray.length} amigo${amigosArray.length !== 1 ? 's' : ''}`;
    
    if (amigosArray.length === 0) {
        console.log('  → Mostrando estado vacío');
        lista.innerHTML = `
            <div class="amigos-vacio">
                <div class="vacio-icono">👻</div>
                <div class="vacio-texto">No tienes amigos aún</div>
                <div class="vacio-hint">Escanea un QR para añadir</div>
            </div>
        `;
        // Si no hay amigos, forzar modo botones
        amigosMode = 'actions';
        amigosListIndex = 0;
    } else {
        console.log('  → Mostrando lista de', amigosArray.length, 'amigos');
        lista.innerHTML = '';
        amigosArray.forEach(([id, nombre], index) => {
            const div = document.createElement('div');
            div.className = 'amigo-card' + (index === 0 ? ' selected' : '');
            div.dataset.id = id;
            div.innerHTML = `
                <div class="amigo-avatar">👤</div>
                <div class="amigo-info">
                    <div class="amigo-nombre">${nombre}</div>
                    <div class="amigo-id">${id}</div>
                </div>
            `;
            lista.appendChild(div);
        });
        amigosMode = 'list';
        amigosListIndex = 0;
    }
    
    updateSeleccionVisual();
}

function updateSeleccionVisual() {
    console.log('🔄 Actualizando selección visual:', amigosMode, 'lista:', amigosListIndex, 'botón:', amigosActionIndex);
    
    // Actualizar tarjetas de amigos
    document.querySelectorAll('.amigo-card').forEach((card, idx) => {
        card.classList.toggle('selected', idx === amigosListIndex && amigosMode === 'list');
    });
    
    // Actualizar botones
    document.querySelectorAll('.amigo-btn').forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === amigosActionIndex && amigosMode === 'actions');
    });
}

// ==========================================
// CÁMARA Y QR
// ==========================================

let videoStream = null;

function iniciarEscanear() {
    console.log('📷 Iniciando escaneo...');
    
    if (typeof showPage === 'function') {
        showPage('escanear');
    } else {
        console.error('❌ showPage no existe');
    }
    
    // Cargar jsQR
    if (typeof jsQR === 'undefined') {
        console.log('  → Cargando librería jsQR...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
        script.onload = () => {
            console.log('  ✅ jsQR cargado');
            iniciarCamara();
        };
        script.onerror = () => {
            console.error('  ❌ Error cargando jsQR');
            alert('Error al cargar la cámara');
        };
        document.head.appendChild(script);
    } else {
        iniciarCamara();
    }
}

function iniciarCamara() {
    const video = document.getElementById('qr-video');
    if (!video) {
        console.error('❌ No se encontró video element');
        return;
    }
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            console.log('✅ Cámara activada');
            videoStream = stream;
            video.srcObject = stream;
            video.play();
            scanFrame();
        })
        .catch(err => {
            console.error('❌ Error cámara:', err);
            alert('No se pudo acceder a la cámara: ' + err.message);
            cerrarEscanear();
        });
}

function scanFrame() {
    if (!videoStream) return;
    
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanFrame);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    
    if (code && code.data) {
        console.log('📱 QR detectado:', code.data);
        detenerCamara();
        procesarQR(code.data);
        return;
    }
    
    requestAnimationFrame(scanFrame);
}

function detenerCamara() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        console.log('📷 Cámara detenida');
    }
}

function cerrarEscanear() {
    detenerCamara();
    if (typeof showPage === 'function') {
        showPage('amigos');
    }
}

function procesarQR(data) {
    const partes = data.split('|');
    const id = partes[0].trim();
    const nombre = partes[1] ? partes[1].trim() : `Amigo_${id.slice(0,4)}`;
    
    if (!id) {
        alert('QR inválido');
        cerrarEscanear();
        return;
    }
    
    if (contactos[id]) {
        alert('Este amigo ya está en tu lista');
        cerrarEscanear();
        return;
    }
    
    contactos[id] = nombre;
    localStorage.setItem('tokeji_contactos', JSON.stringify(contactos));
    
    alert(`✅ ¡${nombre} añadido!`);
    cerrarEscanear();
    renderAmigos();
}

function mostrarMiQR() {
    console.log('📱 Mostrando Mi QR...');
    
    const box = document.getElementById('qr-box');
    const nombreEl = document.getElementById('miqr-nombre');
    const idEl = document.getElementById('miqr-id');
    
    if (!box) {
        console.error('❌ No se encontró qr-box');
        return;
    }
    
    // Obtener datos del usuario
    let userData = null;
    if (typeof user !== 'undefined' && user) {
        userData = user;
    } else {
        // Intentar cargar de localStorage
        const saved = localStorage.getItem('tokeji_user');
        if (saved) {
            try { userData = JSON.parse(saved); } catch(e) {}
        }
    }
    
    const nombre = userData?.nombre || 'Usuario';
    const id = userData?.id || '----';
    
    console.log('  → Usuario:', nombre, 'ID:', id);
    
    if (nombreEl) nombreEl.textContent = nombre;
    if (idEl) idEl.textContent = `ID: ${id}`;
    
    const qrData = `${id}|${nombre}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    box.innerHTML = `<img src="${qrUrl}" alt="Mi QR" onload="console.log('✅ QR cargado')" onerror="console.error('❌ Error cargando QR')">`;
    
    if (typeof showPage === 'function') {
        showPage('miqr');
    }
}

// ==========================================
// NAVEGACIÓN CON BOTONES
// ==========================================

function amigosNavegar(direccion) {
    console.log('🎮 Navegación:', direccion, 'Modo:', amigosMode, 'Página:', currentPage);
    
    if (currentPage !== 'amigos') {
        console.log('  → Ignorado: no estamos en amigos');
        return false;
    }
    
    const totalAmigos = Object.keys(contactos).length;
    const hayAmigos = totalAmigos > 0;
    
    if (direccion === 'arriba') {
        if (amigosMode === 'actions') {
            // Subir a la lista (si hay amigos)
            if (hayAmigos) {
                amigosMode = 'list';
                amigosListIndex = totalAmigos - 1;
                console.log('  → Cambiado a modo lista, índice:', amigosListIndex);
            }
        } else {
            // Mover en la lista
            if (hayAmigos) {
                amigosListIndex = (amigosListIndex - 1 + totalAmigos) % totalAmigos;
                console.log('  → Lista arriba, índice:', amigosListIndex);
            }
        }
    } else if (direccion === 'abajo') {
        if (amigosMode === 'list') {
            // Si estamos en el último amigo, bajar a botones
            if (amigosListIndex >= totalAmigos - 1 || !hayAmigos) {
                amigosMode = 'actions';
                amigosActionIndex = 0;
                console.log('  → Cambiado a modo botones');
            } else {
                amigosListIndex++;
                console.log('  → Lista abajo, índice:', amigosListIndex);
            }
        } else {
            // Cambiar entre botones
            amigosActionIndex = (amigosActionIndex + 1) % 2;
            console.log('  → Botón:', amigosActionIndex);
        }
    }
    
    updateSeleccionVisual();
    return true;
}

function amigosOk() {
    console.log('👆 OK en amigos, modo:', amigosMode);
    
    if (currentPage !== 'amigos') return false;
    
    if (amigosMode === 'actions') {
        if (amigosActionIndex === 0) {
            console.log('  → Iniciar escanear');
            iniciarEscanear();
        } else {
            console.log('  → Mostrar Mi QR');
            mostrarMiQR();
        }
        return true;
    } else {
        // Seleccionar amigo (para futuro)
        const amigos = Object.keys(contactos);
        if (amigos.length > 0) {
            const seleccionado = amigos[amigosListIndex];
            console.log('  → Amigo seleccionado:', seleccionado);
            // Aquí podrías abrir chat o enviar toke
        }
        return true;
    }
}

function amigosBack() {
    console.log('👈 Back desde:', currentPage);
    
    if (currentPage === 'escanear') {
        cerrarEscanear();
        return true;
    }
    if (currentPage === 'miqr') {
        if (typeof showPage === 'function') showPage('amigos');
        return true;
    }
    return false;
}

// ==========================================
// INTEGRACIÓN CON CORE
// ==========================================

function integrarNavegacion() {
    console.log('🔗 Integrando navegación...');
    
    // Esperar a que el core esté listo
    let intentos = 0;
    const maxIntentos = 100;
    
    function intentar() {
        intentos++;
        
        if (typeof onOk !== 'function') {
            if (intentos < maxIntentos) {
                setTimeout(intentar, 50);
                return;
            }
            console.error('❌ No se pudo integrar después de', maxIntentos, 'intentos');
            return;
        }
        
        console.log('✅ Core detectado, integrando...');
        
        // Guardar funciones originales
        const core_onOk = window.onOk;
        const core_onBack = window.onBack;
        const core_onUp = window.onUp;
        const core_onDown = window.onDown;
        
        // Sobreescribir onOk
        window.onOk = function() {
            console.log('🎯 onOk global, currentPage:', currentPage);
            
            // Menú -> Amigos
            if (currentPage === 'menu' && selectedIndex === 0) {
                console.log('  → Menú -> Amigos');
                renderAmigos();
                showPage('amigos');
                soundSelect();
                return;
            }
            
            // Dentro de amigos
            if (currentPage === 'amigos' || currentPage === 'escanear' || currentPage === 'miqr') {
                if (amigosOk()) {
                    soundSelect();
                    return;
                }
            }
            
            core_onOk();
        };
        
        // Sobreescribir onBack
        window.onBack = function() {
            console.log('🎯 onBack global, currentPage:', currentPage);
            
            if (currentPage === 'amigos' || currentPage === 'escanear' || currentPage === 'miqr') {
                if (amigosBack()) {
                    soundBack();
                    return;
                }
            }
            
            core_onBack();
        };
        
        // Sobreescribir onUp
        window.onUp = function() {
            if (amigosNavegar('arriba')) {
                soundNav();
                return;
            }
            core_onUp();
        };
        
        // Sobreescribir onDown
        window.onDown = function() {
            if (amigosNavegar('abajo')) {
                soundNav();
                return;
            }
            core_onDown();
        };
        
        console.log('✅ Navegación integrada correctamente');
    }
    
    intentar();
}

// ==========================================
// INICIO
// ==========================================

console.log('📦 Cargando módulo amigos.js...');

function startAmigos() {
    console.log('🚀 Iniciando...');
    initAmigos();
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(startAmigos, 100));
} else {
    setTimeout(startAmigos, 100);
}
