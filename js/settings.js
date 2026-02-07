// ==========================================
// TOKEJI - MÓDULO 3: AJUSTES (Carcasa) - CORREGIDO
// ==========================================
// IMPORTANTE: Este archivo debe cargarse DESPUÉS de core.js
// NO sobrescribe funciones globales, extiende el comportamiento

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
    { id: 'color', icon: '🎨', label: 'Color dispositivo', type: 'color' },
    { id: 'reset', icon: '🗑️', label: 'REINICIAR TODO', type: 'danger' }
];

let settingsSelected = 0;
let colorSelected = 0;
let settingsConfig = {
    sound: true,
    vibrate: true,
    carcasa_color: 'morado'
};

// Variable para saber si el color picker está abierto
let colorPickerOpen = false;

// ==========================================
// INICIALIZACIÓN (llamada desde core.js o al final)
// ==========================================

function initSettingsModule() {
    console.log('🔧 Inicializando Settings Module...');
    
    // Cargar configuración
    const saved = localStorage.getItem('tokeji_config');
    if (saved) {
        try { 
            settingsConfig = JSON.parse(saved); 
        } catch(e) {}
    }
    
    // Aplicar color guardado inmediatamente
    aplicarColorCarcasa(settingsConfig.carcasa_color);
    
    // Crear página de settings en el DOM
    renderSettingsPage();
    
    // Registrar en el sistema de páginas de core.js
    if (typeof pages !== 'undefined') {
        pages.settings = document.getElementById('page-settings');
    }
    
    // Extender las funciones de navegación de core.js (solo si existen)
    extendCoreFunctions();
    
    console.log('✅ Settings Module listo');
}

function renderSettingsPage() {
    // Verificar si ya existe
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
    
    addSettingsStyles();
    renderSettingsList();
}

