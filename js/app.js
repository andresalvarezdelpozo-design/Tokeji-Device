// ==========================================
// TOKEJI - MÓDULO 3: APP (Amigos + QR + Backend)
// ==========================================

// ==========================================
// CONFIGURACIÓN BACKEND
// ==========================================

const BACKEND_URL = window.location.origin; // Mismo dominio en Render
const POLLING_INTERVAL = 8000; // 8 segundos

// ==========================================
// DATOS GLOBALES
// ==========================================

let contactos = {};
let todex = { captured: [], total_toques_enviados: 0, emojis_stats: {} };
let miID = null;

// ==========================================
// INICIALIZACIÓN MÓDULO 3
// ==========================================

function initModulo3() {
    console.log('🎮 Módulo 3: Amigos + QR');
    
    // Cargar datos
    loadLocalData();
    
    // Generar mi ID si no existe
    if (!miID) {
        miID = 'tokeji_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tokeji_id', miID);
    }
    
    console.log('Mi ID:', miID);
    
    // Iniciar polling
    setInterval(verificarToquesRecibidos, POLLING_INTERVAL);
    setTimeout(verificarToquesRecibidos, 2000); // Primera vez a los 2s
    
    // Renderizar páginas nuevas
    renderPaginasModulo3();
}

function loadLocalData() {
    // Contactos
    const savedContacts = localStorage.getItem('tokeji_contacts');
    if (savedContacts) {
        try { contactos = JSON.parse(savedContacts); } catch(e) {}
    }
    
    // TODEX
    const savedTodex = localStorage.getItem('tokeji_todex');
    if (savedTodex) {
        try { 
            todex = JSON.parse(savedTodex);
            if (!todex.emojis_stats) todex.emojis_stats = {};
            if (!todex.captured) todex.captured = [];
        } catch(e) {
            todex = { captured: [], total_toques_enviados: 0, emojis_stats: {} };
        }
    }
    
    // Mi ID
    miID = localStorage.getItem('tokeji_id');
}

function saveContacts() {
    localStorage.setItem('tokeji_contacts', JSON.stringify(contactos));
}

function saveTodex() {
    localStorage.setItem('tokeji_todex', JSON.stringify(todex));
}

// ==========================================
// PÁGINAS NUEVAS (HTML DINÁMICO)
// ==========================================

function renderPaginasModulo3() {
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    // Página Amigos
    const friendsPage = document.createElement('div');
    friendsPage.className = 'page friends-page';
    friendsPage.id = 'page-friends';
    friendsPage.innerHTML = `
        <div class="page-header">
            <div class="page-title">AMIGOS (<span id="friend-count">0</span>)</div>
            <button class="scan-action-btn selected" id="btn-scan-friend">+ ESCANEAR</button>
        </div>
        <div class="friends-list" id="friends-list"></div>
        <div class="page-indicator"><div class="dot active"></div></div>
    `;
    screen.appendChild(friendsPage);
    
    // Página QR
    const qrPage = document.createElement('div');
    qrPage.className = 'page qr-page';
    qrPage.id = 'page-qr';
    qrPage.innerHTML = `
        <div class="qr-tabs">
            <button class="qr-tab selected" data-tab="miqr">MI QR</button>
            <button class="qr-tab" data-tab="escanear">ESCANEAR</button>
        </div>
        <div class="qr-content" id="qr-content">
            <div class="qr-miqr active">
                <div class="qr-box" id="mi-qr-box">
                    <div class="qr-placeholder">Generando...</div>
                </div>
                <div class="qr-hint">Escanea para agregarme</div>
            </div>
            <div class="qr-escanear">
                <div class="scanner-placeholder" id="scanner-area">
                    📷 Toca OK para activar cámara
                </div>
            </div>
        </div>
        <div class="page-indicator"><div class="dot active"></div></div>
    `;
    screen.appendChild(qrPage);
    
    // Añadir estilos CSS dinámicos
    addModulo3Styles();
}

