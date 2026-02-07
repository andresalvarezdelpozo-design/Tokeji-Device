// ==========================================
// TOKEJI - MÓDULO 4: AMIGOS + QR (CON CÁMARA REAL)
// ==========================================

let contactos = {};
let amigoSeleccionado = null;
let amigosListIndex = 0;
let amigosActionIndex = 0;
let amigosMode = 'list';

// ==========================================
// INICIALIZACIÓN
// ==========================================

function initAmigos() {
    console.log('👥 Inicializando Amigos...');
    
    const saved = localStorage.getItem('tokeji_contactos');
    if (saved) {
        try { contactos = JSON.parse(saved); } catch(e) {}
    }
    
    crearPaginasAmigos();
    addAmigosStyles();
    integrarAmigosConCore();
    
    console.log('✅ Amigos listo');
}

// ==========================================
// CREAR PÁGINAS
// ==========================================

function crearPaginasAmigos() {
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    // Página Amigos
    if (!document.getElementById('page-amigos')) {
        const page = document.createElement('div');
        page.className = 'page amigos-page';
        page.id = 'page-amigos';
        page.innerHTML = `
            <div class="amigos-header">
                <div class="amigos-title">MIS AMIGOS</div>
                <div class="amigos-count" id="amigos-count">0 amigos</div>
            </div>
            <div class="amigos-list" id="amigos-list">
                <div class="amigos-empty">
                    <div class="empty-icon">👻</div>
                    <div class="empty-text">No tienes amigos aún</div>
                    <div class="empty-hint">Escanea un QR para añadir</div>
                </div>
            </div>
            <div class="amigos-actions">
                <div class="action-btn selected" data-index="0">
                    <span class="action-icon">📷</span>
                    <span class="action-label">Escanear QR</span>
                </div>
                <div class="action-btn" data-index="1">
                    <span class="action-icon">📱</span>
                    <span class="action-label">Mi Código</span>
                </div>
            </div>
        `;
        screen.appendChild(page);
        if (typeof pages !== 'undefined') pages.amigos = page;
    }
    
    // Página Escanear (con cámara real)
    if (!document.getElementById('page-escanear')) {
        const page = document.createElement('div');
        page.className = 'page escanear-page';
        page.id = 'page-escanear';
        page.innerHTML = `
            <div class="escanear-header">
                <div class="escanear-title">ESCANEAR QR</div>
                <button class="cerrar-btn" onclick="cerrarEscanear()">✕</button>
            </div>
            <div class="escanear-container">
                <video id="qr-video" autoplay playsinline></video>
                <canvas id="qr-canvas" style="display:none;"></canvas>
                <div class="escanear-overlay">
                    <div class="marco-qr"></div>
                    <div class="escanear-texto">Apunta al código QR</div>
                </div>
            </div>
        `;
        screen.appendChild(page);
        if (typeof pages !== 'undefined') pages.escanear = page;
    }
    
    // Página Mi QR
    if (!document.getElementById('page-miqr')) {
        const page = document.createElement('div');
        page.className = 'page miqr-page';
        page.id = 'page-miqr';
        page.innerHTML = `
            <div class="miqr-header">
                <div class="miqr-title">MI CÓDIGO QR</div>
            </div>
            <div class="miqr-content">
                <div class="qr-display" id="qr-display"></div>
                <div class="miqr-datos">
                    <div class="miqr-nombre" id="miqr-nombre"></div>
                    <div class="miqr-id" id="miqr-id"></div>
                </div>
                <div class="miqr-instruccion">Muéstralo a tus amigos para que te escaneen</div>
            </div>
        `;
        screen.appendChild(page);
        if (typeof pages !== 'undefined') pages.miqr = page;
    }
}

// ==========================================
// ESTILOS
// ==========================================

