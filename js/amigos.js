// ==========================================
// TOKEJI - MÓDULO 4: AMIGOS + QR
// ==========================================

// Datos locales
let contactos = {};
let amigoSeleccionado = null;

// ==========================================
// INICIALIZACIÓN
// ==========================================

function initAmigos() {
    console.log('👥 Inicializando Amigos...');
    
    // Cargar contactos guardados
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
// CREAR PÁGINAS EN EL DOM
// ==========================================

function crearPaginasAmigos() {
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    // Página Amigos (lista)
    if (!document.getElementById('page-amigos')) {
        const pageAmigos = document.createElement('div');
        pageAmigos.className = 'page amigos-page';
        pageAmigos.id = 'page-amigos';
        pageAmigos.innerHTML = `
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
                    <span class="action-label">Escanear</span>
                </div>
                <div class="action-btn" data-index="1">
                    <span class="action-icon">📱</span>
                    <span class="action-label">Mi QR</span>
                </div>
            </div>
        `;
        screen.appendChild(pageAmigos);
        if (typeof pages !== 'undefined') pages.amigos = pageAmigos;
    }
    
    // Página Escanear QR
    if (!document.getElementById('page-escanear')) {
        const pageEscanear = document.createElement('div');
        pageEscanear.className = 'page escanear-page';
        pageEscanear.id = 'page-escanear';
        pageEscanear.innerHTML = `
            <div class="escanear-header">
                <div class="escanear-title">ESCANEAR QR</div>
            </div>
            <div class="escanear-area" id="escanear-area">
                <div class="camera-placeholder" id="camera-placeholder">
                    <div class="camera-icon">📷</div>
                    <div class="camera-text">Pulsa OK para activar cámara</div>
                </div>
                <video id="qr-video" style="display:none;width:100%;height:100%;object-fit:cover;border-radius:12px;"></video>
                <canvas id="qr-canvas" style="display:none;"></canvas>
            </div>
            <div class="escanear-hint">Apunta al QR de tu amigo</div>
            <div class="escanear-manual">
                <div class="manual-btn" id="btn-manual">⌨️ Introducir código manual</div>
            </div>
        `;
        screen.appendChild(pageEscanear);
        if (typeof pages !== 'undefined') pages.escanear = pageEscanear;
    }
    
    // Página Mi QR
    if (!document.getElementById('page-miqr')) {
        const pageMiQR = document.createElement('div');
        pageMiQR.className = 'page miqr-page';
        pageMiQR.id = 'page-miqr';
        pageMiQR.innerHTML = `
            <div class="miqr-header">
                <div class="miqr-title">MI CÓDIGO</div>
            </div>
            <div class="miqr-area">
                <div class="qr-container" id="qr-container">
                    <div class="qr-loading">Generando...</div>
                </div>
                <div class="miqr-info">
                    <div class="miqr-name" id="miqr-name">Usuario</div>
                    <div class="miqr-id" id="miqr-id">ID: ----</div>
                </div>
            </div>
            <div class="miqr-hint">Muéstralo a tus amigos para que te escaneen</div>
        `;
        screen.appendChild(pageMiQR);
        if (typeof pages !== 'undefined') pages.miqr = pageMiQR;
    }
}

// ==========================================
// ESTILOS CSS
// ==========================================

function addAmigosStyles() {
    if (document.getElementById('amigos-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'amigos-styles';
    style.textContent = `
        /* Página Amigos */
        .amigos-page { padding: 40px 15px 15px 15px; }
        .amigos-page.active { display: flex; flex-direction: column; }
        
        .amigos-header {
            text-align: center;
            margin-bottom: 15px;
        }
        
        .amigos-title {
            font-size: 18px;
            font-weight: 900;
            color: var(--text-color);
        }
        
        .amigos-count {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 4px;
            font-weight: 700;
        }
        
        .amigos-list {
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 15px;
        }
        
        .amigos-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            opacity: 0.6;
        }
        
        .empty-icon {
            font-size: 50px;
            margin-bottom: 10px;
        }
        
        .empty-text {
            font-size: 16px;
            font-weight: 800;
            color: var(--text-color);
        }
        
        .empty-hint {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 5px;
        }
        
        .amigo-item {
            background: white;
            border-radius: 12px;
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 0 #e2e8f0;
            border: 3px solid transparent;
            transition: all 0.2s;
        }
        
        .amigo-item.selected {
            border-color: #8b5cf6;
            transform: translateX(5px);
            box-shadow: 0 6px 0 #8b5cf6;
            background: #f3f0ff;
        }
        
        .amigo-avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(145deg, #8b5cf6, #7c3aed);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
        }
        
        .amigo-info {
            flex: 1;
            min-width: 0;
        }
        
        .amigo-nombre {
            font-size: 14px;
            font-weight: 800;
            color: var(--text-color);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .amigo-id {
            font-size: 10px;
            color: #94a3b8;
            font-family: monospace;
        }
        
        .amigo-estado {
            width: 10px;
            height: 10px;
            background: #48bb78;
            border-radius: 50%;
            flex-shrink: 0;
        }
        
        .amigos-actions {
            display: flex;
            gap: 10px;
            padding-top: 10px;
            border-top: 2px solid #e2e8f0;
        }
        
        .action-btn {
            flex: 1;
            background: white;
            border-radius: 12px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            box-shadow: 0 4px 0 #e2e8f0;
            border: 3px solid transparent;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .action-btn.selected {
            border-color: #8b5cf6;
            background: #f3f0ff;
            box-shadow: 0 6px 0 #8b5cf6;
            transform: translateY(-2px);
        }
        
        .action-icon {
            font-size: 24px;
        }
        
        .action-label {
            font-size: 11px;
            font-weight: 800;
            color: var(--text-color);
        }
        
        /* Página Escanear */
        .escanear-page { padding: 40px 15px 15px 15px; }
        .escanear-page.active { display: flex; flex-direction: column; }
        
        .escanear-header {
            text-align: center;
            margin-bottom: 15px;
        }
        
        .escanear-title {
            font-size: 18px;
            font-weight: 900;
            color: var(--text-color);
        }
        
        .escanear-area {
            flex: 1;
            background: #1a1a2e;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            margin-bottom: 15px;
            border: 4px solid #8b5cf6;
        }
        
        .camera-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: white;
            opacity: 0.7;
        }
        
        .camera-icon {
            font-size: 60px;
            margin-bottom: 10px;
        }
        
        .camera-text {
            font-size: 14px;
            font-weight: 700;
        }
        
        .escanear-hint {
            text-align: center;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .escanear-manual {
            padding-top: 10px;
            border-top: 2px solid #e2e8f0;
        }
        
        .manual-btn {
            background: white;
            border-radius: 12px;
            padding: 14px;
            text-align: center;
            font-size: 13px;
            font-weight: 800;
            color: var(--text-color);
            box-shadow: 0 4px 0 #e2e8f0;
            border: 3px solid transparent;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .manual-btn.selected {
            border-color: #8b5cf6;
            background: #f3f0ff;
            box-shadow: 0 6px 0 #8b5cf6;
            transform: translateX(5px);
        }
        
        /* Página Mi QR */
        .miqr-page { padding: 40px 15px 15px 15px; }
        .miqr-page.active { display: flex; flex-direction: column; }
        
        .miqr-header {
            text-align: center;
            margin-bottom: 15px;
        }
        
        .miqr-title {
            font-size: 18px;
            font-weight: 900;
            color: var(--text-color);
        }
        
        .miqr-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }
        
        .qr-container {
            background: white;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .qr-container img {
            width: 200px;
            height: 200px;
            display: block;
        }
        
        .qr-loading {
            width: 200px;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            font-weight: 700;
        }
        
        .miqr-info {
            text-align: center;
        }
        
        .miqr-name {
            font-size: 20px;
            font-weight: 900;
            color: var(--text-color);
            margin-bottom: 5px;
        }
        
        .miqr-id {
            font-size: 12px;
            color: #94a3b8;
            font-family: monospace;
            background: #f1f5f9;
            padding: 5px 10px;
            border-radius: 8px;
            display: inline-block;
        }
        
        .miqr-hint {
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            margin-top: 15px;
            font-weight: 600;
        }
        
        /* Modal entrada manual */
        .manual-modal {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
            border-radius: 17px;
            padding: 20px;
        }
        
        .manual-modal.active {
            display: flex;
        }
        
        .manual-box {
            background: white;
            border-radius: 20px;
            padding: 25px;
            width: 100%;
            max-width: 280px;
            text-align: center;
        }
        
        .manual-title {
            font-size: 16px;
            font-weight: 900;
            margin-bottom: 15px;
            color: var(--text-color);
        }
        
        .manual-input {
            width: 100%;
            padding: 12px;
            border: 3px solid #e2e8f0;
            border-radius: 12px;
            font-size: 16px;
            text-align: center;
            font-family: monospace;
            text-transform: uppercase;
            margin-bottom: 15px;
            outline: none;
        }
        
        .manual-input:focus {
            border-color: #8b5cf6;
        }
        
        .manual-buttons {
            display: flex;
            gap: 10px;
        }
        
        .manual-btn-modal {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 4px 0 rgba(0,0,0,0.2);
        }
        
        .manual-btn-cancel {
            background: #e2e8f0;
            color: #64748b;
        }
        
        .manual-btn-confirm {
            background: linear-gradient(145deg, #8b5cf6, #7c3aed);
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// RENDERIZAR LISTA DE AMIGOS
// ==========================================

function renderAmigos() {
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
            <div class="amigo-estado"></div>
        `;
        list.appendChild(div);
    });
}

// ==========================================
// ESCANEAR QR
// ==========================================

let videoStream = null;
let escaneando = false;

function iniciarCamaraQR() {
    const video = document.getElementById('qr-video');
    const placeholder = document.getElementById('camera-placeholder');
    
    if (!video || !placeholder) return;
    
    // Verificar si jsQR está disponible
    if (typeof jsQR === 'undefined') {
        // Cargar librería dinámicamente
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
    const placeholder = document.getElementById('camera-placeholder');
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            videoStream = stream;
            video.srcObject = stream;
            video.style.display = 'block';
            placeholder.style.display = 'none';
            video.play();
            escaneando = true;
            scanFrame();
        })
        .catch(err => {
            console.error('Error cámara:', err);
            placeholder.innerHTML = `
                <div class="camera-icon">❌</div>
                <div class="camera-text">Cámara no disponible</div>
            `;
        });
}

