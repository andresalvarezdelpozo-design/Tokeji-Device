// ==========================================
// TOKEJI - MÓDULO 2: CORE COMPLETO (CORREGIDO)
// ==========================================

// ==========================================
// DATOS
// ==========================================

const ANIMALES_INICIALES = [
    { id: 1, emoji: "🐱", nombre: "Gato" },
    { id: 2, emoji: "🐶", nombre: "Perro" },
    { id: 3, emoji: "🦊", nombre: "Zorro" },
    { id: 4, emoji: "🐰", nombre: "Conejo" },
    { id: 5, emoji: "🐼", nombre: "Panda" }
];

const ESTADOS = [
    { id: "disponible", emoji: "🟢", color: "#48bb78" },
    { id: "ocupado", emoji: "🟠", color: "#ed8936" },
    { id: "clase", emoji: "🔵", color: "#4299e1" },
    { id: "durmiendo", emoji: "🟣", color: "#9f7aea" },
    { id: "no_molestar", emoji: "🔴", color: "#fc8181" }
];

// ==========================================
// ESTADO
// ==========================================

let currentPage = 'splash';
let selectedIndex = 0;
let consentSelected = 0;
let isFirstTime = false;
let tempUser = {};
let user = null;

// Referencias DOM
let pages = {};
let buttons = {};

// ==========================================
// AUDIO
// ==========================================

let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.log('Audio no disponible');
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, duration, type = 'sine') {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
}

function soundNav() { playTone(800, 0.05); vibrate(10); }
function soundSelect() { playTone(1200, 0.1); vibrate(20); }
function soundBack() { playTone(600, 0.08); vibrate(15); }
function soundError() { playTone(200, 0.3, 'sawtooth'); vibrate([100, 100]); }
function soundSuccess() { 
    playTone(523, 0.1); 
    setTimeout(() => playTone(659, 0.1), 100);
    vibrate([50, 50, 50]);
}

function vibrate(pattern) {
    if ('vibrate' in navigator) {
        try { navigator.vibrate(pattern); } catch(e) {}
    }
}

// ==========================================
// LOCALSTORAGE
// ==========================================

function saveUser(data) {
    localStorage.setItem('tokeji_user', JSON.stringify(data));
}

function loadUser() {
    try {
        const data = localStorage.getItem('tokeji_user');
        return data ? JSON.parse(data) : null;
    } catch(e) {
        return null;
    }
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function showPage(pageName) {
    console.log('Mostrando página:', pageName);
    
    // Ocultar todas
    Object.values(pages).forEach(page => {
        if (page) {
            page.classList.remove('active');
            page.style.opacity = '0';
        }
    });
    
    // Mostrar target
    const target = pages[pageName];
    if (target) {
        target.classList.add('active');
        setTimeout(() => target.style.opacity = '1', 10);
        currentPage = pageName;
        selectedIndex = 0;
        
        // Inicializar página específica
        if (pageName === 'setup-avatar') {
            renderAnimals();
        } else if (pageName === 'home') {
            updateHome();
        } else if (pageName === 'menu') {
            updateMenu();
        } else if (pageName === 'consent') {
            updateConsent();
        }
    }
}

// ==========================================
// RENDER
// ==========================================

function renderAnimals() {
    const grid = document.getElementById('animals-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    ANIMALES_INICIALES.forEach((animal, index) => {
        const div = document.createElement('div');
        div.className = 'animal-option' + (index === 0 ? ' selected' : '');
        div.textContent = animal.emoji;
        div.dataset.index = index;
        grid.appendChild(div);
    });
    selectedIndex = 0;
}

function updateAnimals() {
    const options = document.querySelectorAll('.animal-option');
    options.forEach((opt, idx) => {
        opt.classList.toggle('selected', idx === selectedIndex);
    });
}

function updateMenu() {
    const buttons = document.querySelectorAll('.menu-btn');
    buttons.forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === selectedIndex);
    });
}

