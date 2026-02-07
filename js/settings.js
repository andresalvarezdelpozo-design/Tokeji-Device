// ==========================================
// TOKEJI - MÓDULO 3: AJUSTES (Carcasa) - CORREGIDO
// ==========================================

const COLORES_CARCASA = [
    { id: 'morado', hex: '#8b5cf6', nombre: 'Morado' },
    { id: 'rosa', hex: '#ec4899', nombre: 'Rosa' },
    { id: 'azul', hex: '#3b82f6', nombre: 'Azul' },
    { id: 'verde', hex: '#10b981', nombre: 'Verde' },
    { id: 'naranja', hex: '#f59e0b', nombre: 'Naranja' },
    { id: 'negro', hex: '#1f2937', nombre: 'Negro' }
];

const OVERLAYS_CARCASA = [
    { id: null, icon: '❌', nombre: 'Ninguna' },
    { id: 'gato', icon: '🐱', nombre: 'Orejas Gato' },
    { id: 'alien', icon: '👽', nombre: 'Antenas Alien' },
    { id: 'diablo', icon: '😈', nombre: 'Cuernos Diablo' },
    { id: 'angel', icon: '👼', nombre: 'Aureola Ángel' },
    { id: 'oso', icon: '🐻', nombre: 'Orejas Oso' }
];

const SETTINGS_ITEMS = [
    { id: 'sound', icon: '🔊', label: 'Sonido', type: 'toggle' },
    { id: 'vibrate', icon: '📳', label: 'Vibración', type: 'toggle' },
    { id: 'color', icon: '🎨', label: 'Color', type: 'color' },
    { id: 'overlay', icon: '👑', label: 'Fundas', type: 'overlay' },
    { id: 'reset', icon: '🗑️', label: 'Reiniciar', type: 'danger' }
];

