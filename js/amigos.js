// ==========================================
// TOKEJI - MÓDULO 4: AMIGOS + QR (CORREGIDO)
// ==========================================

// Datos locales
let contactos = {};
let amigoSeleccionado = null;
let amigosListIndex = 0;
let amigosActionIndex = 0; // 0=Escanear, 1=Mi QR
let amigosMode = 'list'; // 'list' o 'actions'

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
    
    console.log('✅ Amigos listo, contactos:', Object.keys(contactos).length);
}

// ==========================================
// CREAR PÁGINAS EN EL DOM
// ==========================================

function crearPaginasAmigos() {
    const screen = document.querySelector('.screen');
    if (!screen) {
        console.error('❌ No se encontró .screen');
        return;
    }
    
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
            <div class="amigos-list" id="amigos-list"></div>
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
        
        // Registrar en pages global
        if (typeof pages !== 'undefined') {
            pages.amigos = pageAmigos;
            console.log('✅ Página amigos registrada');
        }
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
                <div class="manual-btn selected" id="btn-manual">⌨️ Introducir código manual</div>
            </div>
        `;
        screen.appendChild(pageEscanear);
        
        if (typeof pages !== 'undefined') {
            pages.escanear = pageEscanear;
        }
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
            <div class="miqr-hint">Muéstralo a tus amigos</div>
        `;
        screen.appendChild(pageMiQR);
        
        if (typeof pages !== 'undefined') {
            pages.miqr = pageMiQR;
        }
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
        .amigos-page { 
            padding: 40px 15px 15px 15px; 
            display: none;
            flex-direction: column;
            height: 100%;
        }
        .amigos-page.active { display: flex; }
        
        .amigos-header {
            text-align: center;
            margin-bottom: 15px;
            flex-shrink: 0;
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
            min-height: 0;
        }
        
        .amigos-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            opacity: 0.6;
            padding: 20px;
        }
        
        .empty-icon {
            font-size: 50px;
            margin-bottom: 10px;
        }
        
        .empty-text {
            font-size: 16px;
            font-weight: 800;
            color: var(--text-color);
            text-align: center;
        }
        
        .empty-hint {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 5px;
            text-align: center;
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
            flex-shrink: 0;
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
            flex-shrink: 0;
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
        .escanear-page { 
            padding: 40px 15px 15px 15px; 
            display: none;
            flex-direction: column;
            height: 100%;
        }
        .escanear-page.active { display: flex; }
        
        .escanear-header {
            text-align: center;
            margin-bottom: 15px;
            flex-shrink: 0;
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
            min-height: 0;
        }
        
        .camera-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: white;
            opacity: 0.7;
            text-align: center;
            padding: 20px;
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
            flex-shrink: 0;
        }
        
        .escanear-manual {
            padding-top: 10px;
            border-top: 2px solid #e2e8f0;
            flex-shrink: 0;
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
        .miqr-page { 
            padding: 40px 15px 15px 15px; 
            display: none;
            flex-direction: column;
            height: 100%;
        }
        .miqr-page.active { display: flex; }
        
        .miqr-header {
            text-align: center;
            margin-bottom: 15px;
            flex-shrink: 0;
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
            min-height: 0;
        }
        
        .qr-container {
            background: white;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .qr-container img {
            width: 180px;
            height: 180px;
            display: block;
        }
        
        .qr-loading {
            width: 180px;
            height: 180px;
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
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// RENDERIZAR LISTA DE AMIGOS
// ==========================================

function renderAmigos() {
    console.log('🎨 Renderizando amigos...');
    
    const list = document.getElementById('amigos-list');
    const count = document.getElementById('amigos-count');
    
    if (!list || !count) {
        console.error('❌ No se encontró lista o contador');
        return;
    }
    
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
    
    amigosListIndex = 0;
    amigosMode = 'list';
    updateAmigosSelection();
}

function updateAmigosSelection() {
    // Actualizar selección en lista
    const items = document.querySelectorAll('.amigo-item');
    items.forEach((item, idx) => {
        item.classList.toggle('selected', idx === amigosListIndex && amigosMode === 'list');
    });
    
    // Actualizar selección en botones de acción
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === amigosActionIndex && amigosMode === 'actions');
    });
    
    // Scroll al seleccionado si es de la lista
    if (amigosMode === 'list') {
        const selected = items[amigosListIndex];
        if (selected) {
            selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// ==========================================
// ESCANEAR QR (SIMPLIFICADO)
// ==========================================

function iniciarEscaneo() {
    alert('📷 Cámara: En una versión final aquí se activaría la cámara.\n\nPor ahora, usa "Introducir código manual" para añadir amigos.');
}

// ==========================================
// AÑADIR AMIGO MANUAL
// ==========================================

function mostrarEntradaManual() {
    const id = prompt('Introduce el ID de tu amigo:\n(Ejemplo: abc123)');
    
    if (!id || !id.trim()) return;
    
    const idLimpio = id.trim();
    
    if (idLimpio === user?.id) {
        alert('❌ No puedes añadirte a ti mismo');
        return;
    }
    
    if (contactos[idLimpio]) {
        alert('⚠️ Este amigo ya está en tu lista');
        return;
    }
    
    // Añadir amigo
    const nombre = `Amigo_${idLimpio.slice(0, 4)}`;
    contactos[idLimpio] = nombre;
    localStorage.setItem('tokeji_contactos', JSON.stringify(contactos));
    
    alert(`✅ ¡${nombre} añadido!`);
    
    // Volver a lista y actualizar
    if (typeof showPage === 'function') {
        showPage('amigos');
        renderAmigos();
    }
}

// ==========================================
// GENERAR MI QR
// ==========================================

function generarMiQR() {
    const container = document.getElementById('qr-container');
    const nameEl = document.getElementById('miqr-name');
    const idEl = document.getElementById('miqr-id');
    
    if (!container || !user) {
        console.error('❌ No hay container o user');
        return;
    }
    
    const nombre = user.nombre || 'Usuario';
    const id = user.id || '----';
    
    if (nameEl) nameEl.textContent = nombre;
    if (idEl) idEl.textContent = `ID: ${id}`;
    
    // Generar QR con API
    const qrData = `${id}|${nombre}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;
    
    container.innerHTML = `<img src="${qrUrl}" alt="Mi QR" style="width:180px;height:180px;">`;
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function amigosHandleUp() {
    if (currentPage === 'amigos') {
        const totalAmigos = Object.keys(contactos).length;
        
        if (amigosMode === 'actions') {
            // Subir de botones a lista
            if (totalAmigos > 0) {
                amigosMode = 'list';
                amigosListIndex = totalAmigos - 1;
            }
        } else {
            // Navegar en lista
            if (totalAmigos > 0) {
                amigosListIndex = (amigosListIndex - 1 + totalAmigos) % totalAmigos;
            }
        }
        updateAmigosSelection();
        return true;
    }
    return false;
}

function amigosHandleDown() {
    if (currentPage === 'amigos') {
        const totalAmigos = Object.keys(contactos).length;
        
        if (amigosMode === 'list') {
            // Si estamos en el último amigo, bajar a botones
            if (amigosListIndex >= totalAmigos - 1) {
                amigosMode = 'actions';
                amigosActionIndex = 0;
            } else {
                // Siguiente amigo
                amigosListIndex++;
            }
        } else {
            // Navegar entre botones
            amigosActionIndex = (amigosActionIndex + 1) % 2;
        }
        updateAmigosSelection();
        return true;
    }
    return false;
}

function amigosHandleOk() {
    if (currentPage === 'amigos') {
        if (amigosMode === 'actions') {
            if (amigosActionIndex === 0) {
                // Escanear
                if (typeof showPage === 'function') showPage('escanear');
            } else {
                // Mi QR
                generarMiQR();
                if (typeof showPage === 'function') showPage('miqr');
            }
        } else {
            // Seleccionar amigo (para futuro: enviar toke)
            const amigos = Object.keys(contactos);
            if (amigos.length > 0) {
                amigoSeleccionado = amigos[amigosListIndex];
                alert(`Seleccionado: ${contactos[amigoSeleccionado]}\n\n(En el futuro podrás enviarle un Toke)`);
            }
        }
        return true;
    }
    
    if (currentPage === 'escanear') {
        const manualBtn = document.querySelector('.manual-btn');
        if (manualBtn?.classList.contains('selected')) {
            mostrarEntradaManual();
        } else {
            iniciarEscaneo();
        }
        return true;
    }
    
    return false;
}

function amigosHandleBack() {
    if (currentPage === 'escanear' || currentPage === 'miqr') {
        if (typeof showPage === 'function') showPage('amigos');
        return true;
    }
    return false;
}

// ==========================================
// INTEGRACIÓN CON CORE
// ==========================================

function integrarAmigosConCore() {
    console.log('🔗 Integrando Amigos con Core...');
    
    // Esperar a que existan las funciones del core
    if (typeof onOk !== 'function') {
        setTimeout(integrarAmigosConCore, 100);
        return;
    }
    
    // Guardar referencias originales
    const core_onOk = window.onOk;
    const core_onBack = window.onBack;
    const core_onUp = window.onUp;
    const core_onDown = window.onDown;
    
    // Sobrescribir onOk
    window.onOk = function() {
        // Menú -> Amigos (índice 0)
        if (typeof currentPage !== 'undefined' && currentPage === 'menu' && 
            typeof selectedIndex !== 'undefined' && selectedIndex === 0) {
            console.log('👉 Navegando a Amigos desde menú');
            renderAmigos();
            if (typeof showPage === 'function') showPage('amigos');
            if (typeof soundSelect === 'function' && window.audioEnabled !== false) soundSelect();
            return;
        }
        
        // Páginas de amigos
        if (typeof currentPage !== 'undefined' && 
            (currentPage === 'amigos' || currentPage === 'escanear' || currentPage === 'miqr')) {
            if (amigosHandleOk()) {
                if (typeof soundSelect === 'function' && window.audioEnabled !== false) soundSelect();
                return;
            }
        }
        
        // Llamar función original
        core_onOk();
    };
    
    // Sobrescribir onBack
    window.onBack = function() {
        if (typeof currentPage !== 'undefined' && 
            (currentPage === 'amigos' || currentPage === 'escanear' || currentPage === 'miqr')) {
            if (amigosHandleBack()) {
                if (typeof soundBack === 'function' && window.audioEnabled !== false) soundBack();
                return;
            }
        }
        core_onBack();
    };
    
    // Sobrescribir onUp
    window.onUp = function() {
        if (typeof currentPage !== 'undefined' && currentPage === 'amigos') {
            if (amigosHandleUp()) {
                if (typeof soundNav === 'function' && window.audioEnabled !== false) soundNav();
                return;
            }
        }
        core_onUp();
    };
    
    // Sobrescribir onDown
    window.onDown = function() {
        if (typeof currentPage !== 'undefined' && currentPage === 'amigos') {
            if (amigosHandleDown()) {
                if (typeof soundNav === 'function' && window.audioEnabled !== false) soundNav();
                return;
            }
        }
        core_onDown();
    };
    
    console.log('✅ Amigos integrado correctamente');
}

// ==========================================
// INICIO
// ==========================================

function startAmigos() {
    initAmigos();
    integrarAmigosConCore();
}

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(startAmigos, 300));
} else {
    setTimeout(startAmigos, 300);
}