function addModulo3Styles() {
    const style = document.createElement('style');
    style.textContent = `
        /* PÁGINA AMIGOS */
        .friends-page { padding: 0; padding-top: 20px; }
        
        .page-header {
            background: white;
            padding: 10px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #e2e8f0;
            flex-shrink: 0;
        }
        
        .page-title {
            font-size: 14px;
            font-weight: 800;
            color: var(--text-color);
        }
        
        .scan-action-btn {
            background: #8b5cf6;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 3px 0 #6d28d9;
            transition: all 0.1s;
            border: 2px solid transparent;
        }
        
        .scan-action-btn.selected {
            transform: translateY(2px);
            box-shadow: 0 1px 0 #6d28d9;
            background: #7c3aed;
            border-color: white;
        }
        
        .friends-list {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }
        
        .friend-item {
            background: white;
            border-radius: 12px;
            padding: 10px;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.05);
            border: 3px solid transparent;
            transition: all 0.2s;
        }
        
        .friend-item.selected {
            border-color: #8b5cf6;
            transform: translateX(5px);
            background: #f3f0ff;
        }
        
        .friend-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            background: linear-gradient(135deg, #8b5cf6, #a78bfa);
            box-shadow: 0 3px 8px rgba(139, 92, 246, 0.3);
        }
        
        .friend-info { flex: 1; }
        
        .friend-name {
            font-size: 14px;
            font-weight: 800;
            color: var(--text-color);
        }
        
        .friend-status {
            font-size: 11px;
            color: #64748b;
        }
        
        /* PÁGINA QR */
        .qr-page { padding-top: 15px; }
        
        .qr-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            padding: 0 10px;
        }
        
        .qr-tab {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 12px;
            background: white;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 3px 0 #e2e8f0;
        }
        
        .qr-tab.selected {
            background: #8b5cf6;
            color: white;
            box-shadow: 0 3px 0 #6d28d9;
        }
        
        .qr-content { flex: 1; padding: 0 10px; }
        
        .qr-miqr, .qr-escanear {
            display: none;
            flex-direction: column;
            align-items: center;
            height: 100%;
        }
        
        .qr-miqr.active, .qr-escanear.active {
            display: flex;
        }
        
        .qr-box {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            margin-bottom: 10px;
        }
        
        .qr-placeholder {
            width: 150px;
            height: 150px;
            background: #f3f0ff;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #8b5cf6;
        }
        
        .qr-hint {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
        }
        
        .scanner-placeholder {
            width: 100%;
            height: 200px;
            border: 3px dashed #8b5cf6;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #8b5cf6;
            background: #f3f0ff;
        }
        
        .page-indicator {
            display: flex;
            gap: 6px;
            justify-content: center;
            margin-top: auto;
            padding: 10px;
        }
        
        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #cbd5e0;
        }
        
        .dot.active {
            background: #8b5cf6;
            width: 20px;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// FUNCIONALIDAD AMIGOS
// ==========================================

function renderFriendsList() {
    const list = document.getElementById('friends-list');
    const countEl = document.getElementById('friend-count');
    
    if (!list) return;
    
    const friendIds = Object.keys(contactos);
    if (countEl) countEl.textContent = friendIds.length;
    
    list.innerHTML = '';
    
    if (friendIds.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:30px;font-size:13px;">No tienes amigos aún<br>👇 Pulsa + ESCANEAR</div>';
        return;
    }
    
    friendIds.forEach((id, index) => {
        const contacto = contactos[id];
        const div = document.createElement('div');
        div.className = 'friend-item' + (index === 0 ? ' selected' : '');
        div.dataset.id = id;
        
        const animal = ANIMALES_INICIALES.find(a => a.id === contacto.avatar) || ANIMALES_INICIALES[0];
        const estado = ESTADOS.find(e => e.id === contacto.estado) || ESTADOS[0];
        
        div.innerHTML = `
            <div class="friend-avatar">${animal.emoji}</div>
            <div class="friend-info">
                <div class="friend-name">${contacto.nombre}</div>
                <div class="friend-status">${estado.emoji} ${estado.id}</div>
            </div>
        `;
        
        list.appendChild(div);
    });
}

// ==========================================
// FUNCIONALIDAD QR
// ==========================================

let qrTabSelected = 0; // 0=MiQR, 1=Escanear

function updateQrTabs() {
    const tabs = document.querySelectorAll('.qr-tab');
    const contents = document.querySelectorAll('.qr-miqr, .qr-escanear');
    
    tabs.forEach((tab, idx) => {
        tab.classList.toggle('selected', idx === qrTabSelected);
    });
    
    contents.forEach((content, idx) => {
        content.classList.toggle('active', idx === qrTabSelected);
    });
    
    if (qrTabSelected === 0) {
        generarMiQR();
    }
}

function generarMiQR() {
    const box = document.getElementById('mi-qr-box');
    if (!box || !user) return;
    
    const qrData = `${miID}|${user.nombre}`;
    box.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}" style="width:150px;height:150px;" alt="Mi QR">`;
}

// ==========================================
// ESCANEAR QR (Simulado por ahora)
// ==========================================

