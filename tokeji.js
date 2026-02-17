/**
 * TOKEJI v17.0 - JavaScript Core
 * Parte 1: Navegación, D-Pad, páginas básicas
 */

const BACK = "https://tokeji-device.onrender.com";

// Datos globales
const COLORES = [
  { hex: '#FF6B9D', name: 'Rosa', shadow: '#FF4785', gradient: ['#FFB8D0', '#FF6B9D', '#FF4785'] },
  { hex: '#4299E1', name: 'Azul', shadow: '#2B6CB0', gradient: ['#90CDF4', '#4299E1', '#2B6CB0'] },
  { hex: '#48BB78', name: 'Verde', shadow: '#276749', gradient: ['#9AE6B4', '#48BB78', '#276749'] },
  { hex: '#ECC94B', name: 'Amarillo', shadow: '#B7791F', gradient: ['#F6E05E', '#ECC94B', '#B7791F'] },
  { hex: '#9F7AEA', name: 'Morado', shadow: '#6B46C1', gradient: ['#D6BCFA', '#9F7AEA', '#6B46C1'] },
  { hex: '#1A202C', name: 'Negro', shadow: '#000000', gradient: ['#4A5568', '#2D3748', '#1A202C'] },
  { hex: '#C0C0C0', name: 'Metal', shadow: '#808080', gradient: ['#E8E8E8', '#C0C0C0', '#808080'] },
  { hex: '#FF8C42', name: 'Naranja', shadow: '#CC6A2A', gradient: ['#FFB366', '#FF8C42', '#CC6A2A'] }
];

const ESTADOS = [
  { id: 'disponible', emoji: '🟢', label: 'Disponible', color: '#48BB78' },
  { id: 'ocupado', emoji: '🔴', label: 'Ocupado', color: '#F56565' },
  { id: 'ausente', emoji: '🟡', label: 'Ausente', color: '#ECC94B' },
  { id: 'dormido', emoji: '💤', label: 'Dormido', color: '#9F7AEA' }
];

const AVATARES = ['🐱', '🐶', '🦊', '🐼', '🐨', '🐯', '🦁', '🐷', '🐸', '🐙', '🦄', '🐲'];

const EMOJIS_LIST = ['😊','❤️','👍','🔥','💯','🤥','👾','💕','🚀','🎯','🦾','🙌','👏','💋','🐻','🐝','🌈','☀️','🌙','⭐','🌸','📸','🚗','🌷','🍀','🍕','👅','🍟','🌮','🍰','🎂','🍫','☕','🥤','🏀','⚽','🎾','🏆','🎮','🎲','🎸','🎺','🎨','📚','💡','🔧','😱','📱','💻','🛸','🥷','😇','🧟‍♂️','👽','🎩','🧙','🧚','🧜','💃🏻','🦋','🦅','🦈','🐅','🐘','🦒','🦏','🌍','📦','🏴‍☠️','✨','🚨','👑','🦄','🦁','🧌','🦉','🐣','🐉','🐲','🦕','🦖','🌋','🗿','🪄','⚡','💀','👻','🤢','🤡','🎪','🍾','🎆','🎇','🫶','🏃‍♂️','🧟‍♀️','🤖','🧊','😈','🔫','💅','🎐','🎀','🎁','🎰','✈️','🥵','🥶','⌚️','⚓️','🛁','🪒','🪤','💣','🏍️','🍒','🌪️','👙','🧩','🍪','🏎️','🎓','🧸','✂️','🕳️','❤️‍🔥','🥳','⚰️','🎈','🎉','👩🏻‍❤️‍👨','🦊','💦','🚪','🎎','⚠️','🛌','🤮','🫡','💎','🛹','💸','💵','💊','💶','🎟️','⚜️','💳','💿','📀'];

const RAREZAS_TODEX = {
  1: 'comun', 2: 'mitico', 3: 'raro', 4: 'comun', 5: 'raro', 6: 'epico', 7: 'legendario', 8: 'mitico', 9: 'mitico', 10: 'raro',
  11: 'epico', 12: 'epico', 13: 'epico', 14: 'epico', 15: 'raro', 16: 'epico', 17: 'comun', 18: 'raro', 19: 'comun', 20: 'epico',
  21: 'mitico', 22: 'raro', 23: 'legendario', 24: 'mitico', 25: 'epico', 26: 'raro', 27: 'legendario', 28: 'epico', 29: 'legendario', 30: 'raro',
  31: 'comun', 32: 'raro', 33: 'comun', 34: 'mitico', 35: 'epico', 36: 'comun', 37: 'raro', 38: 'epico', 39: 'comun', 40: 'raro',
  41: 'comun', 42: 'epico', 43: 'raro', 44: 'comun', 45: 'mitico', 46: 'comun', 47: 'epico', 48: 'raro', 49: 'comun', 50: 'comun',
  51: 'mitico', 52: 'raro', 53: 'comun', 54: 'epico', 55: 'comun', 56: 'raro', 57: 'legendario', 58: 'epico', 59: 'raro', 60: 'comun',
  61: 'epico', 62: 'mitico', 63: 'comun', 64: 'raro', 65: 'epico', 66: 'comun', 67: 'raro', 68: 'comun', 69: 'mitico', 70: 'epico',
  71: 'raro', 72: 'comun', 73: 'epico', 74: 'raro', 75: 'comun', 76: 'mitico', 77: 'raro', 78: 'epico', 79: 'comun', 80: 'raro',
  81: 'comun', 82: 'epico', 83: 'raro', 84: 'comun', 85: 'mitico', 86: 'raro', 87: 'epico', 88: 'comun', 89: 'raro', 90: 'mitico',
  91: 'epico', 92: 'raro', 93: 'comun', 94: 'legendario', 95: 'epico', 96: 'raro', 97: 'comun', 98: 'mitico', 99: 'epico', 100: 'raro',
  101: 'comun', 102: 'epico', 103: 'raro', 104: 'comun', 105: 'mitico', 106: 'raro', 107: 'epico', 108: 'comun', 109: 'raro', 110: 'comun',
  111: 'epico', 112: 'mitico', 113: 'raro', 114: 'comun', 115: 'epico', 116: 'raro', 117: 'comun', 118: 'mitico', 119: 'raro', 120: 'comun',
  121: 'raro', 122: 'epico', 123: 'mitico', 124: 'raro', 125: 'comun', 126: 'epico', 127: 'legendario', 128: 'mitico', 129: 'raro', 130: 'epico',
  131: 'comun', 132: 'mitico', 133: 'raro', 134: 'epico', 135: 'comun', 136: 'legendario', 137: 'raro', 138: 'epico', 139: 'mitico', 140: 'legendario',
  141: 'epico', 142: 'raro', 143: 'mitico', 144: 'epico', 145: 'legendario', 146: 'mitico', 147: 'raro', 148: 'epico', 149: 'mitico', 150: 'legendario'
};

