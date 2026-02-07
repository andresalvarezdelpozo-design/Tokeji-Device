// ==========================================
// TOKEJI - MÓDULO 3: AJUSTES (VERSIÓN FINAL)
// ==========================================

const COLORES_CARCASA = [
    { id: 'morado', hex: '#8b5cf6', nombre: 'Morado' },
    { id: 'rosa', hex: '#ec4899', nombre: 'Rosa' },
    { id: 'azul', hex: '#3b82f6', nombre: 'Azul' },
    { id: 'verde', hex: '#10b981', nombre: 'Verde' },
    { id: 'naranja', hex: '#f59e0b', nombre: 'Naranja' },
    { id: 'negro', hex: '#1f2937', nombre: 'Negro' }
];

const SETTINGS_ITEMS = [
    { id: 'sound', icon: '🔊', label: 'Sonido', type: 'toggle' },
    { id: 'vibrate', icon: '📳', label: 'Vibración', type: 'toggle' },
    { id: 'color', icon: '🎨', label: 'Color', type: 'color' },
    { id: 'reset', icon: '🗑️', label: 'Reiniciar', type: 'danger' }
];

let settingsSelected = 0;
let colorSelected = 0;
let settingsConfig = {
    sound: true,
    vibrate: true,
    carcasa_color: 'morado'
};

window.audioEnabled = true;

// ==========================================
// INICIALIZACIÓN
// ==========================================

function initSettings() {
    const saved = localStorage.getItem('tokeji_config');
    if (saved) {
        try { 
            settingsConfig = JSON.parse(saved);
            window.audioEnabled = settingsConfig.sound;
        } catch(e) {}
    }
    
    aplicarColorCarcasa(settingsConfig.carcasa_color);
    crearPaginaSettings();
    addSettingsStyles();
}

function crearPaginaSettings() {
    if (document.getElementById('page-settings')) return;
    
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    const page = document.createElement('div');
    page.className = 'page settings-page';
    page.id = 'page-settings';
    page.innerHTML = `
        <div class="settings-title">AJUSTES</div>
        <div class="settings-list" id="settings-list"></div>
        <div class="settings-hint">▲▼ mover | OK editar | ◄ atrás</div>
    `;
    screen.appendChild(page);
    
    if (typeof pages !== 'undefined') pages.settings = page;
}