function iniciarEscaneo() {
    // Simulación: pedir datos manualmente
    const input = prompt('Simulación QR - Introduce ID|Nombre del amigo:');
    if (!input) return;
    
    const partes = input.split('|');
    if (partes.length !== 2) {
        alert('Formato incorrecto. Usa: ID|Nombre');
        return;
    }
    
    const [id, nombre] = partes;
    agregarContacto(id.trim(), nombre.trim().toUpperCase(), 1); // Avatar default 1
}

function agregarContacto(id, nombre, avatarId) {
    if (contactos[id]) {
        alert('Este contacto ya existe');
        return;
    }
    
    contactos[id] = {
        nombre: nombre,
        avatar: avatarId,
        estado: 'disponible',
        ultimo_toque: Date.now()
    };
    
    saveContacts();
    renderFriendsList();
    alert(`¡${nombre} agregado!`);
}

// ==========================================
// POLLING DE TOKES
// ==========================================

async function verificarToquesRecibidos() {
    if (!miID) return;
    
    try {
        const response = await fetch(`${BACKEND_URL}/toques-pendientes?userId=${miID}`);
        const data = await response.json();
        
        if (data.ok && data.toques && data.toques.length > 0) {
            console.log(`📨 ${data.toques.length} toque(s) nuevo(s)`);
            
            data.toques.forEach((toque, i) => {
                setTimeout(() => mostrarToqueRecibido(toque), i * 1500);
            });
        }
    } catch(err) {
        // Silencioso en desarrollo
        console.log('Polling...', err.message);
    }
}

function mostrarToqueRecibido(toque) {
    // Notificación simple (mejorar en Módulo 4)
    const nombreEmisor = contactos[toque.de]?.nombre || 'Desconocido';
    alert(`📨 Toque de ${nombreEmisor}!\nCategoría: ${toque.num}`);
}

// ==========================================
// NAVEGACIÓN ACTUALIZADA
// ==========================================

function onOkModulo3() {
    // Extender navegación del core
    if (currentPage === 'menu') {
        const opciones = ['friends', 'tokes', 'todex', 'qr', 'combates', 'carcasa'];
        const seleccion = opciones[selectedIndex];
        
        if (seleccion === 'friends') {
            showPage('friends');
            renderFriendsList();
            return true;
        }
        if (seleccion === 'qr') {
            showPage('qr');
            updateQrTabs();
            return true;
        }
    }
    
    if (currentPage === 'friends') {
        // OK en + ESCANEAR
        const scanBtn = document.getElementById('btn-scan-friend');
        if (scanBtn && scanBtn.classList.contains('selected')) {
            showPage('qr');
            qrTabSelected = 1; // Ir directo a escanear
            updateQrTabs();
            return true;
        }
    }
    
    if (currentPage === 'qr') {
        if (qrTabSelected === 1) {
            iniciarEscaneo();
            return true;
        }
    }
    
    return false; // No manejado, seguir con navegación normal
}

function onBackModulo3() {
    if (currentPage === 'friends' || currentPage === 'qr') {
        showPage('menu');
        return true;
    }
    return false;
}

function onUpDownModulo3() {
    if (currentPage === 'friends') {
        // Navegar lista amigos
        const friends = document.querySelectorAll('.friend-item');
        const scanBtn = document.getElementById('btn-scan-friend');
        
        // Lógica simple: seleccionar primero escanear, luego amigos
        // (Simplificado para Módulo 3)
        return true;
    }
    
    if (currentPage === 'qr') {
        qrTabSelected = qrTabSelected === 0 ? 1 : 0;
        updateQrTabs();
        return true;
    }
    
    return false;
}

// ==========================================
// INTEGRACIÓN CON CORE
// ==========================================

// Guardar referencias originales
const originalOnOk = onOk;
const originalOnBack = onBack;
const originalOnUp = onUp;
const originalOnDown = onDown;

// Sobrescribir con extensión
onOk = function() {
    initAudio();
    if (onOkModulo3()) return;
    originalOnOk();
};

onBack = function() {
    if (onBackModulo3()) {
        soundBack();
        return;
    }
    originalOnBack();
};

onUp = function() {
    if (currentPage === 'qr') {
        onUpDownModulo3();
        soundNav();
        return;
    }
    originalOnUp();
};

onDown = function() {
    if (currentPage === 'qr') {
        onUpDownModulo3();
        soundNav();
        return;
    }
    originalOnDown();
};

// Iniciar cuando DOM listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModulo3);
} else {
    initModulo3();
}