function addAmigosStyles() {
    if (document.getElementById('amigos-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'amigos-styles';
    style.textContent = `
        /* AMIGOS */
        .amigos-page { padding: 40px 15px 15px; display: none; flex-direction: column; height: 100%; }
        .amigos-page.active { display: flex; }
        
        .amigos-header { text-align: center; margin-bottom: 15px; }
        .amigos-title { font-size: 18px; font-weight: 900; color: var(--text-color); }
        .amigos-count { font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 700; }
        
        .amigos-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
        
        .amigos-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; opacity: 0.6; }
        .empty-icon { font-size: 50px; margin-bottom: 10px; }
        .empty-text { font-size: 16px; font-weight: 800; color: var(--text-color); }
        .empty-hint { font-size: 12px; color: #94a3b8; margin-top: 5px; }
        
        .amigo-item { background: white; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 0 #e2e8f0; border: 3px solid transparent; }
        .amigo-item.selected { border-color: #8b5cf6; transform: translateX(5px); box-shadow: 0 6px 0 #8b5cf6; background: #f3f0ff; }
        .amigo-avatar { width: 40px; height: 40px; background: linear-gradient(145deg, #8b5cf6, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .amigo-info { flex: 1; }
        .amigo-nombre { font-size: 14px; font-weight: 800; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .amigo-id { font-size: 10px; color: #94a3b8; font-family: monospace; }
        
        .amigos-actions { display: flex; gap: 10px; padding-top: 10px; border-top: 2px solid #e2e8f0; }
        .action-btn { flex: 1; background: white; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 5px; box-shadow: 0 4px 0 #e2e8f0; border: 3px solid transparent; cursor: pointer; }
        .action-btn.selected { border-color: #8b5cf6; background: #f3f0ff; box-shadow: 0 6px 0 #8b5cf6; transform: translateY(-2px); }
        .action-icon { font-size: 24px; }
        .action-label { font-size: 11px; font-weight: 800; color: var(--text-color); }
        
        /* ESCANEAR */
        .escanear-page { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: black; z-index: 50; display: none; flex-direction: column; }
        .escanear-page.active { display: flex; }
        
        .escanear-header { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(0,0,0,0.8); color: white; }
        .escanear-title { font-size: 16px; font-weight: 800; }
        .cerrar-btn { background: #ff4444; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 16px; cursor: pointer; }
        
        .escanear-container { flex: 1; position: relative; overflow: hidden; }
        #qr-video { width: 100%; height: 100%; object-fit: cover; }
        
        .escanear-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
        .marco-qr { width: 200px; height: 200px; border: 3px solid #00ff00; border-radius: 20px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5); }
        .escanear-texto { color: white; margin-top: 20px; font-size: 14px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
        
        /* MI QR */
        .miqr-page { padding: 40px 15px 15px; display: none; flex-direction: column; height: 100%; }
        .miqr-page.active { display: flex; }
        
        .miqr-header { text-align: center; margin-bottom: 20px; }
        .miqr-title { font-size: 18px; font-weight: 900; color: var(--text-color); }
        
        .miqr-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
        .qr-display { background: white; padding: 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .qr-display img { width: 200px; height: 200px; display: block; }
        
        .miqr-datos { text-align: center; }
        .miqr-nombre { font-size: 20px; font-weight: 900; color: var(--text-color); margin-bottom: 5px; }
        .miqr-id { font-size: 12px; color: #94a3b8; font-family: monospace; background: #f1f5f9; padding: 5px 15px; border-radius: 20px; }
        .miqr-instruccion { font-size: 12px; color: #64748b; text-align: center; font-weight: 600; }
    `;
    document.head.appendChild(style);
}

// ==========================================
// RENDERIZAR AMIGOS
// ==========================================

function renderAmigos() {
    console.log('🎨 Renderizando amigos...');
    
    const list = document.getElementById('amigos-list');
    const count = document.getElementById('amigos-count');
    if (!list || !count) return;
    
    const amigosArray = Object.entries(contactos);
    count.textContent = `${amigosArray.length} amigo${amigosArray.length !== 1 ? 's' : ''}`;
    
    if (amigosArray.length === 0) {
        list.innerHTML = `
            <div class="amigos-empty">
                <div class="empty-icon">👻</div>
                <div class="empty-text">No tienes amigos aún</div>
                <div class="empty-hint">Escanea un QR para añadir</div>
            </div>
        `;
        return;
    }
    
    list.innerHTML = '';
    amigosArray.forEach(([id, nombre], index) => {
        const div = document.createElement('div');
        div.className = 'amigo-item' + (index === 0 ? ' selected' : '');
        div.dataset.id = id;
        div.innerHTML = `
            <div class="amigo-avatar">👤</div>
            <div class="amigo-info">
                <div class="amigo-nombre">${nombre}</div>
                <div class="amigo-id">${id}</div>
            </div>
        `;
        list.appendChild(div);
    });
    
    amigosListIndex = 0;
    amigosMode = 'list';
    updateAmigosSelection();
}

function updateAmigosSelection() {
    const items = document.querySelectorAll('.amigo-item');
    items.forEach((item, idx) => {
        item.classList.toggle('selected', idx === amigosListIndex && amigosMode === 'list');
    });
    
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === amigosActionIndex && amigosMode === 'actions');
    });
}

// ==========================================
// CÁMARA QR (IGUAL QUE DAME UN TOQUE)
// ==========================================

let videoStream = null;

function iniciarEscanear() {
    console.log('📷 Iniciando cámara...');
    
    // Mostrar página
    if (typeof showPage === 'function') {
        showPage('escanear');
    } else {
        // Fallback si showPage no existe
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-escanear')?.classList.add('active');
        if (typeof currentPage !== 'undefined') currentPage = 'escanear';
    }
    
    // Cargar jsQR si no está
    if (typeof jsQR === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
        script.onload = () => activarCamara();
        document.head.appendChild(script);
    } else {
        activarCamara();
    }
}