function updateConsent() {
    const yesBtn = document.getElementById('btn-yes');
    const noBtn = document.getElementById('btn-no');
    if (yesBtn) yesBtn.classList.toggle('selected', consentSelected === 0);
    if (noBtn) noBtn.classList.toggle('selected', consentSelected === 1);
}

function updateHome() {
    if (!user) return;
    
    const animal = ANIMALES_INICIALES.find(a => a.id === user.avatar_inicial) || ANIMALES_INICIALES[0];
    const estado = ESTADOS.find(e => e.id === user.estado) || ESTADOS[0];
    
    const animalEl = document.getElementById('home-animal');
    const nameEl = document.getElementById('home-name');
    const statusEl = document.getElementById('home-status');
    const counterEl = document.getElementById('tokes-counter');
    
    if (animalEl) animalEl.textContent = animal.emoji;
    if (nameEl) nameEl.textContent = user.nombre;
    if (statusEl) {
        statusEl.textContent = `${estado.emoji} ${estado.id.charAt(0).toUpperCase() + estado.id.slice(1)}`;
        statusEl.style.background = `linear-gradient(145deg, ${estado.color}, ${estado.color}dd)`;
    }
    if (counterEl) counterEl.textContent = `🎯 ${user.tokes_hoy}/30`;
}

// ==========================================
// ACCIONES
// ==========================================

function onUp() {
    console.log('UP en', currentPage);
    
    if (currentPage === 'consent') {
        consentSelected = 0;
        updateConsent();
        soundNav();
    }
    else if (currentPage === 'setup-avatar') {
        selectedIndex = (selectedIndex - 1 + ANIMALES_INICIALES.length) % ANIMALES_INICIALES.length;
        updateAnimals();
        soundNav();
    }
    else if (currentPage === 'menu') {
        selectedIndex = (selectedIndex - 1 + 6) % 6;
        updateMenu();
        soundNav();
    }
    else if (currentPage === 'home' && user) {
        const idx = ESTADOS.findIndex(e => e.id === user.estado);
        user.estado = ESTADOS[(idx - 1 + ESTADOS.length) % ESTADOS.length].id;
        saveUser(user);
        updateHome();
        soundNav();
    }
}

function onDown() {
    console.log('DOWN en', currentPage);
    
    if (currentPage === 'consent') {
        consentSelected = 1;
        updateConsent();
        soundNav();
    }
    else if (currentPage === 'setup-avatar') {
        selectedIndex = (selectedIndex + 1) % ANIMALES_INICIALES.length;
        updateAnimals();
        soundNav();
    }
    else if (currentPage === 'menu') {
        selectedIndex = (selectedIndex + 1) % 6;
        updateMenu();
        soundNav();
    }
    else if (currentPage === 'home' && user) {
        const idx = ESTADOS.findIndex(e => e.id === user.estado);
        user.estado = ESTADOS[(idx + 1) % ESTADOS.length].id;
        saveUser(user);
        updateHome();
        soundNav();
    }
}