function addSettingsStyles() {
    if (document.getElementById('settings-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'settings-styles';
    style.textContent = `
        .settings-page { padding: 15px 10px; display: none; }
        .settings-page.active { display: flex; }
        
        .settings-title {
            text-align: center;
            font-size: 18px;
            font-weight: 900;
            color: var(--text-color);
            margin-bottom: 15px;
        }
        
        .settings-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
            overflow-y: auto;
        }
        
        .setting-item {
            background: white;
            border-radius: 12px;
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 0 #e2e8f0;
            border: 3px solid transparent;
            transition: all 0.2s;
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
            cursor: pointer;
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
            margin-top: 10px;
            font-weight: 600;
        }
        
        /* Color picker overlay */
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
        }
        
        .color-picker-overlay.active {
            display: flex;
        }
        
        .color-picker-box {
            background: white;
            border-radius: 20px;
            padding: 20px;
            width: 90%;
            max-width: 280px;
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
        div.dataset.index = index;
        
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
            controlHTML = `<span style="color: #dc2626; font-size: 12px; font-weight: 800;">›››</span>`;
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
// NAVEGACIÓN DENTRO DE SETTINGS
// ==========================================

function handleSettingsUp() {
    if (colorPickerOpen) {
        colorSelected = (colorSelected - 1 + COLORES_CARCASA.length) % COLORES_CARCASA.length;
        updateColorSelection();
        if (typeof soundNav === 'function') soundNav();
        return true;
    }
    
    settingsSelected = (settingsSelected - 1 + SETTINGS_ITEMS.length) % SETTINGS_ITEMS.length;
    renderSettingsList();
    if (typeof soundNav === 'function') soundNav();
    return true;
}

function handleSettingsDown() {
    if (colorPickerOpen) {
        colorSelected = (colorSelected + 1) % COLORES_CARCASA.length;
        updateColorSelection();
        if (typeof soundNav === 'function') soundNav();
        return true;
    }
    
    settingsSelected = (settingsSelected + 1) % SETTINGS_ITEMS.length;
    renderSettingsList();
    if (typeof soundNav === 'function') soundNav();
    return true;
}

function handleSettingsOk() {
    const item = SETTINGS_ITEMS[settingsSelected];
    
    if (item.type === 'toggle') {
        settingsConfig[item.id] = !settingsConfig[item.id];
        localStorage.setItem('tokeji_config', JSON.stringify(settingsConfig));
        renderSettingsList();
        
        // Sincronizar con sistema de audio de core.js si existe
        if (item.id === 'sound' && typeof AudioSys !== 'undefined') {
            AudioSys.enabled = settingsConfig.sound;
        }
        
        if (typeof soundSelect === 'function') soundSelect();
        return true;
    }
    
    if (item.type === 'color') {
        mostrarColorPicker();
        return true;
    }
    
    if (item.type === 'danger') {
        if (confirm('¿Borrar TODOS los datos? Esta acción no se puede deshacer.')) {
            localStorage.clear();
            location.reload();
        }
        return true;
    }
    
    return false;
}

function handleSettingsBack() {
    if (colorPickerOpen) {
        cerrarColorPicker();
        return true;
    }
    // Si no estamos en el color picker, volver al menú
    if (typeof showPage === 'function') {
        showPage('menu');
    }
    return true;
}

// ==========================================
// COLOR PICKER
// ==========================================

function mostrarColorPicker() {
    const screen = document.querySelector('.screen');
    
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
        div.dataset.index = idx;
        grid.appendChild(div);
    });
    
    // Encontrar índice del color actual
    const currentIdx = COLORES_CARCASA.findIndex(c => c.id === settingsConfig.carcasa_color);
    colorSelected = currentIdx !== -1 ? currentIdx : 0;
    updateColorSelection();
    
    setTimeout(() => {
        overlay.classList.add('active');
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
    const overlay = document.getElementById('color-picker-overlay');
    if (overlay) {
        overlay.remove();
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
// INTEGRACIÓN CON CORE.JS (EXTENSIÓN SEGURA)
// ==========================================

function extendCoreFunctions() {
    // Guardar referencias originales SOLO si existen
    const originalOnOk = window.onOk;
    const originalOnBack = window.onBack;
    const originalOnUp = window.onUp;
    const originalOnDown = window.onDown;
    
    // Sobrescribir onOk
    window.onOk = function() {
        if (typeof initAudio === 'function') initAudio();
        
        // Si estamos en settings
        if (window.currentPage === 'settings') {
            if (colorPickerOpen) {
                seleccionarColor();
                return;
            }
            if (handleSettingsOk()) return;
        }
        
        // Si estamos en menú y seleccionamos Carcasa (índice 5)
        if (window.currentPage === 'menu' && window.selectedIndex === 5) {
            if (typeof showPage === 'function') {
                showPage('settings');
                settingsSelected = 0;
                renderSettingsList();
                if (typeof soundSelect === 'function') soundSelect();
                return;
            }
        }
        
        // Llamar original si existe
        if (typeof originalOnOk === 'function') {
            originalOnOk();
        }
    };
    
    // Sobrescribir onBack
    window.onBack = function() {
        // Si estamos en settings
        if (window.currentPage === 'settings') {
            if (handleSettingsBack()) {
                if (typeof soundBack === 'function') soundBack();
                return;
            }
        }
        
        if (typeof originalOnBack === 'function') {
            originalOnBack();
        }
    };
    
    // Sobrescribir onUp
    window.onUp = function() {
        if (window.currentPage === 'settings') {
            handleSettingsUp();
            return;
        }
        
        if (typeof originalOnUp === 'function') {
            originalOnUp();
        }
    };
    
    // Sobrescribir onDown
    window.onDown = function() {
        if (window.currentPage === 'settings') {
            handleSettingsDown();
            return;
        }
        
        if (typeof originalOnDown === 'function') {
            originalOnDown();
        }
    };
}

// ==========================================
// INICIO DIFERIDO (esperar a que core.js esté listo)
// ==========================================

function waitForCoreAndInit() {
    // Verificar si core.js ya cargó (buscamos variables clave)
    if (typeof window.currentPage !== 'undefined' && typeof window.showPage === 'function') {
        initSettingsModule();
    } else {
        // Esperar un poco y reintentar
        setTimeout(waitForCoreAndInit, 50);
    }
}

// Iniciar cuando el DOM esté listo, pero verificar que core.js exista
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(waitForCoreAndInit, 100);
    });
} else {
    setTimeout(waitForCoreAndInit, 100);
}