let settingsSelected = 0;
let colorSelected = 0;
let overlaySelected = 0;
let colorPickerOpen = false;
let overlayPickerOpen = false;
let settingsConfig = {
    sound: true,
    vibrate: true,
    carcasa_color: 'morado',
    overlay: null
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

function initSettings() {
    console.log('🔧 Inicializando Settings...');
    
    const saved = localStorage.getItem('tokeji_config');
    if (saved) {
        try { 
            const parsed = JSON.parse(saved);
            settingsConfig = { ...settingsConfig, ...parsed };
        } catch(e) {}
    }
    
    aplicarColorCarcasa(settingsConfig.carcasa_color);
    aplicarOverlay(settingsConfig.overlay);
    
    crearPaginaSettings();
    addSettingsStyles();
    
    console.log('✅ Settings listo');
}

function crearPaginaSettings() {
    if (document.getElementById('page-settings')) return;
    
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    const page = document.createElement('div');
    page.className = 'page settings-page';
    page.id = 'page-settings';
    page.innerHTML = `
        <div class="settings-header">
            <div class="settings-title">AJUSTES</div>
        </div>
        <div class="settings-list" id="settings-list"></div>
        <div class="settings-hint">▲▼ mover | OK editar | ◄ atrás</div>
    `;
    screen.appendChild(page);
    
    if (typeof pages !== 'undefined') {
        pages.settings = page;
    }
}

function addSettingsStyles() {
    if (document.getElementById('settings-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'settings-styles';
    style.textContent = `
        .settings-page { 
            padding: 35px 12px 12px 12px; 
            display: none;
        }
        .settings-page.active { display: flex; }
        
        .settings-header {
            margin-bottom: 10px;
            padding-top: 5px;
        }
        
        .settings-title {
            text-align: center;
            font-size: 16px;
            font-weight: 900;
            color: var(--text-color);
            margin: 0;
            padding: 0;
        }
        
        .settings-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
            overflow-y: auto;
            padding-right: 2px;
        }
        
        .setting-item {
            background: white;
            border-radius: 12px;
            padding: 10px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 0 #e2e8f0;
            border: 3px solid transparent;
            transition: all 0.2s;
            min-height: 50px;
        }
        
        .setting-item.selected {
            border-color: #8b5cf6;
            transform: translateX(5px);
            box-shadow: 0 6px 0 #8b5cf6;
            background: #f3f0ff;
        }
        
        .setting-item.danger {
            background: linear-gradient(145deg, #fee2e2, #fecaca);
        }
        
        .setting-item.danger.selected {
            border-color: #ef4444;
            background: #fecaca;
            box-shadow: 0 6px 0 #dc2626;
        }
        
        .setting-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 800;
            color: var(--text-color);
            flex-shrink: 0;
        }
        
        .setting-item.danger .setting-label {
            color: #dc2626;
        }
        
        .setting-icon {
            font-size: 18px;
        }
        
        .setting-control {
            flex-shrink: 0;
            margin-left: 8px;
        }
        
        .toggle {
            width: 40px;
            height: 22px;
            background: #e2e8f0;
            border-radius: 11px;
            position: relative;
            transition: background 0.3s;
        }
        
        .toggle.active {
            background: #8b5cf6;
        }
        
        .toggle-dot {
            width: 18px;
            height: 18px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: transform 0.3s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .toggle.active .toggle-dot {
            transform: translateX(18px);
        }
        
        .color-picker-inline {
            display: flex;
            gap: 4px;
        }
        
        .color-dot-sm {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 2px solid transparent;
            transition: all 0.2s;
        }
        
        .color-dot-sm.selected {
            transform: scale(1.1);
            border-color: var(--text-color);
            box-shadow: 0 0 0 2px white, 0 0 0 3px #8b5cf6;
        }
        
        .overlay-preview {
            font-size: 20px;
            background: #f3f0ff;
            border-radius: 8px;
            padding: 4px 8px;
            border: 2px solid #e2e8f0;
        }
        
        .settings-hint {
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            margin-top: 8px;
            font-weight: 600;
        }
        
        /* Overlays del dispositivo */
        .device-overlay {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 40px;
            z-index: 20;
            pointer-events: none;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        .device-overlay.gato::before { content: '🐱'; }
        .device-overlay.alien::before { content: '👽'; position: absolute; top: 5px; left: -30px; font-size: 25px; }
        .device-overlay.alien::after { content: '👽'; position: absolute; top: 5px; right: -30px; font-size: 25px; }
        .device-overlay.diablo::before { content: '😈'; }
        .device-overlay.angel::before { content: '👼'; }
        .device-overlay.oso::before { content: '🐻'; }
        
        /* Pickers */
        .picker-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.85);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
            border-radius: 17px;
            padding: 20px;
        }
        
        .picker-overlay.active {
            display: flex;
        }
        
        .picker-box {
            background: white;
            border-radius: 20px;
            padding: 20px;
            width: 100%;
            max-width: 260px;
        }
        
        .picker-title {
            font-size: 16px;
            font-weight: 900;
            margin-bottom: 15px;
            text-align: center;
            color: var(--text-color);
        }
        
        .color-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .color-option {
            aspect-ratio: 1;
            border-radius: 12px;
            cursor: pointer;
            border: 4px solid transparent;
            transition: all 0.2s;
        }
        
        .color-option.selected {
            transform: scale(1.1);
            border-color: white;
            box-shadow: 0 0 0 3px #8b5cf6;
        }
        
        .overlay-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .overlay-option {
            background: white;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.2s;
            box-shadow: 0 4px 0 #e2e8f0;
        }
        
        .overlay-option.selected {
            border-color: #8b5cf6;
            background: #f3f0ff;
            box-shadow: 0 6px 0 #8b5cf6;
            transform: translateY(-2px);
        }
        
        .overlay-option-icon {
            font-size: 30px;
            display: block;
            margin-bottom: 5px;
        }
        
        .overlay-option-name {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-color);
        }
        
        .picker-hint {
            text-align: center;
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
        }
        
        /* Modal de confirmación estilo Tokeji */
        .tokeji-modal {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 200;
            border-radius: 17px;
        }
        
        .tokeji-modal.active {
            display: flex;
        }
        
        .modal-box {
            background: white;
            border-radius: 20px;
            padding: 25px;
            width: 85%;
            max-width: 240px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        .modal-icon {
            font-size: 40px;
            margin-bottom: 10px;
        }
        
        .modal-title {
            font-size: 16px;
            font-weight: 900;
            color: var(--text-color);
            margin-bottom: 8px;
        }
        
        .modal-text {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 20px;
            line-height: 1.4;
        }
        
        .modal-buttons {
            display: flex;
            gap: 10px;
        }
        
        .modal-btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 4px 0 rgba(0,0,0,0.2);
            transition: all 0.1s;
        }
        
        .modal-btn:active {
            transform: translateY(4px);
            box-shadow: 0 0 0 rgba(0,0,0,0.2);
        }
        
        .modal-btn-cancel {
            background: #e2e8f0;
            color: #64748b;
        }
        
        .modal-btn-danger {
            background: linear-gradient(145deg, #f56565, #e53e3e);
            color: white;
        }
        
        .modal-btn-danger.selected {
            transform: scale(1.05);
            box-shadow: 0 6px 0 #c53030;
        }
    `;
    document.head.appendChild(style);
}

function renderSettingsList() {
    const list = document.getElementById('settings-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    SETTINGS_ITEMS.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'setting-item' + 
            (index === settingsSelected ? ' selected' : '') +
            (item.type === 'danger' ? ' danger' : '');
        
        let controlHTML = '';
        
        if (item.type === 'toggle') {
            const isActive = settingsConfig[item.id];
            controlHTML = `<div class="toggle ${isActive ? 'active' : ''}"><div class="toggle-dot"></div></div>`;
        }
        else if (item.type === 'color') {
            const color = COLORES_CARCASA.find(c => c.id === settingsConfig.carcasa_color) || COLORES_CARCASA[0];
            controlHTML = `<div class="color-picker-inline"><div class="color-dot-sm selected" style="background: ${color.hex}"></div></div>`;
        }
        else if (item.type === 'overlay') {
            const overlay = OVERLAYS_CARCASA.find(o => o.id === settingsConfig.overlay) || OVERLAYS_CARCASA[0];
            controlHTML = `<div class="overlay-preview">${overlay.icon}</div>`;
        }
        else if (item.type === 'danger') {
            controlHTML = `<span style="color: #dc2626; font-size: 12px; font-weight: 800;">›</span>`;
        }
        
        div.innerHTML = `
            <div class="setting-label">
                <span class="setting-icon">${item.icon}</span>
                ${item.label}
            </div>
            <div class="setting-control">${controlHTML}</div>
        `;
        
        list.appendChild(div);
    });
}

// ==========================================
// OVERLAYS (FUNDAS)
// ==========================================

function aplicarOverlay(overlayId) {
    // Eliminar overlay anterior
    const existing = document.querySelector('.device-overlay');
    if (existing) existing.remove();
    
    if (!overlayId) return;
    
    const device = document.getElementById('device');
    if (!device) return;
    
    const overlay = document.createElement('div');
    overlay.className = `device-overlay ${overlayId}`;
    device.appendChild(overlay);
}

function mostrarOverlayPicker() {
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    const picker = document.createElement('div');
    picker.className = 'picker-overlay';
    picker.id = 'overlay-picker';
    
    picker.innerHTML = `
        <div class="picker-box">
            <div class="picker-title">ELIGE FUNDA</div>
            <div class="overlay-grid" id="overlay-grid"></div>
            <div class="picker-hint">▲▼ cambiar | OK seleccionar | ◄ cancelar</div>
        </div>
    `;
    
    screen.appendChild(picker);
    
    const grid = document.getElementById('overlay-grid');
    OVERLAYS_CARCASA.forEach((overlay, idx) => {
        const div = document.createElement('div');
        div.className = 'overlay-option' + (idx === overlaySelected ? ' selected' : '');
        div.innerHTML = `
            <span class="overlay-option-icon">${overlay.icon}</span>
            <span class="overlay-option-name">${overlay.nombre}</span>
        `;
        grid.appendChild(div);
    });
    
    overlaySelected = OVERLAYS_CARCASA.findIndex(o => o.id === settingsConfig.overlay);
    if (overlaySelected === -1) overlaySelected = 0;
    
    setTimeout(() => {
        picker.classList.add('active');
        overlayPickerOpen = true;
    }, 10);
}

function updateOverlaySelection() {
    const options = document.querySelectorAll('.overlay-option');
    options.forEach((opt, idx) => {
        opt.classList.toggle('selected', idx === overlaySelected);
    });
}

function cerrarOverlayPicker() {
    const picker = document.getElementById('overlay-picker');
    if (picker) {
        picker.remove();
        overlayPickerOpen = false;
    }
}

function seleccionarOverlay() {
    const overlay = OVERLAYS_CARCASA[overlaySelected];
    settingsConfig.overlay = overlay.id;
    localStorage.setItem('tokeji_config', JSON.stringify(settingsConfig));
    
    aplicarOverlay(overlay.id);
    cerrarOverlayPicker();
    renderSettingsList();
    if (typeof soundSuccess === 'function') soundSuccess();
}

// ==========================================
// COLOR PICKER
// ==========================================

function mostrarColorPicker() {
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    const picker = document.createElement('div');
    picker.className = 'picker-overlay';
    picker.id = 'color-picker';
    
    picker.innerHTML = `
        <div class="picker-box">
            <div class="picker-title">ELIGE COLOR</div>
            <div class="color-grid" id="color-grid"></div>
            <div class="picker-hint">▲▼ cambiar | OK seleccionar | ◄ cancelar</div>
        </div>
    `;
    
    screen.appendChild(picker);
    
    const grid = document.getElementById('color-grid');
    COLORES_CARCASA.forEach((color, idx) => {
        const div = document.createElement('div');
        div.className = 'color-option' + (idx === colorSelected ? ' selected' : '');
        div.style.background = color.hex;
        grid.appendChild(div);
    });
    
    colorSelected = COLORES_CARCASA.findIndex(c => c.id === settingsConfig.carcasa_color);
    if (colorSelected === -1) colorSelected = 0;
    
    setTimeout(() => {
        picker.classList.add('active');
        colorPickerOpen = true;
    }, 10);
}

function updateColorSelection() {
    const options = document.querySelectorAll('.color-option');
    options.forEach((opt, idx) => {
        opt.classList.toggle('selected', idx === colorSelected);
    });
}

function cerrarColorPicker() {
    const picker = document.getElementById('color-picker');
    if (picker) {
        picker.remove();
        colorPickerOpen = false;
    }
}

function seleccionarColor() {
    const color = COLORES_CARCASA[colorSelected];
    settingsConfig.carcasa_color = color.id;
    localStorage.setItem('tokeji_config', JSON.stringify(settingsConfig));
    
    aplicarColorCarcasa(color.id);
    cerrarColorPicker();
    renderSettingsList();
    if (typeof soundSuccess === 'function') soundSuccess();
}

function aplicarColorCarcasa(colorId) {
    const color = COLORES_CARCASA.find(c => c.id === colorId) || COLORES_CARCASA[0];
    const device = document.getElementById('device');
    if (!device) return;
    
    device.style.background = `linear-gradient(145deg, ${color.hex}dd, ${color.hex}, ${color.hex}bb)`;
}

// ==========================================
// MODAL DE CONFIRMACIÓN
// ==========================================

let modalCallback = null;
let modalSelected = 0;

function mostrarModalConfirmacion(titulo, texto, icono, onConfirm) {
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    modalCallback = onConfirm;
    modalSelected = 0;
    
    const modal = document.createElement('div');
    modal.className = 'tokeji-modal';
    modal.id = 'reset-modal';
    modal.innerHTML = `
        <div class="modal-box">
            <div class="modal-icon">${icono}</div>
            <div class="modal-title">${titulo}</div>
            <div class="modal-text">${texto}</div>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-cancel" id="modal-cancel">Cancelar</button>
                <button class="modal-btn modal-btn-danger selected" id="modal-confirm">Borrar</button>
            </div>
        </div>
    `;
    
    screen.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

function cerrarModal() {
    const modal = document.getElementById('reset-modal');
    if (modal) {
        modal.remove();
        modalCallback = null;
    }
}

function updateModalSelection() {
    const cancel = document.getElementById('modal-cancel');
    const confirm = document.getElementById('modal-confirm');
    if (cancel) cancel.classList.toggle('selected', modalSelected === 0);
    if (confirm) confirm.classList.toggle('selected', modalSelected === 1);
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function settingsHandleUp() {
    if (document.getElementById('reset-modal')) {
        modalSelected = 0;
        updateModalSelection();
        return true;
    }
    
    if (colorPickerOpen) {
        colorSelected = (colorSelected - 1 + COLORES_CARCASA.length) % COLORES_CARCASA.length;
        updateColorSelection();
        return true;
    }
    
    if (overlayPickerOpen) {
        overlaySelected = (overlaySelected - 1 + OVERLAYS_CARCASA.length) % OVERLAYS_CARCASA.length;
        updateOverlaySelection();
        return true;
    }
    
    settingsSelected = (settingsSelected - 1 + SETTINGS_ITEMS.length) % SETTINGS_ITEMS.length;
    renderSettingsList();
    return true;
}

function settingsHandleDown() {
    if (document.getElementById('reset-modal')) {
        modalSelected = 1;
        updateModalSelection();
        return true;
    }
    
    if (colorPickerOpen) {
        colorSelected = (colorSelected + 1) % COLORES_CARCASA.length;
        updateColorSelection();
        return true;
    }
    
    if (overlayPickerOpen) {
        overlaySelected = (overlaySelected + 1) % OVERLAYS_CARCASA.length;
        updateOverlaySelection();
        return true;
    }
    
    settingsSelected = (settingsSelected + 1) % SETTINGS_ITEMS.length;
    renderSettingsList();
    return true;
}

function settingsHandleOk() {
    // Modal de confirmación
    if (document.getElementById('reset-modal')) {
        if (modalSelected === 1 && modalCallback) {
            modalCallback();
        } else {
            cerrarModal();
        }
        return true;
    }
    
    const item = SETTINGS_ITEMS[settingsSelected];
    
    if (item.type === 'toggle') {
        settingsConfig[item.id] = !settingsConfig[item.id];
        localStorage.setItem('tokeji_config', JSON.stringify(settingsConfig));
        renderSettingsList();
        return true;
    }
    
    if (item.type === 'color') {
        mostrarColorPicker();
        return true;
    }
    
    if (item.type === 'overlay') {
        mostrarOverlayPicker();
        return true;
    }
    
    if (item.type === 'danger') {
        mostrarModalConfirmacion(
            '¿REINICIAR?',
            'Se borrarán todos tus datos, amigos, emojis y configuración. Esta acción no se puede deshacer.',
            '🗑️',
            () => {
                localStorage.clear();
                location.reload();
            }
        );
        return true;
    }
    
    return false;
}

function settingsHandleBack() {
    if (document.getElementById('reset-modal')) {
        cerrarModal();
        return true;
    }
    
    if (colorPickerOpen) {
        cerrarColorPicker();
        return true;
    }
    
    if (overlayPickerOpen) {
        cerrarOverlayPicker();
        return true;
    }
    
    return false;
}

// ==========================================
// INTEGRACIÓN CON CORE.JS
// ==========================================

function integrarConCore() {
    console.log('🔗 Integrando Settings...');
    
    if (typeof onOk !== 'function') {
        setTimeout(integrarConCore, 100);
        return;
    }
    
    const core_onOk = onOk;
    const core_onBack = onBack;
    const core_onUp = onUp;
    const core_onDown = onDown;
    
    window.onOk = function() {
        if (typeof currentPage !== 'undefined' && currentPage === 'settings') {
            if (settingsHandleOk()) {
                if (typeof soundSelect === 'function') soundSelect();
                return;
            }
        }
        
        if (typeof currentPage !== 'undefined' && currentPage === 'menu' && 
            typeof selectedIndex !== 'undefined' && selectedIndex === 5) {
            settingsSelected = 0;
            renderSettingsList();
            if (typeof showPage === 'function') showPage('settings');
            if (typeof soundSelect === 'function') soundSelect();
            return;
        }
        
        core_onOk();
    };
    
    window.onBack = function() {
        if (typeof currentPage !== 'undefined' && currentPage === 'settings') {
            if (settingsHandleBack()) {
                if (typeof soundBack === 'function') soundBack();
                return;
            }
            if (typeof showPage === 'function') showPage('menu');
            if (typeof soundBack === 'function') soundBack();
            return;
        }
        
        core_onBack();
    };
    
    window.onUp = function() {
        if (typeof currentPage !== 'undefined' && currentPage === 'settings') {
            settingsHandleUp();
            if (typeof soundNav === 'function') soundNav();
            return;
        }
        core_onUp();
    };
    
    window.onDown = function() {
        if (typeof currentPage !== 'undefined' && currentPage === 'settings') {
            settingsHandleDown();
            if (typeof soundNav === 'function') soundNav();
            return;
        }
        core_onDown();
    };
    
    console.log('✅ Settings integrado');
}

// ==========================================
// INICIO
// ==========================================

function startSettings() {
    initSettings();
    integrarConCore();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(startSettings, 200));
} else {
    setTimeout(startSettings, 200);
}