function onOk() {
    console.log('OK en', currentPage);
    
    initAudio();
    
    if (currentPage === 'splash') {
        if (isFirstTime) {
            showPage('consent');
        } else {
            showPage('home');
        }
        soundSelect();
    }
    else if (currentPage === 'consent') {
        if (consentSelected === 0) {
            const checkbox = document.getElementById('consent-check');
            if (checkbox && checkbox.checked) {
                showPage('setup-name');
                soundSuccess();
            } else {
                checkbox.checked = true;
                soundNav();
            }
        } else {
            soundError();
            alert('Debes aceptar para continuar');
        }
    }
    else if (currentPage === 'setup-name') {
        const input = document.getElementById('input-name');
        const nombre = input.value.trim().toUpperCase();
        if (nombre.length >= 2 && nombre.length <= 10) {
            tempUser.nombre = nombre;
            showPage('setup-avatar');
            soundSelect();
        } else {
            soundError();
            input.style.borderColor = '#f56565';
            setTimeout(() => input.style.borderColor = '#e2e8f0', 500);
        }
    }
    else if (currentPage === 'setup-avatar') {
        const animal = ANIMALES_INICIALES[selectedIndex];
        user = {
            nombre: tempUser.nombre,
            avatar_inicial: animal.id,
            avatar_actual: animal.id,
            estado: 'disponible',
            tokes_hoy: 30,
            ultima_fecha: new Date().toDateString(),
            codigo_recuperacion: Math.floor(100000 + Math.random() * 900000).toString()
        };
        saveUser(user);
        isFirstTime = false;
        showPage('home');
        soundSuccess();
    }
    else if (currentPage === 'home') {
        showPage('menu');
        soundSelect();
    }
    else if (currentPage === 'menu') {
        const opciones = ['amigos', 'tokes', 'todex', 'qr', 'combates', 'carcasa'];
        console.log('Seleccionado:', opciones[selectedIndex]);
        soundSelect();
    }
}

function onBack() {
    console.log('BACK en', currentPage);
    soundBack();
    
    if (currentPage === 'setup-name') {
        showPage('consent');
    }
    else if (currentPage === 'setup-avatar') {
        showPage('setup-name');
    }
    else if (currentPage === 'menu') {
        showPage('home');
    }
    else if (currentPage === 'home') {
        // No volver a splash
    }
}

// ==========================================
// EVENTOS
// ==========================================

function pressButton(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 150);
}

function initEvents() {
    console.log('Inicializando eventos...');
    
    // Botones hardware
    buttons.up = document.getElementById('btn-up');
    buttons.down = document.getElementById('btn-down');
    buttons.back = document.getElementById('btn-back');
    buttons.ok = document.getElementById('btn-ok');
    
    if (buttons.up) {
        buttons.up.addEventListener('click', () => {
            pressButton('btn-up');
            onUp();
        });
    }
    
    if (buttons.down) {
        buttons.down.addEventListener('click', () => {
            pressButton('btn-down');
            onDown();
        });
    }
    
    if (buttons.back) {
        buttons.back.addEventListener('click', () => {
            pressButton('btn-back');
            onBack();
        });
    }
    
    if (buttons.ok) {
        buttons.ok.addEventListener('click', () => {
            pressButton('btn-ok');
            onOk();
        });
    }
    
    // Teclado
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp': onUp(); break;
            case 'ArrowDown': onDown(); break;
            case 'ArrowLeft': onBack(); break;
            case 'Enter': onOk(); break;
        }
    });
    
    // Input nombre
    const nameInput = document.getElementById('input-name');
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') onOk();
        });
    }
    
    console.log('Eventos listos');
}

// ==========================================
// RELOJ
// ==========================================

function updateClock() {
    const clock = document.getElementById('clock');
    if (!clock) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    clock.textContent = h + ':' + m;
}

// ==========================================
// INICIO
// ==========================================

function init() {
    console.log('🎮 Iniciando Tokeji...');
    
    // Cachear páginas
    pages = {
        splash: document.getElementById('page-splash'),
        consent: document.getElementById('page-consent'),
        'setup-name': document.getElementById('page-setup-name'),
        'setup-avatar': document.getElementById('page-setup-avatar'),
        home: document.getElementById('page-home'),
        menu: document.getElementById('page-menu')
    };
    
    // Verificar usuario
    const saved = loadUser();
    if (saved) {
        user = saved;
        isFirstTime = false;
        console.log('Usuario:', user.nombre);
    } else {
        isFirstTime = true;
        console.log('Primera vez');
    }
    
    // Inicializar
    initEvents();
    updateClock();
    setInterval(updateClock, 60000);
    
    // Mostrar splash
    showPage('splash');
    
    console.log('✅ Listo');
}

// Arrancar cuando DOM listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}