function scanFrame() {
    if (!escaneando) return;
    
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
        detenerCamara();
        procesarQRAmigo(code.data);
        return;
    }
    
    requestAnimationFrame(scanFrame);
}

function detenerCamara() {
    escaneando = false;
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

// ==========================================
// PROCESAR QR Y AÑADIR AMIGO
// ==========================================

function procesarQRAmigo(data) {
    // Formato esperado: "ID|Nombre" o solo "ID"
    const partes = data.split('|');
    const id = partes[0].trim();
    const nombre = partes[1] ? partes[1].trim() : `Amigo_${id.slice(0, 4)}`;
    
    if (!id || id === user?.id) {
        mostrarMensaje('QR inválido', 'error');
        return;
    }
    
    if (contactos[id]) {
        mostrarMensaje('Ya es tu amigo', 'info');
        return;
    }
    
    // Añadir amigo
    contactos[id] = nombre;
    localStorage.setItem('tokeji_contactos', JSON.stringify(contactos));
    
    mostrarMensaje(`¡${nombre} añadido!`, 'success');
    
    // Volver a lista
    setTimeout(() => {
        if (typeof showPage === 'function') showPage('amigos');
        renderAmigos();
    }, 1500);
}

// ==========================================
// ENTRADA MANUAL DE CÓDIGO
// ==========================================

let manualModalOpen = false;

function mostrarEntradaManual() {
    const screen = document.querySelector('.screen');
    
    const modal = document.createElement('div');
    modal.className = 'manual-modal';
    modal.id = 'manual-modal';
    modal.innerHTML = `
        <div class="manual-box">
            <div class="manual-title">INTRODUCIR CÓDIGO</div>
            <input type="text" class="manual-input" id="manual-input" maxlength="20" placeholder="ID DEL AMIGO">
            <div class="manual-buttons">
                <button class="manual-btn-modal manual-btn-cancel" id="btn-cancel-manual">Cancelar</button>
                <button class="manual-btn-modal manual-btn-confirm" id="btn-confirm-manual">Añadir</button>
            </div>
        </div>
    `;
    
    screen.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    manualModalOpen = true;
    
    // Auto-focus
    setTimeout(() => document.getElementById('manual-input')?.focus(), 100);
}

function cerrarManualModal() {
    const modal = document.getElementById('manual-modal');
    if (modal) modal.remove();
    manualModalOpen = false;
}

function confirmarManual() {
    const input = document.getElementById('manual-input');
    const id = input?.value.trim();
    
    if (!id) {
        input.style.borderColor = '#ef4444';
        setTimeout(() => input.style.borderColor = '#e2e8f0', 500);
        return;
    }
    
    procesarQRAmigo(id);
    cerrarManualModal();
}

// ==========================================
// GENERAR MI QR
// ==========================================

function generarMiQR() {
    const container = document.getElementById('qr-container');
    const nameEl = document.getElementById('miqr-name');
    const idEl = document.getElementById('miqr-id');
    
    if (!container || !user) return;
    
    const nombre = user.nombre || 'Usuario';
    const id = user.id || '----';
    
    if (nameEl) nameEl.textContent = nombre;
    if (idEl) idEl.textContent = `ID: ${id}`;
    
    // Generar QR con API
    const qrData = `${id}|${nombre}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    container.innerHTML = `<img src="${qrUrl}" alt="Mi QR" style="width:200px;height:200px;">`;
}

// ==========================================
// NAVEGACIÓN
// ==========================================

let amigosSelected = 0; // 0=Escanear, 1=Mi QR
let amigoListSelected = 0;

function amigosHandleUp() {
    if (manualModalOpen) return true; // Bloquear navegación
    
    const overlay = document.getElementById('manual-modal');
    if (overlay) return true;
    
    if (currentPage === 'amigos') {
        const amigos = Object.keys(contactos);
        if (amigos.length > 0) {
            amigoListSelected = (amigoListSelected - 1 + amigos.length) % amigos.length;
            updateAmigoSelection();
        }
        return true;
    }
    
    if (currentPage === 'escanear') {
        // Nada que navegar
        return true;
    }
    
    return false;
}

function amigosHandleDown() {
    if (manualModalOpen) return true;
    
    if (currentPage === 'amigos') {
        const amigos = Object.keys(contactos);
        if (amigos.length > 0) {
            amigoListSelected = (amigoListSelected + 1) % amigos.length;
            updateAmigoSelection();
        }
        return true;
    }
    
    return false;
}

function updateAmigoSelection() {
    const items = document.querySelectorAll('.amigo-item');
    items.forEach((item, idx) => {
        item.classList.toggle('selected', idx === amigoListSelected);
    });
    
    // Scroll al seleccionado
    const selected = items[amigoListSelected];
    if (selected) {
        selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function updateActionSelection() {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === amigosSelected);
    });
}

function amigosHandleOk() {
    if (manualModalOpen) {
        confirmarManual();
        return true;
    }
    
    if (currentPage === 'amigos') {
        const amigos = Object.keys(contactos);
        
        // Si hay amigos en la lista y no estamos en los botones de abajo
        if (amigos.length > 0 && amigoListSelected < amigos.length) {
            // Seleccionar amigo para enviar toke (futuro)
            amigoSeleccionado = amigos[amigoListSelected];
            mostrarMensaje(`Seleccionado: ${contactos[amigoSeleccionado]}`, 'info');
            return true;
        }
        
        // Botones de acción
        if (amigosSelected === 0) {
            if (typeof showPage === 'function') showPage('escanear');
        } else {
            generarMiQR();
            if (typeof showPage === 'function') showPage('miqr');
        }
        return true;
    }
    
    if (currentPage === 'escanear') {
        // Activar cámara o entrada manual
        const manualBtn = document.getElementById('btn-manual');
        if (manualBtn?.classList.contains('selected')) {
            mostrarEntradaManual();
        } else {
            iniciarCamaraQR();
        }
        return true;
    }
    
    return false;
}

function amigosHandleBack() {
    if (manualModalOpen) {
        cerrarManualModal();
        return true;
    }
    
    if (currentPage === 'escanear') {
        detenerCamara();
        if (typeof showPage === 'function') showPage('amigos');
        return true;
    }
    
    if (currentPage === 'miqr') {
        if (typeof showPage === 'function') showPage('amigos');
        return true;
    }
    
    return false;
}

// ==========================================
// MENSAJES
// ==========================================

function mostrarMensaje(texto, tipo) {
    // Usar el msg del core si existe
    const msg = document.getElementById('msg');
    if (msg) {
        msg.textContent = texto;
        msg.style.color = tipo === 'error' ? '#ef4444' : tipo === 'success' ? '#10b981' : '#8b5cf6';
        setTimeout(() => msg.textContent = '', 3000);
    }
}

// ==========================================
// INTEGRACIÓN CON CORE
// ==========================================

function integrarAmigosConCore() {
    if (typeof onOk !== 'function') {
        setTimeout(integrarAmigosConCore, 100);
        return;
    }
    
    const core_onOk = onOk;
    const core_onBack = onBack;
    const core_onUp = onUp;
    const core_onDown = onDown;
    
    // Modificar menú para ir a amigos
    window.onOk = function() {
        // Menú -> Amigos (índice 0)
        if (typeof currentPage !== 'undefined' && currentPage === 'menu' && 
            typeof selectedIndex !== 'undefined' && selectedIndex === 0) {
            renderAmigos();
            if (typeof showPage === 'function') showPage('amigos');
            if (typeof soundSelect === 'function' && window.audioEnabled) soundSelect();
            return;
        }
        
        // Páginas de amigos
        if (typeof currentPage !== 'undefined' && 
            (currentPage === 'amigos' || currentPage === 'escanear' || currentPage === 'miqr')) {
            if (amigosHandleOk()) {
                if (typeof soundSelect === 'function' && window.audioEnabled) soundSelect();
                return;
            }
        }
        
        core_onOk();
    };
    
    window.onBack = function() {
        if (typeof currentPage !== 'undefined' && 
            (currentPage === 'amigos' || currentPage === 'escanear' || currentPage === 'miqr')) {
            if (amigosHandleBack()) {
                if (typeof soundBack === 'function' && window.audioEnabled) soundBack();
                return;
            }
        }
        core_onBack();
    };
    
    window.onUp = function() {
        if (typeof currentPage !== 'undefined' && 
            (currentPage === 'amigos' || currentPage === 'escanear')) {
            amigosHandleUp();
            if (typeof soundNav === 'function' && window.audioEnabled) soundNav();
            return;
        }
        core_onUp();
    };
    
    window.onDown = function() {
        if (typeof currentPage !== 'undefined' && 
            (currentPage === 'amigos' || currentPage === 'escanear')) {
            amigosHandleDown();
            if (typeof soundNav === 'function' && window.audioEnabled) soundNav();
            return;
        }
        core_onDown();
    };
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