// Mensajes de sobres (rotativos por día)
const MENSAJES_SOBRES = {
  verde: ["¿Quién te ha hecho reír hoy?", "¿A quién le debes un favor?", "¿Quién es tu compi de clase favorito?", "¿Quién tiene la mejor energía?"],
  azul: ["¿Quién tiene el outfit más 🔥?", "¿Quién crees que tiene un crush secreto?", "¿Quién es el más gracioso sin intentarlo?", "¿Quién haría el mejor cómplice?"],
  morado: ["¿Quién te alegró el día sin saberlo?", "¿Quién es más majo de lo que parece?", "¿Quién crees que piensa en ti ahora?", "¿Quién tiene algo especial que no ven los demás?"],
  blanco: ["Envía un mensaje secreto a alguien de tu instituto..."]
};

// Aplicación principal
const app = {
  state: {
    currentPage: 'splash',
    menuIndex: 0,
    focus: { type: 'splash', index: 0 },
    history: [],
    
    // Settings
    settings: {
      sonido: true,
      vibracion: true,
      color: 0,
      status: 'disponible',
      avatar: '🐱'
    },
    
    // Datos de usuario
    miID: '',
    miNombre: '',
    instituto: '',
    curso: '',
    genero: '',
    
    // Datos de app
    toquesRestantes: 30,
    racha: 0,
    sobresEnviadosHoy: [],
    
    // Estados de navegación
    inSelector: false,
    selectorType: null,
    selectorIndex: 0,
    
    // Estados de página específicos
    avatarIndex: 0,
    colorIndex: 0,
    sobreSeleccionado: null,
    
    // Audio
    audioInitialized: false,
    audioCtx: null,
    
    // Polling
    pollingCombates: null,
    
    // Combate
    combate: {
      modo: null,
      oponenteId: null,
      miEmojiSeleccionado: null,
      desafioPendiente: null,
      selectorAmigoIndex: 0,
      enSelectorAmigo: false,
      selectorEmojiIndex: 0,
      enSelectorEmoji: false
    }
  },
  
  // Datos persistentes
  contactos: {},
  todex: { captured: [1, 2, 3], total_toques_enviados: 0, emojis_stats: {} },
  
  // Inicialización
  init() {
    console.log('=== TOKEJI v17.0 INICIANDO ===');
    
    // Generar/recuperar ID
    this.state.miID = localStorage.getItem("miid");
    if (!this.state.miID) {
      this.state.miID = Math.random().toString(36).substring(2, 12);
      localStorage.setItem("miid", this.state.miID);
    }
    
    // Cargar datos guardados
    this.loadData();
    
    // Aplicar color
    this.applyColor();
    
    // Iniciar reloj
    this.updateClock();
    setInterval(() => this.updateClock(), 60000);
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Mostrar página inicial
    this.determineInitialPage();
    
    // Prevenir comportamientos no deseados
    this.setupPreventDefaults();
  },
  
  loadData() {
    try {
      this.contactos = JSON.parse(localStorage.getItem("cts")) || {};
      this.todex = JSON.parse(localStorage.getItem("todex")) || { captured: [1, 2, 3], total_toques_enviados: 0, emojis_stats: {} };
      if (!this.todex.emojis_stats) this.todex.emojis_stats = {};
      
      this.state.settings.sonido = localStorage.getItem('sonido') !== 'off';
      this.state.settings.vibracion = localStorage.getItem('vibracion') !== 'off';
      this.state.settings.color = parseInt(localStorage.getItem('colorIndex')) || 0;
      this.state.settings.status = localStorage.getItem('status') || 'disponible';
      this.state.settings.avatar = localStorage.getItem('avatar') || '🐱';
      this.state.miNombre = localStorage.getItem('miNombre') || '';
      this.state.instituto = localStorage.getItem('instituto') || '';
      this.state.curso = localStorage.getItem('curso') || '';
      this.state.genero = localStorage.getItem('genero') || '';
      this.state.racha = parseInt(localStorage.getItem('racha')) || 0;
      
      // Reset diario de toques
      const hoy = new Date().toDateString();
      const ultima = localStorage.getItem("ultimaFechaToques");
      if (ultima !== hoy) {
        this.state.toquesRestantes = 30;
        this.state.sobresEnviadosHoy = [];
        localStorage.setItem("toquesRestantes", "30");
        localStorage.setItem("ultimaFechaToques", hoy);
        localStorage.setItem("sobresEnviadosHoy", "[]");
      } else {
        this.state.toquesRestantes = parseInt(localStorage.getItem("toquesRestantes")) || 30;
        this.state.sobresEnviadosHoy = JSON.parse(localStorage.getItem("sobresEnviadosHoy")) || [];
      }
    } catch(e) {
      console.error('Error cargando datos:', e);
    }
  },
  
  saveData() {
    localStorage.setItem('cts', JSON.stringify(this.contactos));
    localStorage.setItem('todex', JSON.stringify(this.todex));
    localStorage.setItem('sonido', this.state.settings.sonido ? 'on' : 'off');
    localStorage.setItem('vibracion', this.state.settings.vibracion ? 'on' : 'off');
    localStorage.setItem('colorIndex', this.state.settings.color);
    localStorage.setItem('status', this.state.settings.status);
    localStorage.setItem('avatar', this.state.settings.avatar);
    localStorage.setItem('miNombre', this.state.miNombre);
    localStorage.setItem('instituto', this.state.instituto);
    localStorage.setItem('curso', this.state.curso);
    localStorage.setItem('genero', this.state.genero);
    localStorage.setItem('racha', this.state.racha);
    localStorage.setItem('toquesRestantes', this.state.toquesRestantes);
    localStorage.setItem('sobresEnviadosHoy', JSON.stringify(this.state.sobresEnviadosHoy));
  },
  
  determineInitialPage() {
    const hasConsent = localStorage.getItem('consent');
    const hasNombre = this.state.miNombre;
    const hasAvatar = localStorage.getItem('avatar');
    const hasColor = localStorage.getItem('colorIndex');
    
    if (!hasConsent) {
      this.showPage('splash');
    } else if (!hasNombre) {
      this.showPage('setup');
    } else if (!hasAvatar) {
      this.showPage('avatar');
    } else if (!hasColor) {
      this.showPage('color');
    } else {
      this.showPage('home');
    }
  },
  
  setupEventListeners() {
    // Botón OK
    const btnOK = document.getElementById('btn-ok');
    if (btnOK) {
      btnOK.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleOK();
      });
      btnOK.addEventListener('touchstart', (e) => {
        e.preventDefault();
        btnOK.style.transform = 'scale(0.9)';
      });
      btnOK.addEventListener('touchend', (e) => {
        e.preventDefault();
        btnOK.style.transform = '';
        this.handleOK();
      });
    }
    
    // Botón Back (C)
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
      btnBack.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleBack();
      });
      btnBack.addEventListener('touchstart', (e) => {
        e.preventDefault();
        btnBack.style.transform = 'translateY(2px)';
      });
      btnBack.addEventListener('touchend', (e) => {
        e.preventDefault();
        btnBack.style.transform = '';
        this.handleBack();
      });
    }
    
    // D-Pad
    const sectors = {
      'up': document.querySelector('.sector-up'),
      'down': document.querySelector('.sector-down'),
      'left': document.querySelector('.sector-left'),
      'right': document.querySelector('.sector-right')
    };
    
    Object.keys(sectors).forEach(dir => {
      const el = sectors[dir];
      if (el) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleDirection(dir);
        });
        el.addEventListener('touchstart', (e) => {
          e.preventDefault();
          el.style.background = 'rgba(0,0,0,0.15)';
        });
        el.addEventListener('touchend', (e) => {
          e.preventDefault();
          el.style.background = '';
          this.handleDirection(dir);
        });
      }
    });
    
    // Input de nombre (teclado físico)
    const inputNombre = document.getElementById('miNombre');
    if (inputNombre) {
      inputNombre.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleOK();
        }
      });
    }
  },
  
  setupPreventDefaults() {
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('dblclick', (e) => {
      e.preventDefault();
    }, { passive: false });
  },
  
  // Navegación
  handleDirection(dir) {
    this.initAudio();
    this.playSound('move');
    
    const { currentPage, focus, inSelector } = this.state;
    
    // Manejar selectores modales primero
    if (inSelector) {
      this.navigateSelector(dir);
      return;
    }
    
    // Manejar modales específicos
    if (this.state.combate.enSelectorAmigo) {
      if (dir === 'up' && this.state.combate.selectorAmigoIndex > 0) {
        this.state.combate.selectorAmigoIndex--;
        this.updateSelectorAmigoFocus();
      } else if (dir === 'down') {
        const max = Object.keys(this.contactos).length - 1;
        if (this.state.combate.selectorAmigoIndex < max) {
          this.state.combate.selectorAmigoIndex++;
          this.updateSelectorAmigoFocus();
        }
      }
      return;
    }
    
    if (this.state.combate.enSelectorEmoji) {
      const gridCols = 4;
      const items = document.querySelectorAll('#selector-emoji-combate .emoji-card, #selector-defensa .emoji-card');
      const max = items.length - 1;
      let idx = this.state.combate.selectorEmojiIndex;
      
      if (dir === 'up' && idx >= gridCols) idx -= gridCols;
      else if (dir === 'down' && idx < max - gridCols + 1) idx += gridCols;
      else if (dir === 'left' && idx % gridCols > 0) idx--;
      else if (dir === 'right' && idx % gridCols < gridCols - 1 && idx < max) idx++;
      
      if (idx !== this.state.combate.selectorEmojiIndex) {
        this.state.combate.selectorEmojiIndex = idx;
        this.updateSelectorEmojiFocus();
      }
      return;
    }
    
    // Navegación por página
    switch(currentPage) {
      case 'consent':
        if (dir === 'left') focus.index = 0;
        if (dir === 'right') focus.index = 1;
        this.updateConsentFocus();
        break;
        
      case 'avatar':
        const avatarCols = 4;
        if (dir === 'up' && focus.index >= avatarCols) focus.index -= avatarCols;
        if (dir === 'down' && focus.index < 8) focus.index += avatarCols;
        if (dir === 'left' && focus.index % avatarCols > 0) focus.index--;
        if (dir === 'right' && focus.index % avatarCols < avatarCols - 1 && focus.index < 11) focus.index++;
        this.updateAvatarFocus();
        break;
        
      case 'color':
        const colorCols = 3;
        if (dir === 'up' && focus.index >= colorCols) focus.index -= colorCols;
        if (dir === 'down' && focus.index < 6) focus.index += colorCols;
        if (dir === 'left' && focus.index % colorCols > 0) focus.index--;
        if (dir === 'right' && focus.index % colorCols < colorCols - 1 && focus.index < 7) focus.index++;
        this.updateColorSetupFocus();
        break;
        
      case 'menu':
        const menuCols = 3;
        if (dir === 'up' && focus.index >= menuCols) focus.index -= menuCols;
        if (dir === 'down' && focus.index < 6) focus.index += menuCols;
        if (dir === 'left' && focus.index % menuCols > 0) focus.index--;
        if (dir === 'right' && focus.index % menuCols < menuCols - 1 && focus.index < 8) focus.index++;
        this.state.menuIndex = focus.index;
        this.updateMenuFocus();
        break;
        
      case 'sobres':
        const sobreItems = 6; // 4 sobres + tokes20 + historial
        if (dir === 'up' && focus.index >= 4) {
          focus.index = Math.min(focus.index - 4, 3);
        } else if (dir === 'down' && focus.index < 4) {
          focus.index = focus.index === 3 ? 5 : 4; // historial o tokes20
        } else if (dir === 'left' && focus.index > 0 && focus.index < 4) {
          focus.index--;
        } else if (dir === 'right' && focus.index < 3) {
          focus.index++;
        } else if ((dir === 'left' || dir === 'right') && focus.index >= 4) {
          focus.index = focus.index === 4 ? 5 : 4;
        }
        this.updateSobresFocus();
        break;
        
      case 'settings':
        const settingsMax = 4;
        if (dir === 'up' && focus.index > 0) focus.index--;
        if (dir === 'down' && focus.index < settingsMax) focus.index++;
        this.updateSettingsFocus();
        this.scrollToFocused('settings-list');
        break;
        
      case 'home':
        // En home, OK va al menú
        break;
    }
    
    this.vibrar();
  },
  
  handleOK() {
    this.initAudio();
    this.playSound('select');
    
    const { currentPage, focus } = this.state;
    
    // Manejar selectores modales
    if (this.state.inSelector) {
      this.selectFromSelector();
      return;
    }
    
    if (this.state.combate.enSelectorAmigo) {
      const items = document.querySelectorAll('#lista-amigos-combate .list-item');
      if (items[this.state.combate.selectorAmigoIndex]) {
        const amigoId = items[this.state.combate.selectorAmigoIndex].dataset.id;
        this.seleccionarAmigoCombate(amigoId);
      }
      return;
    }
    
    if (this.state.combate.enSelectorEmoji) {
      const selector = this.state.combate.modo === 'defensa' ? '#selector-defensa' : '#selector-emoji-combate';
      const cards = document.querySelectorAll(`${selector} .emoji-card`);
      if (cards[this.state.combate.selectorEmojiIndex]) {
        const emojiId = parseInt(cards[this.state.combate.selectorEmojiIndex].dataset.id);
        this.seleccionarEmojiCombate(emojiId);
      }
      return;
    }
    
    // Manejar confirmación de reinicio
    const confirmModal = document.getElementById('confirm-reiniciar');
    if (confirmModal && confirmModal.classList.contains('active')) {
      if (focus.index === 1) this.confirmarReinicio();
      else this.cancelarReinicio();
      return;
    }
    
    // Páginas normales
    switch(currentPage) {
      case 'splash':
        this.showPage('consent');
        break;
        
      case 'consent':
        if (focus.index === 1) {
          localStorage.setItem('consent', 'true');
          this.showPage('setup');
        } else {
          this.showMsg('Debes aceptar para continuar');
        }
        break;
        
      case 'setup':
        const input = document.getElementById('miNombre');
        const nombre = input.value.trim().toUpperCase();
        if (nombre.length < 2) {
          this.showMsg('Mínimo 2 letras');
          return;
        }
        this.state.miNombre = nombre;
        this.saveData();
        this.showPage('avatar');
        break;
        
      case 'avatar':
        this.state.settings.avatar = AVATARES[focus.index];
        this.saveData();
        this.showPage('color');
        break;
        
      case 'color':
        this.state.settings.color = focus.index;
        this.applyColor();
        this.saveData();
        this.showPage('home');
        break;
        
      case 'home':
        this.showPage('menu');
        break;
        
      case 'menu':
        const menuPages = ['sobres', 'instituto', 'contacts', 'todox', 'murmullo', 'qr', 'combates', 'tienda', 'settings'];
        const targetPage = menuPages[focus.index];
        if (targetPage) {
          if (targetPage === 'tienda') {
            this.showMsg('Próximamente...');
          } else {
            this.showPage(targetPage);
          }
        }
        break;
        
      case 'sobres':
        if (focus.index < 4) {
          // Seleccionar sobre
          const tipos = ['verde', 'azul', 'morado', 'blanco'];
          this.state.sobreSeleccionado = tipos[focus.index];
          this.mostrarMensajeSobre(tipos[focus.index]);
        } else if (focus.index === 4) {
          // TOKES 20
          this.showPage('tokes');
        } else if (focus.index === 5) {
          // Historial
          this.mostrarHistorialSobres();
        }
        break;
        
      case 'settings':
        this.activateSetting(focus.index);
        break;
    }
  },
  
  handleBack() {
    this.initAudio();
    this.playSound('back');
    
    // Cerrar modales primero
    if (this.state.inSelector) {
      this.closeAllSelectors();
      return;
    }
    
    if (this.state.combate.enSelectorAmigo || this.state.combate.enSelectorEmoji) {
      this.cerrarSelectoresCombate();
      return;
    }
    
    const confirmModal = document.getElementById('confirm-reiniciar');
    if (confirmModal && confirmModal.classList.contains('active')) {
      confirmModal.classList.remove('active');
      return;
    }
    
    // No volver atrás en onboarding
    if (['splash', 'consent', 'setup', 'avatar', 'color'].includes(this.state.currentPage)) {
      return;
    }
    
    // Volver atrás o ir a home
    if (this.state.history.length > 0) {
      const prevPage = this.state.history.pop();
      this.showPage(prevPage, false);
    } else {
      this.showPage('home', false);
    }
  },
  
  // Gestión de páginas
  showPage(page, saveHistory = true) {
    if (saveHistory && this.state.currentPage !== page) {
      this.state.history.push(this.state.currentPage);
    }
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.selector-modal').forEach(m => m.classList.remove('active'));
    
    // Mostrar página objetivo
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');
    
    this.state.currentPage = page;
    this.state.inSelector = false;
    
    // Resetear foco según página
    this.setupPageFocus(page);
    
    // Renderizar contenido específico
    this.renderPageContent(page);
  },
  
  setupPageFocus(page) {
    switch(page) {
      case 'splash':
        this.state.focus = { type: 'splash', index: 0 };
        break;
      case 'consent':
        this.state.focus = { type: 'consent', index: 0 };
        this.updateConsentFocus();
        break;
      case 'setup':
        this.state.focus = { type: 'setup', index: 0 };
        setTimeout(() => {
          const input = document.getElementById('miNombre');
          if (input) input.focus();
        }, 100);
        break;
      case 'avatar':
        this.state.focus = { type: 'avatar', index: 0 };
        this.renderAvatarGrid();
        this.updateAvatarFocus();
        break;
      case 'color':
        this.state.focus = { type: 'color', index: 0 };
        this.renderColorSetupGrid();
        this.updateColorSetupFocus();
        break;
      case 'menu':
        this.state.focus = { type: 'menu', index: this.state.menuIndex };
        this.updateMenuFocus();
        break;
      case 'home':
        this.updateHome();
        break;
      case 'sobres':
        this.state.focus = { type: 'sobres', index: 0 };
        this.updateSobresFocus();
        this.actualizarTimerSobres();
        break;
      case 'settings':
        this.state.focus = { type: 'settings', index: 0 };
        this.updateSettingsUI();
        this.updateSettingsFocus();
        break;
    }
  },
  
  renderPageContent(page) {
    switch(page) {
      case 'avatar':
        this.renderAvatarGrid();
        break;
      case 'color':
        this.renderColorSetupGrid();
        break;
      case 'menu':
        // Ya está en HTML
        break;
      case 'home':
        this.updateHome();
        break;
      case 'qr':
        this.generarQR();
        break;
      case 'todox':
        this.renderTodex();
        break;
      case 'contacts':
        this.renderContacts();
        break;
      case 'instituto':
        this.renderInstituto();
        break;
      case 'murmullo':
        this.renderMurmullo();
        break;
    }
  },
  
  // Renderizado de grids y listas
  renderAvatarGrid() {
    const grid = document.getElementById('avatar-grid');
    if (!grid) return;
    
    grid.innerHTML = AVATARES.map((av, i) => `
      <div class="avatar-item ${i === 0 ? 'focused' : ''}" data-avatar="${av}" data-index="${i}">
        ${av}
      </div>
    `).join('');
  },
  
  renderColorSetupGrid() {
    const grid = document.getElementById('color-setup-grid');
    if (!grid) return;
    
    grid.innerHTML = COLORES.map((c, i) => `
      <div class="color-setup-item ${i === 0 ? 'focused' : ''}" 
           style="background: ${c.hex};" 
           data-color="${i}" 
           data-index="${i}"
           data-name="${c.name}">
      </div>
    `).join('');
  },
  
  // Actualización de foco visual
  updateConsentFocus() {
    document.querySelectorAll('.consent-btn').forEach((btn, i) => {
      btn.classList.toggle('focused', i === this.state.focus.index);
    });
  },
  
  updateAvatarFocus() {
    document.querySelectorAll('#avatar-grid .avatar-item').forEach((el, i) => {
      el.classList.toggle('focused', i === this.state.focus.index);
    });
  },
  
  updateColorSetupFocus() {
    document.querySelectorAll('#color-setup-grid .color-setup-item').forEach((el, i) => {
      el.classList.toggle('focused', i === this.state.focus.index);
    });
  },
  
  updateMenuFocus() {
    document.querySelectorAll('.menu-item').forEach((el, i) => {
      el.classList.toggle('focused', i === this.state.focus.index);
    });
  },
  
  updateSobresFocus() {
    // Sobres (0-3)
    document.querySelectorAll('.sobre-item').forEach((el, i) => {
      el.classList.toggle('focused', i === this.state.focus.index && i < 4);
    });
    // TOKES 20 (4)
    const tokes20 = document.getElementById('sobres-tokes20');
    if (tokes20) tokes20.classList.toggle('focused', this.state.focus.index === 4);
    // Historial (5)
    const historial = document.getElementById('sobres-historial');
    if (historial) historial.classList.toggle('focused', this.state.focus.index === 5);
  },
  
  updateSettingsFocus() {
    document.querySelectorAll('.setting-item').forEach((el, i) => {
      el.classList.toggle('focused', i === this.state.focus.index);
    });
  },
  
  updateSelectorAmigoFocus() {
    const items = document.querySelectorAll('#lista-amigos-combate .list-item');
    items.forEach((el, i) => {
      el.classList.toggle('focused', i === this.state.combate.selectorAmigoIndex);
    });
  },
  
  updateSelectorEmojiFocus() {
    const selector = this.state.combate.modo === 'defensa' ? '#selector-defensa' : '#selector-emoji-combate';
    const cards = document.querySelectorAll(`${selector} .emoji-card`);
    cards.forEach((el, i) => {
      el.classList.toggle('focused', i === this.state.combate.selectorEmojiIndex);
      el.style.border = i === this.state.combate.selectorEmojiIndex ? '3px solid var(--device-color)' : '3px solid transparent';
    });
  },
  
  // Funciones de página específicas
  updateHome() {
    document.getElementById('home-avatar').textContent = this.state.settings.avatar;
    document.getElementById('home-name').textContent = this.state.miNombre || 'Amigo';
    document.getElementById('tokes-badge').textContent = `🎯 ${this.state.toquesRestantes}/30`;
    
    const streakBadge = document.getElementById('streak-badge');
    if (streakBadge) streakBadge.textContent = `🔥 ${this.state.racha} días`;
    
    const st = ESTADOS.find(e => e.id === this.state.settings.status) || ESTADOS[0];
    const statusEl = document.getElementById('home-status');
    statusEl.textContent = `${st.emoji} ${st.label}`;
    statusEl.style.background = st.color;
  },
  
  generarQR() {
    const qrDiv = document.getElementById('qr-mio');
    if (!qrDiv) return;
    
    const texto = `${this.state.miID}|${this.state.miNombre}|${this.state.settings.avatar}`;
    qrDiv.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(texto)}" alt="QR" style="width: 140px; height: 140px;"/>`;
  },
  
  renderTodex() {
    const grid = document.getElementById('todex-grid');
    const count = document.getElementById('todex-count');
    if (!grid || !count) return;
    
    count.textContent = `${this.todex.captured.length}/150`;
    
    grid.innerHTML = Array(150).fill(0).map((_, i) => {
      const captured = this.todex.captured.includes(i + 1);
      const emoji = captured ? (EMOJIS_LIST[i] || '✨') : '•';
      return `<div class="emoji-card ${captured ? 'captured' : ''} ${i === 0 ? 'focused' : ''}" data-index="${i}">${emoji}</div>`;
    }).join('');
  },
  
  renderContacts() {
    const container = document.getElementById('contacts-list');
    if (!container) return;
    
    const lista = Object.entries(this.contactos);
    
    if (lista.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #A0AEC0; padding: 35px; font-size: 12px;">No tienes amigos.<br>¡Escanea un QR!</div>';
    } else {
      container.innerHTML = lista.map(([id, nom], i) => `
        <div class="list-item ${i === 0 ? 'focused' : ''}" data-index="${i}" data-id="${id}">
          <span style="font-size: 26px;">👤</span>
          <div style="flex: 1;">
            <div style="font-weight: 800; color: #2D3748;">${nom}</div>
            <div style="font-size: 9px; color: #A0AEC0;">${id.substring(0, 10)}...</div>
          </div>
          <button class="btn-eliminar" data-id="${id}">✕</button>
        </div>
      `).join('');
      
      // Event listeners para botones de eliminar
      container.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.eliminarAmigo(btn.dataset.id);
        });
      });
    }
  },
  
  renderInstituto() {
    // Placeholder - se implementa con backend
    const lista = document.getElementById('instituto-lista');
    if (lista) {
      lista.innerHTML = '<div style="text-align: center; color: #A0AEC0; padding: 35px; font-size: 12px;">Cargando alumnos...<br>(Requiere backend)</div>';
    }
  },
  
  renderMurmullo() {
    // Placeholder - se implementa con backend
    const container = document.getElementById('page-murmullo');
    if (container) {
      // Datos de ejemplo
      document.getElementById('murmullo-instituto').textContent = this.state.instituto || 'Tu Instituto';
    }
  },
  
  // Funciones de sobres
  mostrarMensajeSobre(tipo) {
    const mensajes = MENSAJES_SOBRES[tipo];
    const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
    
    // Guardar para envío
    this.state.sobreSeleccionado = { tipo, mensaje };
    
    // Mostrar página de mensaje
    this.showPage('sobre-mensaje');
    
    // Actualizar UI
    const header = document.getElementById('sobre-mensaje-header');
    const texto = document.getElementById('sobre-mensaje-texto');
    
    const colores = { verde: '🟢', azul: '🔵', morado: '🟣', blanco: '⚪' };
    const nombres = { verde: 'SOBRE VERDE', azul: 'SOBRE AZUL', morado: 'SOBRE MORADO', blanco: 'SOBRE SECRETO' };
    
    if (header) {
      header.innerHTML = `<span class="sobre-mensaje-icon">${colores[tipo]}</span><span class="sobre-mensaje-tipo">${nombres[tipo]}</span>`;
    }
    if (texto) texto.textContent = `"${mensaje}"`;
    
    // Renderizar lista de amigos para enviar
    this.renderEnviarLista('sobre-enviar-list');
  },
  
  renderEnviarLista(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const amigos = Object.entries(this.contactos);
    
    let html = `
      <div class="list-item focused" data-index="0" data-action="scan">
        <span style="font-size: 26px;">📷</span>
        <div style="flex: 1;">
          <div style="font-weight: 800; color: #805AD5;">Escanear QR</div>
          <div style="font-size: 10px; color: #A0AEC0;">Nuevo amigo</div>
        </div>
      </div>
    `;
    
    if (amigos.length === 0) {
      html += `<div style="text-align: center; color: #A0AEC0; padding: 25px; font-size: 12px;">No tienes amigos aún.<br>¡Escanea un QR!</div>`;
    } else {
      html += amigos.map(([id, nom], i) => `
        <div class="list-item" data-index="${i + 1}" data-id="${id}">
          <span style="font-size: 26px;">👤</span>
          <div style="flex: 1;">
            <div style="font-weight: 800; color: #2D3748;">${nom}</div>
          </div>
        </div>
      `).join('');
    }
    
    container.innerHTML = html;
  },
  
  mostrarHistorialSobres() {
    if (this.state.sobresEnviadosHoy.length === 0) {
      this.showMsg('No has enviado sobres hoy');
    } else {
      this.showMsg(`Enviados hoy: ${this.state.sobresEnviadosHoy.length} sobres`);
    }
  },
  
  actualizarTimerSobres() {
    const timer = document.getElementById('sobres-timer');
    if (!timer) return;
    
    const ahora = new Date();
    const manana = new Date(ahora);
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);
    
    const diff = manana - ahora;
    const horas = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const segs = Math.floor((diff % 60000) / 1000);
    
    timer.textContent = `Próximos en: ${String(horas).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(segs).padStart(2,'0')}`;
  },
  
  // Settings
  activateSetting(index) {
    switch(index) {
      case 0: // Sonido
        this.state.settings.sonido = !this.state.settings.sonido;
        this.saveData();
        this.updateSettingsUI();
        this.showMsg(this.state.settings.sonido ? '🔊 Sonido ON' : '🔇 Sonido OFF');
        break;
      case 1: // Vibración
        this.state.settings.vibracion = !this.state.settings.vibracion;
        this.saveData();
        this.updateSettingsUI();
        this.showMsg(this.state.settings.vibracion ? '📳 Vibración ON' : '📳 Vibración OFF');
        break;
      case 2: // Color
        this.showColorSelector();
        break;
      case 3: // Estado
        this.showStatusSelector();
        break;
      case 4: // Reiniciar
        this.mostrarConfirmReinicio();
        break;
    }
  },
  
  updateSettingsUI() {
    const sonidoEl = document.getElementById('toggle-sonido');
    const vibraEl = document.getElementById('toggle-vibra');
    const colorEl = document.getElementById('color-preview');
    const statusEl = document.getElementById('status-text');
    
    if (sonidoEl) sonidoEl.classList.toggle('active', this.state.settings.sonido);
    if (vibraEl) vibraEl.classList.toggle('active', this.state.settings.vibracion);
    
    const c = COLORES[this.state.settings.color];
    if (colorEl && c) colorEl.style.background = c.hex;
    
    const st = ESTADOS.find(e => e.id === this.state.settings.status);
    if (statusEl) {
      statusEl.textContent = st ? st.label : 'Disponible';
      statusEl.style.color = st ? st.color : '#48BB78';
    }
  },
  
  showColorSelector() {
    this.state.inSelector = true;
    this.state.selectorType = 'color';
    this.state.selectorIndex = this.state.settings.color;
    
    const modal = document.getElementById('color-selector');
    const grid = document.getElementById('color-grid');
    if (!modal || !grid) return;
    
    grid.innerHTML = COLORES.map((c, i) => `
      <div class="selector-item ${i === this.state.selectorIndex ? 'focused' : ''}" 
           style="background: ${c.hex};" 
           data-index="${i}"
           data-name="${c.name}">
        <div style="width: 35px; height: 35px; border-radius: 50%; background: ${c.hex}; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"></div>
      </div>
    `).join('');
    
    modal.classList.add('active');
  },
  
  showStatusSelector() {
    this.state.inSelector = true;
    this.state.selectorType = 'status';
    this.state.selectorIndex = ESTADOS.findIndex(e => e.id === this.state.settings.status);
    if (this.state.selectorIndex < 0) this.state.selectorIndex = 0;
    
    const modal = document.getElementById('status-selector');
    const grid = document.getElementById('status-grid');
    if (!modal || !grid) return;
    
    grid.innerHTML = ESTADOS.map((s, i) => `
      <div class="selector-item ${i === this.state.selectorIndex ? 'focused' : ''}" 
           style="background: ${s.color};" 
           data-index="${i}"
           data-name="${s.label}">
        <div style="font-size: 35px;">${s.emoji}</div>
      </div>
    `).join('');
    
    modal.classList.add('active');
  },
  
  navigateSelector(dir) {
    const items = document.querySelectorAll('.selector-modal.active .selector-item');
    if (!items.length) return;
    
    items[this.state.selectorIndex].classList.remove('focused');
    
    const cols = this.state.selectorType === 'color' ? 2 : 2;
    
    if (dir === 'right' && this.state.selectorIndex % cols === 0 && this.state.selectorIndex < items.length - 1) {
      this.state.selectorIndex++;
    } else if (dir === 'left' && this.state.selectorIndex % cols === 1) {
      this.state.selectorIndex--;
    } else if (dir === 'down' && this.state.selectorIndex < items.length - cols) {
      this.state.selectorIndex += cols;
    } else if (dir === 'up' && this.state.selectorIndex >= cols) {
      this.state.selectorIndex -= cols;
    }
    
    if (items[this.state.selectorIndex]) {
      items[this.state.selectorIndex].classList.add('focused');
      items[this.state.selectorIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  },
  
  selectFromSelector() {
    if (this.state.selectorType === 'color') {
      this.state.settings.color = this.state.selectorIndex;
      this.applyColor();
      this.saveData();
      const c = COLORES[this.state.selectorIndex];
      this.showMsg(c ? `🎨 ${c.name}` : 'Color cambiado');
    } else if (this.state.selectorType === 'status') {
      const s = ESTADOS[this.state.selectorIndex];
      if (s) {
        this.state.settings.status = s.id;
        this.saveData();
        this.showMsg(`${s.emoji} ${s.label}`);
      }
    }
    
    this.closeAllSelectors();
    this.updateSettingsUI();
  },
  
  closeAllSelectors() {
    document.querySelectorAll('.selector-modal').forEach(m => m.classList.remove('active'));
    this.state.inSelector = false;
  },
  
  mostrarConfirmReinicio() {
    this.state.focus.index = 0;
    document.getElementById('confirm-reiniciar').classList.add('active');
    this.updateConfirmFocus();
  },
  
  updateConfirmFocus() {
    document.querySelectorAll('.confirm-btn').forEach((btn, i) => {
      btn.classList.toggle('focused', i === this.state.focus.index);
    });
  },
  
  cancelarReinicio() {
    document.getElementById('confirm-reiniciar').classList.remove('active');
    this.state.focus.index = 0;
  },
  
  confirmarReinicio() {
    localStorage.clear();
    location.reload();
  },
  
  eliminarAmigo(id) {
    if (confirm('¿Eliminar este amigo?')) {
      delete this.contactos[id];
      this.saveData();
      this.renderContacts();
      this.showMsg('✅ Amigo eliminado');
    }
  },
  
  // Utilidades
  applyColor() {
    const c = COLORES[this.state.settings.color] || COLORES[0];
    document.documentElement.style.setProperty('--device-color', c.hex);
    document.documentElement.style.setProperty('--device-dark', c.shadow);
    document.documentElement.style.setProperty('--device-light', c.gradient[0]);
    
    const device = document.getElementById('device');
    if (device) {
      device.style.background = `linear-gradient(145deg, ${c.gradient[0]} 0%, ${c.gradient[1]} 50%, ${c.gradient[2]} 100%)`;
    }
  },
  
  updateClock() {
    const now = new Date();
    const el = document.getElementById('clock');
    if (el) el.textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  },
  
  showMsg(text) {
    const bar = document.getElementById('msg-bar');
    if (!bar) return;
    bar.textContent = text;
    bar.classList.add('show');
    setTimeout(() => bar.classList.remove('show'), 3000);
  },
  
  vibrar() {
    if (this.state.settings.vibracion && navigator.vibrate) {
      navigator.vibrate(8);
    }
  },
  
  scrollToFocused(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const focused = container.querySelector('.focused');
    if (focused) focused.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
  
  // Audio
  initAudio() {
    if (this.state.audioInitialized) return;
    try {
      this.state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.state.audioInitialized = true;
      if (this.state.audioCtx.state === 'suspended') {
        this.state.audioCtx.resume();
      }
    } catch(e) {
      console.error('Error audio:', e);
    }
  },
  
  playSound(type) {
    if (!this.state.settings.sonido || !this.state.audioInitialized || !this.state.audioCtx) return;
    
    try {
      const osc = this.state.audioCtx.createOscillator();
      const gain = this.state.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.state.audioCtx.destination);
      const now = this.state.audioCtx.currentTime;
      
      const sounds = {
        move: { freq: 500, gain: 0.05, duration: 0.03 },
        select: { freq: 800, gain: 0.08, duration: 0.08 },
        back: { freq: 350, gain: 0.05, duration: 0.05 },
        success: { freq: 600, gain: 0.1, duration: 0.3, ramp: 1200 }
      };
      
      const s = sounds[type] || sounds.move;
      osc.frequency.setValueAtTime(s.freq, now);
      if (s.ramp) osc.frequency.exponentialRampToValueAtTime(s.ramp, now + 0.1);
      gain.gain.setValueAtTime(s.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + s.duration);
      osc.start(now);
      osc.stop(now + s.duration);
    } catch(e) {
      console.error('Error sonido:', e);
    }
  },
  
  // Placeholders para funciones avanzadas (Parte 2)
  seleccionarAmigoCombate(amigoId) {
    console.log('Seleccionado amigo:', amigoId);
    this.cerrarSelectoresCombate();
  },
  
  seleccionarEmojiCombate(emojiId) {
    console.log('Seleccionado emoji:', emojiId);
    this.cerrarSelectoresCombate();
  },
  
  cerrarSelectoresCombate() {
    document.getElementById('selector-amigo-combate').classList.remove('active');
    document.getElementById('selector-emoji-combate').classList.remove('active');
    document.getElementById('selector-defensa').classList.remove('active');
    this.state.combate.enSelectorAmigo = false;
    this.state.combate.enSelectorEmoji = false;
  }
};

// Inicializar al cargar
window.addEventListener('load', () => {
  console.log('Tokeji v17.0 cargando...');
  app.init();
});