function addSettingsStyles() {
    if (document.getElementById('settings-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'settings-styles';
    style.textContent = `
        .settings-page { padding: 40px 15px 15px 15px; }
        .settings-page.active { display: flex; }
        
        .settings-title {
            text-align: center;
            font-size: 18px;
            font-weight: 900;
            color: var(--text-color);
            margin-bottom: 20px;
        }
        
        .settings-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex: 1;
            overflow-y: auto;
            width: 100%;
        }
        
        .setting-item {
            background: white;
            border-radius: 12px;
            padding: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 0 #e2e8f0;
            border: 3px solid transparent;
            transition: all 0.2s;
            width: 100%;
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
            gap: 10px;
            font-size: 14px;
            font-weight: 800;
            color: var(--text-color);
        }
        
        .setting-item.danger .setting-label {
            color: #dc2626;
        }
        
        .setting-icon {
            font-size: 20px;
        }
        
        .toggle {
            width: 44px;
            height: 24px;
            background: #e2e8f0;
            border-radius: 12px;
            position: relative;
            transition: background 0.3s;
        }
        
        .toggle.active {
            background: #8b5cf6;
        }
        
        .toggle-dot {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: transform 0.3s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .toggle.active .toggle-dot {
            transform: translateX(20px);
        }
        
        .color-picker-inline {
            display: flex;
            gap: 5px;
        }
        
        .color-dot-sm {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid transparent;
            transition: all 0.2s;
        }
        
        .color-dot-sm.selected {
            transform: scale(1.2);
            border-color: var(--text-color);
            box-shadow: 0 0 0 2px white, 0 0 0 4px #8b5cf6;
        }
        
        .settings-hint {
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            margin-top: 15px;
            font-weight: 600;
        }
        
        .color-picker-overlay {
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
            z-index: 100;
            border-radius: 17px;
            padding: 20px;
        }
        
        .color-picker-overlay.active {
            display: flex;
        }
        
        .color-picker-box {
            background: white;
            border-radius: 20px;
            padding: 20px;
            width: 100%;
            max-width: 260px;
        }
        
        .color-picker-title {
            font-size: 16px;
            font-weight: 900;
            margin-bottom: 15px;
            text-align: center;
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
        
        .tokeji-modal {
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
            z-index: 200;
            border-radius: 17px;
            padding: 20px;
        }
        
        .tokeji-modal.active {
            display: flex;
        }
        
        .modal-box {
            background: white;
            border-radius: 20px;
            padding: 25px;
            width: 100%;
            max-width: 260px;
            text-align: center;
        }
        
        .modal-icon {
            font-size: 40px;
            margin-bottom: 10px;
        }
        
        .modal-title {
            font-size: 16px;
            font-weight: 900;
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
        
        .modal-btn.selected {
            transform: translateY(-2px);
            box-shadow: 0 6px 0 rgba(0,0,0,0.2);
        }
        
        .modal-btn-cancel {
            background: #e2e8f0;
            color: #64748b;
        }
        
        .modal-btn-cancel.selected {
            background: #cbd5e1;
        }
        
        .modal-btn-danger {
            background: linear-gradient(145deg, #f56565, #e53e3e);
            color: white;
        }
        
        .modal-btn-danger.selected {
            background: linear-gradient(145deg, #e53e3e, #c53030);
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
// COLOR PICKER
// ==========================================

function mostrarColorPicker() {
    const screen = document.querySelector('.screen');
    if (!screen) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'color-picker-overlay';
    overlay.id = 'color-picker-overlay';
    
    overlay.innerHTML = `
        <div class="color-picker-box">
            <div class="color-picker-title">ELIGE COLOR</div>
            <div class="color-grid" id="color-grid"></div>
            <div class="settings-hint">▲▼ cambiar | OK seleccionar | ◄ cancelar</div>
        </div>
    `;
    
    screen.appendChild(overlay);
    
    const grid = document.getElementById('color-grid');
    COLORES_CARCASA.forEach((color, idx) => {
        const div = document.createElement('div');
        div.className = 'color-option' + (idx === colorSelected ? ' selected' : '');
        div.style.background = color.hex;
        grid.appendChild(div);
    });
    
    colorSelected = COLORES_CARCASA.findIndex(c => c.id === settingsConfig.carcasa_color);
    if (colorSelected === -1) colorSelected = 0;
    
    setTimeout(() => overlay.classList.add('active'), 10);
}

function updateColorSelection() {
    const options = document.querySelectorAll('.color-option');
    options.forEach((opt, idx) => {
        opt.classList.toggle('selected', idx === colorSelected);
    });
}

function cerrarColorPicker() {
    const overlay = document.getElementById('color-picker-overlay');
    if (overlay) overlay.remove();
}

function seleccionarColor() {
    const color = COLORES_CARCASA[colorSelected];
    settingsConfig.carcasa_color = color.id;
    localStorage.setItem('tokeji_config', JSON.stringify(settingsConfig));
    
    aplicarColorCarcasa(color.id);
    cerrarColorPicker();
    renderSettingsList();
    if (typeof soundSuccess === 'function' && window.audioEnabled) soundSuccess();
}

function aplicarColorCarcasa(colorId) {
    const color = COLORES_CARCASA.find(c => c.id === colorId) || COLORES_CARCASA[0];
    const device = document.getElementById('device');
    if (!device) return;
    
    device.style.background = `linear-gradient(145deg, ${color.hex}dd, ${color.hex}, ${color.hex}bb)`;
}

// ==========================================
// MODAL
// ==========================================

let modalSelected = 0;
let modalCallback = null;

function mostrarModal(titulo, texto, icono, onConfirm) {
    const screen = document.querySelector('.screen');
    if (!screen) {
        if (confirm(texto)) onConfirm();
        return;
    }
    
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
                <button class="modal-btn modal-btn-cancel selected" id="modal-0">Cancelar</button>
                <button class="modal-btn modal-btn-danger" id="modal-1">Borrar</button>
            </div>
        </div>
    `;
    
    screen.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

function cerrarModal() {
    const modal = document.getElementById('reset-modal');
    if (modal) modal.remove();
    modalCallback = null;
}

function updateModalButtons() {
    const btn0 = document.getElementById('modal-0');
    const btn1 = document.getElementById('modal-1');
    if (btn0) btn0.classList.toggle('selected', modalSelected === 0);
    if (btn1) btn1.classList.toggle('selected', modalSelected === 1);
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function settingsHandleUp() {
    if (document.getElementById('reset-modal')) {
        modalSelected = 0;
        updateModalButtons();
        return true;
    }
    
    if (document.getElementById('color-picker-overlay')) {
        colorSelected = (colorSelected - 1 + COLORES_CARCASA.length) % COLORES_CARCASA.length;
        updateColorSelection();
        return true;
    }
    
    settingsSelected = (settingsSelected - 1 + SETTINGS_ITEMS.length) % SETTINGS_ITEMS.length;
    renderSettingsList();
    return true;
}

function settingsHandleDown() {
    if (document.getElementById('reset-modal')) {
        modalSelected = 1;
        updateModalButtons();
        return true;
    }
    
    if (document.getElementById('color-picker-overlay')) {
        colorSelected = (colorSelected + 1) % COLORES_CARCASA.length;
        updateColorSelection();
        return true;
    }
    
    settingsSelected = (settingsSelected + 1) % SETTINGS_ITEMS.length;
    renderSettingsList();
    return true;
}

function settingsHandleOk() {
    if (document.getElementById('reset-modal')) {
        if (modalSelected === 1 && modalCallback) {
            modalCallback();
        } else {
            cerrarModal();
        }
        return true;
    }
    
    if (document.getElementById('color-picker-overlay')) {
        seleccionarColor();
        return true;
    }
    
    const item = SETTINGS_ITEMS[settingsSelected];
    
    if (item.type === 'toggle') {
        settingsConfig[item.id] = !settingsConfig[item.id];
        if (item.id === 'sound') window.audioEnabled = settingsConfig.sound;
        localStorage.setItem('tokeji_config', JSON.stringify(settingsConfig));
        renderSettingsList();
        return true;
    }
    
    if (item.type === 'color') {
        mostrarColorPicker();
        return true;
    }
    
    if (item.type === 'danger') {
        mostrarModal('¿REINICIAR?', 'Se borrarán todos tus datos. Esta acción no se puede deshacer.', '🗑️', () => {
            localStorage.clear();
            location.reload();
        });
        return true;
    }
    
    return false;
}

function settingsHandleBack() {
    if (document.getElementById('reset-modal')) {
        cerrarModal();
        return true;
    }
    
    if (document.getElementById('color-picker-overlay')) {
        cerrarColorPicker();
        return true;
    }
    
    return false;
}

// ==========================================
// INTEGRACIÓN
// ==========================================

function integrarConCore() {
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
                if (typeof soundSelect === 'function' && window.audioEnabled) soundSelect();
                return;
            }
        }
        
        if (typeof currentPage !== 'undefined' && currentPage === 'menu' && 
            typeof selectedIndex !== 'undefined' && selectedIndex === 5) {
            settingsSelected = 0;
            renderSettingsList();
            if (typeof showPage === 'function') showPage('settings');
            if (typeof soundSelect === 'function' && window.audioEnabled) soundSelect();
            return;
        }
        
        core_onOk();
    };
    
    window.onBack = function() {
        if (typeof currentPage !== 'undefined' && currentPage === 'settings') {
            if (settingsHandleBack()) {
                if (typeof soundBack === 'function' && window.audioEnabled) soundBack();
                return;
            }
            if (typeof showPage === 'function') showPage('menu');
            if (typeof soundBack === 'function' && window.audioEnabled) soundBack();
            return;
        }
        core_onBack();
    };
    
    window.onUp = function() {
        if (typeof currentPage !== 'undefined' && currentPage === 'settings') {
            settingsHandleUp();
            if (typeof soundNav === 'function' && window.audioEnabled) soundNav();
            return;
        }
        core_onUp();
    };
    
    window.onDown = function() {
        if (typeof currentPage !== 'undefined' && currentPage === 'settings') {
            settingsHandleDown();
            if (typeof soundNav === 'function' && window.audioEnabled) soundNav();
            return;
        }
        core_onDown();
    };
    
    if (typeof playTone === 'function') {
        const originalPlayTone = playTone;
        window.playTone = function(freq, duration, type) {
            if (!window.audioEnabled) return;
            originalPlayTone(freq, duration, type);
        };
    }
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