function activarCamara() {
    const video = document.getElementById('qr-video');
    if (!video) return;
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            videoStream = stream;
            video.srcObject = stream;
            video.play();
            scanQRFrame();
        })
        .catch(err => {
            console.error('Error cámara:', err);
            alert('No se pudo acceder a la cámara: ' + err.message);
            cerrarEscanear();
        });
}

function scanQRFrame() {
    if (!videoStream) return;
    
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanQRFrame);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    
    if (code && code.data) {
        detenerCamara();
        procesarQR(code.data);
        return;
    }
    
    requestAnimationFrame(scanQRFrame);
}

function detenerCamara() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

function cerrarEscanear() {
    detenerCamara();
    if (typeof showPage === 'function') {
        showPage('amigos');
    } else {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-amigos')?.classList.add('active');
        if (typeof currentPage !== 'undefined') currentPage = 'amigos';
    }
}

function procesarQR(data) {
    console.log('📱 QR detectado:', data);
    
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

// ==========================================
// MI QR
// ==========================================

function mostrarMiQR() {
    const display = document.getElementById('qr-display');
    const nombreEl = document.getElementById('miqr-nombre');
    const idEl = document.getElementById('miqr-id');
    
    if (!display || !user) return;
    
    const nombre = user.nombre || 'Usuario';
    const id = user.id || '----';
    
    if (nombreEl) nombreEl.textContent = nombre;
    if (idEl) idEl.textContent = `ID: ${id}`;
    
    const qrData = `${id}|${nombre}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    display.innerHTML = `<img src="${qrUrl}" alt="Mi QR">`;
    
    if (typeof showPage === 'function') {
        showPage('miqr');
    }
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function amigosHandleUp() {
    if (currentPage !== 'amigos') return false;
    
    const totalAmigos = Object.keys(contactos).length;
    
    if (amigosMode === 'actions') {
        amigosMode = 'list';
        amigosListIndex = Math.max(0, totalAmigos - 1);
    } else if (totalAmigos > 0) {
        amigosListIndex = (amigosListIndex - 1 + totalAmigos) % totalAmigos;
    }
    
    updateAmigosSelection();
    return true;
}

function amigosHandleDown() {
    if (currentPage !== 'amigos') return false;
    
    const totalAmigos = Object.keys(contactos).length;
    
    if (amigosMode === 'list') {
        if (amigosListIndex >= totalAmigos - 1) {
            amigosMode = 'actions';
            amigosActionIndex = 0;
        } else {
            amigosListIndex++;
        }
    } else {
        amigosActionIndex = (amigosActionIndex + 1) % 2;
    }
    
    updateAmigosSelection();
    return true;
}

function amigosHandleOk() {
    if (currentPage === 'amigos') {
        if (amigosMode === 'actions') {
            if (amigosActionIndex === 0) {
                iniciarEscanear();
            } else {
                mostrarMiQR();
            }
        } else {
            const amigos = Object.keys(contactos);
            if (amigos.length > 0) {
                amigoSeleccionado = amigos[amigosListIndex];
                console.log('Amigo seleccionado:', amigoSeleccionado);
            }
        }
        return true;
    }
    return false;
}

function amigosHandleBack() {
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

function integrarAmigosConCore() {
    if (typeof onOk !== 'function') {
        setTimeout(integrarAmigosConCore, 100);
        return;
    }
    
    console.log('🔗 Integrando Amigos...');
    
    const core_onOk = window.onOk;
    const core_onBack = window.onBack;
    const core_onUp = window.onUp;
    const core_onDown = window.onDown;
    
    window.onOk = function() {
        // Menú -> Amigos
        if (currentPage === 'menu' && selectedIndex === 0) {
            console.log('👉 Menú -> Amigos');
            renderAmigos();
            showPage('amigos');
            if (typeof soundSelect === 'function') soundSelect();
            return;
        }
        
        // Páginas de amigos
        if (['amigos', 'escanear', 'miqr'].includes(currentPage)) {
            if (amigosHandleOk()) {
                if (typeof soundSelect === 'function') soundSelect();
                return;
            }
        }
        
        core_onOk();
    };
    
    window.onBack = function() {
        if (['amigos', 'escanear', 'miqr'].includes(currentPage)) {
            if (amigosHandleBack()) {
                if (typeof soundBack === 'function') soundBack();
                return;
            }
        }
        core_onBack();
    };
    
    window.onUp = function() {
        if (currentPage === 'amigos') {
            if (amigosHandleUp()) {
                if (typeof soundNav === 'function') soundNav();
                return;
            }
        }
        core_onUp();
    };
    
    window.onDown = function() {
        if (currentPage === 'amigos') {
            if (amigosHandleDown()) {
                if (typeof soundNav === 'function') soundNav();
                return;
            }
        }
        core_onDown();
    };
    
    console.log('✅ Amigos integrado');
}

// ==========================================
// INICIO
// ==========================================

function startAmigos() {
    initAmigos();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(startAmigos, 300));
} else {
    setTimeout(startAmigos, 300);
}
