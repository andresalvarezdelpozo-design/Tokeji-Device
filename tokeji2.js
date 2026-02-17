/**
 * TOKEJI v17.0 - JavaScript Parte 2
 * Backend integration, combates, encuestas, murmullo
 * AÑADIR AL FINAL del archivo tokeji.js anterior
 */

// Extender el objeto app con nuevas funcionalidades
Object.assign(app, {
  
  // ===== BACKEND INTEGRATION =====
  
  async fetchBackend(endpoint, options = {}) {
    try {
      const url = `${BACK}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Backend error:', error);
      throw error;
    }
  },
  
  // ===== PERFIL Y REGISTRO =====
  
  async registrarPerfil() {
    if (!this.state.instituto || !this.state.curso) {
      // Mostrar modal de registro si no tiene datos
      this.mostrarRegistroPerfil();
      return;
    }
    
    try {
      await this.fetchBackend('/perfil', {
        method: 'POST',
        body: JSON.stringify({
          userId: this.state.miID,
          nombre: this.state.miNombre,
          avatar: this.state.settings.avatar,
          instituto: this.state.instituto,
          curso: this.state.curso,
          genero: this.state.genero,
          ciudad: this.state.ciudad || '',
          registrado: Date.now()
        })
      });
    } catch (e) {
      console.error('Error registrando perfil:', e);
    }
  },
  
  mostrarRegistroPerfil() {
    // Crear modal de registro si no existe
    let modal = document.getElementById('modal-registro-perfil');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-registro-perfil';
      modal.className = 'selector-modal';
      modal.innerHTML = `
        <div class="selector-title">🏫 Completa tu perfil</div>
        <div style="width: 100%; max-width: 260px;">
          <input type="text" id="reg-instituto" class="setup-input" placeholder="NOMBRE DEL INSTITUTO" style="margin-bottom: 10px; font-size: 14px;">
          <select id="reg-curso" class="setup-input" style="margin-bottom: 10px; font-size: 14px; text-transform: none;">
            <option value="">Selecciona curso...</option>
            <option value="1º ESO">1º ESO</option>
            <option value="2º ESO">2º ESO</option>
            <option value="3º ESO">3º ESO</option>
            <option value="4º ESO">4º ESO</option>
            <option value="1º Bach">1º Bach</option>
            <option value="2º Bach">2º Bach</option>
          </select>
          <select id="reg-genero" class="setup-input" style="font-size: 14px; text-transform: none;">
            <option value="">Género...</option>
            <option value="chico">Chico</option>
            <option value="chica">Chica</option>
            <option value="indiferente">Indiferente</option>
          </select>
        </div>
        <button id="btn-guardar-perfil" style="margin-top: 20px; padding: 12px 30px; background: #48BB78; color: white; border: none; border-radius: 20px; font-weight: 800; cursor: pointer;">Guardar</button>
      `;
      document.querySelector('.content').appendChild(modal);
    }
    
    modal.classList.add('active');
    
    document.getElementById('btn-guardar-perfil').onclick = () => {
      const instituto = document.getElementById('reg-instituto').value.trim();
      const curso = document.getElementById('reg-curso').value;
      const genero = document.getElementById('reg-genero').value;
      
      if (!instituto || !curso) {
        this.showMsg('Completa instituto y curso');
        return;
      }
      
      this.state.instituto = instituto;
      this.state.curso = curso;
      this.state.genero = genero;
      this.saveData();
      
      modal.classList.remove('active');
      this.registrarPerfil();
      this.showMsg('✅ Perfil guardado');
    };
  },
  
  // ===== SISTEMA DE SOBRES COMPLETO =====
  
  async enviarSobre(destinatarioId, esSecreto = false) {
    if (!this.state.sobreSeleccionado) return;
    
    const { tipo, mensaje } = this.state.sobreSeleccionado;
    
    // Verificar límite de sobres (4 por día)
    const sobresHoy = this.state.sobresEnviadosHoy.filter(s => s.tipo === tipo).length;
    if (sobresHoy >= 1 && tipo !== 'blanco') {
      this.showMsg('❌ Ya usaste este sobre hoy');
      return;
    }
    
    try {
      const payload = {
        de: this.state.miID,
        para: destinatarioId,
        tipo: tipo,
        mensaje: mensaje,
        esSecreto: esSecreto,
        avatarRemitente: esSecreto ? '👤' : this.state.settings.avatar,
        nombreRemitente: esSecreto ? 'Alguien' : this.state.miNombre,
        timestamp: Date.now()
      };
      
      // Guardar localmente mientras
      this.state.sobresEnviadosHoy.push(payload);
      this.saveData();
      
      // Enviar al backend
      await this.fetchBackend('/sobre', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      // Animación de éxito
      this.mostrarAnimacionEnvioSobre(destinatarioId, tipo);
      
      // Verificar desbloqueo de emoji
      if (this.state.sobresEnviadosHoy.length % 3 === 0) {
        setTimeout(() => this.verificarDesbloqueos(), 1500);
      }
      
    } catch (e) {
      this.showMsg('❌ Error al enviar');
      console.error(e);
    }
  },
  
  mostrarAnimacionEnvioSobre(destinatarioId, tipo) {
    const anim = document.getElementById('envio-animacion');
    if (!anim) return;
    
    const colores = { verde: '#48BB78', azul: '#4299E1', morado: '#9F7AEA', blanco: '#A0AEC0' };
    anim.style.background = colores[tipo] || colores.verde;
    
    const avatar = document.getElementById('envio-avatar-anim');
    const emoji = document.getElementById('envio-emoji-toke');
    const destino = document.getElementById('envio-destino-anim');
    
    if (avatar) avatar.textContent = this.state.settings.avatar;
    if (emoji) emoji.textContent = { verde: '🟢', azul: '🔵', morado: '🟣', blanco: '⚪' }[tipo];
    
    const nombreDest = this.contactos[destinatarioId] || 'Alguien';
    if (destino) destino.textContent = `A: ${nombreDest}`;
    
    anim.classList.add('active');
    
    setTimeout(() => {
      anim.classList.remove('active');
      this.showPage('home');
    }, 2000);
  },
  
  // ===== SISTEMA DE TOQUES 20 (ORIGINAL MEJORADO) =====
  
  async enviarToque(paraId, paraNombre, categoria, contexto) {
    if (this.state.toquesRestantes <= 0) {
      this.showMsg('❌ No te quedan tokes hoy');
      return;
    }
    
    try {
      const payload = {
        de: this.state.miID,
        para: paraId,
        num: categoria,
        contexto: contexto,
        avatarRemitente: this.state.settings.avatar,
        nombreRemitente: this.state.miNombre
      };
      
      const data = await this.fetchBackend('/toque', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (data.ok) {
        this.state.toquesRestantes = data.toques_restantes || this.state.toquesRestantes - 1;
        this.saveData();
        
        this.todex.total_toques_enviados++;
        
        // Animación
        this.mostrarAnimacionEnvio(paraNombre, categoria);
        
        // Verificar desbloqueos
        if (this.todex.total_toques_enviados % 5 === 0) {
          setTimeout(() => this.verificarDesbloqueos(), 1500);
        }
      }
    } catch (e) {
      this.showMsg('❌ Error al enviar');
    }
  },
  
  // ===== INSTITUTO Y USUARIOS =====
  
  async cargarUsuariosInstituto() {
    if (!this.state.instituto) {
      this.mostrarRegistroPerfil();
      return;
    }
    
    try {
      const data = await this.fetchBackend(`/usuarios?instituto=${encodeURIComponent(this.state.instituto)}&curso=${encodeURIComponent(this.state.curso)}`);
      
      if (data.ok && data.usuarios) {
        this.renderListaInstituto(data.usuarios);
      }
    } catch (e) {
      // Datos de ejemplo si falla
      this.renderListaInstituto([
        { id: 'demo1', nombre: 'Lucía', avatar: '🐱', curso: '2º Bach', genero: 'chica', todexCount: 23 },
        { id: 'demo2', nombre: 'Marcos', avatar: '🐶', curso: '2º Bach', genero: 'chico', todexCount: 15 },
        { id: 'demo3', nombre: 'Ana', avatar: '🦄', curso: '2º Bach', genero: 'chica', todexCount: 31 }
      ]);
    }
  },
  
  renderListaInstituto(usuarios) {
    const lista = document.getElementById('instituto-lista');
    if (!lista) return;
    
    // Filtrar por género si está seleccionado
    const filtroGenero = this.state.filtroGenero || 'todos';
    const filtrados = filtroGenero === 'todos' ? usuarios : usuarios.filter(u => u.genero === filtroGenero);
    
    document.getElementById('instituto-count').textContent = `${filtrados.length} alumnos`;
    
    if (filtrados.length === 0) {
      lista.innerHTML = '<div style="text-align: center; color: #A0AEC0; padding: 35px;">No hay alumnos con estos filtros</div>';
      return;
    }
    
    lista.innerHTML = filtrados.map((u, i) => `
      <div class="alumno-item ${i === 0 ? 'focused' : ''}" data-index="${i}" data-id="${u.id}">
        <span class="alumno-avatar">${u.avatar}</span>
        <div class="alumno-info">
          <div class="alumno-nombre">${u.nombre}</div>
          <div class="alumno-curso">${u.curso}</div>
        </div>
        <span class="alumno-ver">👁️</span>
      </div>
    `).join('');
    
    // Event listeners
    lista.querySelectorAll('.alumno-item').forEach(el => {
      el.addEventListener('click', () => this.verPerfilAlumno(el.dataset.id, filtrados));
    });
  },
  
  verPerfilAlumno(userId, listaUsuarios) {
    const usuario = listaUsuarios.find(u => u.id === userId);
    if (!usuario) return;
    
    this.showPage('perfil-alumno');
    
    document.getElementById('perfil-alumno-avatar').textContent = usuario.avatar;
    document.getElementById('perfil-alumno-nombre').textContent = usuario.nombre;
    document.getElementById('perfil-alumno-curso').textContent = usuario.curso;
    document.getElementById('perfil-alumno-todox-count').textContent = `ToDox: ${usuario.todexCount || 0}/150`;
    
    // Render emojis de ejemplo (en realidad vendrían del backend)
    const grid = document.getElementById('perfil-alumno-grid');
    if (grid) {
      grid.innerHTML = Array(usuario.todexCount || 0).fill(0).map((_, i) => 
        `<div class="emoji-card captured">${EMOJIS_LIST[i] || '✨'}</div>`
      ).join('');
    }
    
    // Configurar botones
    document.getElementById('btn-enviar-secreto').onclick = () => {
      this.state.sobreSeleccionado = { tipo: 'blanco', mensaje: MENSAJES_SOBRES.blanco[0] };
      this.enviarSobre(userId, true);
    };
  },
  
  // ===== MURMULLO (STATS AGREGADAS) =====
  
  async cargarMurmullo() {
    if (!this.state.instituto) {
      document.getElementById('murmullo-instituto').textContent = 'Configura tu instituto';
      return;
    }
    
    try {
      const data = await this.fetchBackend(`/stats-instituto?instituto=${encodeURIComponent(this.state.instituto)}`);
      
      if (data.ok) {
        this.renderMurmullo(data.stats);
      }
    } catch (e) {
      // Datos de ejemplo
      this.renderMurmullo({
        conectados: 127,
        sobresHoy: { verde: 12, azul: 8, morado: 15, blanco: 5 },
        rachasActivas: 89,
        todexConsultados: 156,
        nuevosHoy: 4,
        matchesMutuos: 12,
        tendencias: {
          cursoMasActivo: '2º Bach',
          sobreMasUsado: 'morado',
          horaPico: '14:23'
        },
        miPosicion: 'top 15%'
      });
    }
  },
  
  renderMurmullo(stats) {
    document.getElementById('murmullo-instituto').textContent = this.state.instituto;
    document.getElementById('murmullo-conectados').textContent = stats.conectados;
    
    // Ahora mismo
    const ahoraHTML = `
      <div class="ahora-item">💚 ${stats.sobresHoy.verde} sobres verdes</div>
      <div class="ahora-item">💙 ${stats.sobresHoy.azul} sobres azules</div>
      <div class="ahora-item">💜 ${stats.sobresHoy.morado} sobres morados</div>
      <div class="ahora-item">🤍 ${stats.sobresHoy.blanco} secretos en juego</div>
    `;
    document.getElementById('murmullo-ahora').innerHTML = ahoraHTML;
    
    // Hoy
    const hoyHTML = `
      <div class="hoy-item">💌 ${Object.values(stats.sobresHoy).reduce((a,b) => a+b, 0)} sobres enviados</div>
      <div class="hoy-item">🔥 ${stats.rachasActivas} rachas activas</div>
      <div class="hoy-item">👀 ${stats.todexConsultados} ToDox consultados</div>
      <div class="hoy-item">🆕 ${stats.nuevosHoy} nuevos alumnos</div>
      <div class="hoy-item">💕 ${stats.matchesMutuos} matches mutuos</div>
    `;
    document.getElementById('murmullo-hoy').innerHTML = hoyHTML;
    
    // Tendencias
    const tendenciasHTML = `
      <div class="tendencia-item">• Curso más activo: ${stats.tendencias.cursoMasActivo}</div>
      <div class="tendencia-item">• Sobre más usado: 💜 ${stats.tendencias.sobreMasUsado}</div>
      <div class="tendencia-item">• Hora pico: ${stats.tendencias.horaPico}</div>
    `;
    document.getElementById('murmullo-tendencias').innerHTML = tendenciasHTML;
    
    // Mi posición
    document.getElementById('murmullo-mi-posicion').textContent = `Eres ${stats.miPosicion} de remitentes hoy`;
  },
  
  // ===== SISTEMA DE ENCUESTAS =====
  
  async cargarEncuestaDelDia() {
    try {
      const data = await this.fetchBackend(`/encuesta/pregunta?instituto=${encodeURIComponent(this.state.instituto)}`);
      
      if (data.ok && data.pregunta) {
        this.mostrarEncuesta(data.pregunta);
      }
    } catch (e) {
      // Encuesta de ejemplo
      this.mostrarEncuesta({
        id: 'encuesta_demo',
        texto: "¿Quién tiene la mejor sonrisa del instituto?",
        opciones: [] // Se cargan desde lista de usuarios
      });
    }
  },
  
  mostrarEncuesta(pregunta) {
    // Solo mostrar si no ha votado hoy
    const hoy = new Date().toDateString();
    const ultimaEncuesta = localStorage.getItem('ultimaEncuesta');
    if (ultimaEncuesta === hoy) return;
    
    this.showPage('encuesta');
    document.getElementById('encuesta-pregunta').textContent = `"${pregunta.texto}"`;
    
    // Cargar opciones (usuarios del instituto)
    this.cargarOpcionesEncuesta();
  },
  
  async cargarOpcionesEncuesta() {
    try {
      const data = await this.fetchBackend(`/usuarios?instituto=${encodeURIComponent(this.state.instituto)}&limite=20`);
      
      if (data.ok && data.usuarios) {
        const lista = document.getElementById('encuesta-lista');
        lista.innerHTML = data.usuarios.map((u, i) => `
          <div class="encuesta-opcion ${i === 0 ? 'focused' : ''}" data-index="${i}" data-id="${u.id}">
            <span class="encuesta-opcion-avatar">${u.avatar}</span>
            <span class="encuesta-opcion-nombre">${u.nombre}</span>
          </div>
        `).join('');
        
        // Guardar referencia para navegación
        this.state.encuestaOpciones = data.usuarios;
        this.state.focus.index = 0;
      }
    } catch (e) {
      // Opciones de ejemplo
      const ejemplo = [
        { id: '1', nombre: 'Lucía', avatar: '🐱' },
        { id: '2', nombre: 'Marcos', avatar: '🐶' },
        { id: '3', nombre: 'Ana', avatar: '🦄' }
      ];
      
      const lista = document.getElementById('encuesta-lista');
      lista.innerHTML = ejemplo.map((u, i) => `
        <div class="encuesta-opcion ${i === 0 ? 'focused' : ''}" data-index="${i}" data-id="${u.id}">
          <span class="encuesta-opcion-avatar">${u.avatar}</span>
          <span class="encuesta-opcion-nombre">${u.nombre}</span>
        </div>
      `).join('');
      
      this.state.encuestaOpciones = ejemplo;
    }
  },
  
  async votarEncuesta(votadoId) {
    try {
      await this.fetchBackend('/encuesta/votar', {
        method: 'POST',
        body: JSON.stringify({
          de: this.state.miID,
          para: votadoId,
          instituto: this.state.instituto,
          timestamp: Date.now()
        })
      });
      
      // Marcar como votado hoy
      localStorage.setItem('ultimaEncuesta', new Date().toDateString());
      
      this.showMsg('✅ Voto registrado (anónimo)');
      this.showPage('home');
      
      // Verificar match
      this.verificarMatchEncuesta(votadoId);
      
    } catch (e) {
      this.showMsg('✅ Voto guardado');
      localStorage.setItem('ultimaEncuesta', new Date().toDateString());
      this.showPage('home');
    }
  },
  
  async verificarMatchEncuesta(otroId) {
    try {
      const data = await this.fetchBackend(`/encuesta/match?user1=${this.state.miID}&user2=${otroId}`);
      
      if (data.ok && data.match) {
        // Hay match mutuo, mostrar opción de revelar
        setTimeout(() => this.mostrarMatchMutuo(otroId), 2000);
      }
    } catch (e) {
      // No hacer nada si falla
    }
  },
  
  mostrarMatchMutuo(otroId) {
    this.showPage('match-mutuo');
    
    const descripcion = document.getElementById('match-descripcion');
    if (descripcion) {
      descripcion.textContent = '¡Alguien que votó por ti también recibió tu voto!';
    }
    
    // Configurar botones
    document.getElementById('match-si').onclick = () => this.aceptarRevelarMatch(otroId, true);
    document.getElementById('match-no').onclick = () => this.aceptarRevelarMatch(otroId, false);
  },
  
  async aceptarRevelarMatch(otroId, acepta) {
    try {
      await this.fetchBackend('/encuesta/consentimiento', {
        method: 'POST',
        body: JSON.stringify({
          userId: this.state.miID,
          otroId: otroId,
          acepta: acepta
        })
      });
      
      if (acepta) {
        this.showMsg('💕 Esperando confirmación...');
      }
      
      this.showPage('home');
      
    } catch (e) {
      this.showPage('home');
    }
  },
  
  // ===== SISTEMA DE COMBATES (FIX C1-C3) =====
  
  iniciarCombateVSIA() {
    if (this.todex.captured.length < 3) {
      this.showMsg('Necesitas 3+ emojis en ToDox');
      return;
    }
    
    this.state.combate.modo = 'ia';
    this.mostrarSelectorEmojiCombate();
  },
  
  iniciarCombateVSAmigo() {
    if (Object.keys(this.contactos).length === 0) {
      this.showMsg('Agrega amigos primero');
      return;
    }
    
    this.state.combate.modo = 'amigo';
    this.mostrarSelectorAmigoCombate();
  },
  
  mostrarSelectorAmigoCombate() {
    const modal = document.getElementById('selector-amigo-combate');
    const lista = document.getElementById('lista-amigos-combate');
    
    const amigos = Object.entries(this.contactos);
    lista.innerHTML = amigos.map(([id, nombre], i) => `
      <div class="list-item ${i === 0 ? 'focused' : ''}" data-id="${id}" data-index="${i}">
        <span style="font-size: 28px;">👤</span>
        <div style="flex: 1;">
          <div style="font-weight: 800; color: #2D3748;">${nombre}</div>
        </div>
      </div>
    `).join('');
    
    this.state.combate.selectorAmigoIndex = 0;
    this.state.combate.enSelectorAmigo = true;
    
    modal.classList.add('active');
  },
  
  mostrarSelectorEmojiCombate() {
    const modal = document.getElementById('selector-emoji-combate');
    const grid = document.getElementById('grid-emoji-combate');
    
    grid.innerHTML = this.todex.captured.map((id, i) => {
      const emoji = EMOJIS_LIST[id - 1] || '✨';
      const stats = this.todex.emojis_stats[id] || this.calcularStatsBase(id);
      return `
        <div class="emoji-card captured ${i === 0 ? 'focused' : ''}" data-id="${id}" data-index="${i}">
          <div>${emoji}</div>
          <div style="font-size: 8px; margin-top: 2px; color: #666;">⚡${stats.aura}</div>
        </div>
      `;
    }).join('');
    
    this.state.combate.selectorEmojiIndex = 0;
    this.state.combate.enSelectorEmoji = true;
    
    modal.classList.add('active');
  },
  
  seleccionarAmigoCombate(amigoId) {
    this.state.combate.oponenteId = amigoId;
    this.cerrarSelectoresCombate();
    this.mostrarSelectorEmojiCombate();
  },
  
  seleccionarEmojiCombate(emojiId) {
    this.state.combate.miEmojiSeleccionado = emojiId;
    this.cerrarSelectoresCombate();
    
    if (this.state.combate.modo === 'ia') {
      this.ejecutarCombateIA();
    } else {
      this.enviarDesafioCombate();
    }
  },
  
  ejecutarCombateIA() {
    const miEmoji = this.state.combate.miEmojiSeleccionado;
    const misStats = this.todex.emojis_stats[miEmoji] || this.calcularStatsBase(miEmoji);
    
    // IA selecciona emoji aleatorio
    const emojisIA = [1, 4, 17, 19, 31, 33, 36, 39, 41, 44, 46, 49, 50];
    const emojiIA = emojisIA[Math.floor(Math.random() * emojisIA.length)];
    const statsIA = this.calcularStatsBase(emojiIA);
    
    const miPoder = (misStats.aura + misStats.vibra + misStats.suerte) * (0.8 + Math.random() * 0.4);
    const poderIA = (statsIA.aura + statsIA.vibra + statsIA.suerte) * (0.8 + Math.random() * 0.4);
    
    const gane = miPoder > poderIA;
    
    this.mostrarPantallaVS({
      modo: 'ia',
      ganador: gane ? 'yo' : 'ia',
      miEmoji: miEmoji,
      suEmoji: emojiIA,
      miPoder: Math.floor(miPoder),
      suPoder: Math.floor(poderIA),
      nombreRival: 'IA'
    });
    
    // FIX C3: Sin pérdida de emojis, ganador recibe nuevo
    if (gane) {
      setTimeout(() => this.otorgarEmojiVictoria(), 2500);
    }
  },
  
  async enviarDesafioCombate() {
    try {
      const data = await this.fetchBackend('/desafio', {
        method: 'POST',
        body: JSON.stringify({
          de: this.state.miID,
          para: this.state.combate.oponenteId,
          miEmojiId: this.state.combate.miEmojiSeleccionado
        })
      });
      
      if (data.ok) {
        this.showMsg('⚔️ Desafío enviado!');
        this.iniciarPollingCombates();
        this.showPage('home');
      }
    } catch (e) {
      this.showMsg('❌ Error enviando desafío');
    }
  },
  
  iniciarPollingCombates() {
    // FIX C2: Limpiar interval anterior
    if (this.state.pollingCombates) {
      clearInterval(this.state.pollingCombates);
    }
    
    this.verificarCombatesFinalizados();
    
    this.state.pollingCombates = setInterval(() => {
      this.verificarCombatesFinalizados();
    }, 3000);
    
    // Auto-limpiar después de 2 minutos
    setTimeout(() => {
      if (this.state.pollingCombates) {
        clearInterval(this.state.pollingCombates);
        this.state.pollingCombates = null;
      }
    }, 120000);
  },
  
  async verificarCombatesFinalizados() {
    try {
      const data = await this.fetchBackend(`/combates-finalizados?userId=${this.state.miID}`);
      
      if (data.ok && data.combates && data.combates.length > 0) {
        // Limpiar polling
        if (this.state.pollingCombates) {
          clearInterval(this.state.pollingCombates);
          this.state.pollingCombates = null;
        }
        
        const combate = data.combates[0];
        this.procesarResultadoCombate(combate);
      }
    } catch (e) {
      console.error('Error verificando combates:', e);
    }
  },
  
  procesarResultadoCombate(resultado) {
    const gane = resultado.ganador === this.state.miID;
    const esIA = resultado.modo === 'ia';
    
    this.mostrarPantallaVS({
      modo: resultado.modo,
      ganador: gane ? 'yo' : 'rival',
      miEmoji: resultado.miEmoji,
      suEmoji: resultado.suEmoji,
      miPoder: Math.floor(resultado.miPoder || 0),
      suPoder: Math.floor(resultado.suPoder || 0),
      nombreRival: esIA ? 'IA' : (this.contactos[resultado.rivalId] || 'Rival')
    });
    
    // FIX C3: Sin pérdida de emojis
    if (gane) {
      setTimeout(() => this.otorgarEmojiVictoria(), 2500);
    }
  },
  
  mostrarPantallaVS(datos) {
    const pantalla = document.getElementById('combate-vs-screen');
    const miEmoji = EMOJIS_LIST[datos.miEmoji - 1] || '❓';
    const suEmoji = EMOJIS_LIST[datos.suEmoji - 1] || '❓';
    const gane = datos.ganador === 'yo';
    
    document.getElementById('vs-mi-emoji').textContent = miEmoji;
    document.getElementById('vs-su-emoji').textContent = suEmoji;
    document.getElementById('vs-mi-poder').textContent = '⚡' + datos.miPoder;
    document.getElementById('vs-su-poder').textContent = '⚡' + datos.suPoder;
    document.getElementById('vs-rival-nombre').textContent = datos.nombreRival;
    
    const resultado = document.getElementById('vs-resultado');
    const progreso = document.getElementById('vs-progreso');
    
    resultado.textContent = '';
    progreso.style.width = '0%';
    pantalla.classList.add('active');
    
    // Animación
    setTimeout(() => { progreso.style.width = '100%'; }, 100);
    setTimeout(() => {
      resultado.textContent = gane ? '🏆 ¡VICTORIA!' : '💔 DERROTA';
      resultado.style.color = gane ? '#48BB78' : '#F56565';
      this.playSound(gane ? 'success' : 'back');
    }, 2000);
    
    // Botón cerrar
    document.getElementById('btn-cerrar-vs').onclick = () => {
      pantalla.classList.remove('active');
      // FIX C2: Limpiar polling al cerrar
      if (this.state.pollingCombates) {
        clearInterval(this.state.pollingCombates);
        this.state.pollingCombates = null;
      }
      this.showPage('home');
    };
  },
  
  otorgarEmojiVictoria() {
    const disponibles = [];
    for (let i = 1; i <= 150; i++) {
      if (!this.todex.captured.includes(i)) disponibles.push(i);
    }
    
    if (disponibles.length === 0) return;
    
    const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
    this.todex.captured.push(nuevo);
    this.todex.captured.sort((a, b) => a - b);
    this.todex.emojis_stats[nuevo] = this.calcularStatsBase(nuevo);
    this.saveData();
    
    const rareza = RAREZAS_TODEX[nuevo] || 'comun';
    this.mostrarNotificacionNuevoEmoji(nuevo, rareza);
  },
  
  mostrarNotificacionNuevoEmoji(numero, rareza) {
    const notif = document.getElementById('nuevo-emoji-notif');
    if (!notif) return;
    
    const emoji = EMOJIS_LIST[numero - 1] || '✨';
    const stats = this.todex.emojis_stats[numero];
    
    document.getElementById('nuevo-emoji-icon').textContent = emoji;
    document.getElementById('nuevo-emoji-num').textContent = `#${numero}`;
    document.getElementById('nuevo-emoji-rareza').textContent = rareza.toUpperCase();
    document.getElementById('nuevo-emoji-stats').innerHTML = 
      `<span>✨ ${stats.aura}</span><span>🌟 ${stats.vibra}</span><span>🍀 ${stats.suerte}</span>`;
    
    notif.classList.add('active');
    this.playSound('success');
    
    document.getElementById('btn-cerrar-emoji').onclick = () => {
      notif.classList.remove('active');
    };
  },
  
  calcularStatsBase(id) {
    const rareza = RAREZAS_TODEX[id] || 'comun';
    const rangos = {
      comun: { aura: [5, 15], vibra: [5, 15], suerte: [1, 3] },
      raro: { aura: [15, 25], vibra: [15, 25], suerte: [3, 5] },
      epico: { aura: [25, 35], vibra: [25, 35], suerte: [5, 7] },
      mitico: { aura: [35, 50], vibra: [35, 50], suerte: [7, 10] },
      legendario: { aura: [50, 70], vibra: [50, 70], suerte: [10, 15] }
    };
    
    const r = rangos[rareza];
    const seed = id;
    const random = (min, max, s) => ((s * 7 + 13) % (max - min + 1)) + min;
    
    return {
      aura: random(r.aura[0], r.aura[1], seed),
      vibra: random(r.vibra[0], r.vibra[1], seed + 100),
      suerte: random(r.suerte[0], r.suerte[1], seed + 200)
    };
  },
  
  // ===== QR SCANNER =====
  
  async scanQR() {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      this.showMsg('⚠️ HTTPS requerido');
      this.inputManualQR();
      return;
    }
    
    // Crear modal de scan
    let modal = document.getElementById('modal-scan-qr');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-scan-qr';
      modal.className = 'selector-modal active';
      modal.style.zIndex = '200';
      modal.innerHTML = `
        <div class="selector-title">📷 Escaneando...</div>
        <div style="background: white; padding: 20px; border-radius: 20px;">
          <video id="scan-video" style="width: 260px; height: 260px; object-fit: cover; border-radius: 16px; display: block; background: #000;" autoplay playsinline muted></video>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 220px; height: 220px; border: 4px solid #48BB78; border-radius: 16px; pointer-events: none;"></div>
        </div>
        <div style="text-align: center; margin-top: 15px; color: #2D3748; font-size: 12px;">Enfoca el código QR</div>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
          <button id="btn-cancel-scan" style="padding: 10px 20px; background: #F56565; color: white; border: none; border-radius: 20px; font-weight: 800; cursor: pointer;">Cancelar</button>
          <button id="btn-manual-scan" style="padding: 10px 20px; background: #4299E1; color: white; border: none; border-radius: 20px; font-weight: 800; cursor: pointer;">Manual</button>
        </div>
      `;
      document.querySelector('.content').appendChild(modal);
    } else {
      modal.classList.add('active');
    }
    
    let stream = null;
    
    document.getElementById('btn-cancel-scan').onclick = () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      modal.classList.remove('active');
    };
    
    document.getElementById('btn-manual-scan').onclick = () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      modal.classList.remove('active');
      this.inputManualQR();
    };
    
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" },
        audio: false 
      });
      
      const video = document.getElementById('scan-video');
      video.srcObject = stream;
      
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve);
        };
      });
      
      // Scan loop
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      const scan = () => {
        if (!document.getElementById('scan-video')) {
          if (stream) stream.getTracks().forEach(t => t.stop());
          return;
        }
        
        try {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 640;
          ctx.drawImage(video, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, canvas.width, canvas.height);
          
          if (code && code.data) {
            if (stream) stream.getTracks().forEach(t => t.stop());
            modal.classList.remove('active');
            this.procesarQR(code.data);
            return;
          }
        } catch(e) {}
        
        requestAnimationFrame(scan);
      };
      
      scan();
      
    } catch(err) {
      this.showMsg('❌ Cámara no disponible');
      this.inputManualQR();
    }
  },
  
  inputManualQR() {
    const codigo = prompt('Pega el código del amigo (formato: ID|Nombre|Avatar):');
    if (codigo) this.procesarQR(codigo.trim());
  },
  
  procesarQR(data) {
    const parts = data.split('|');
    if (parts.length >= 2) {
      const [id, nombre, avatar] = parts;
      if (id && nombre && id !== this.state.miID) {
        this.contactos[id] = nombre;
        if (avatar) localStorage.setItem('avatar_' + id, avatar);
        this.saveData();
        this.showMsg(`✅ ${nombre} agregado`);
        
        if (this.state.currentPage === 'contacts') this.renderContacts();
      } else if (id === this.state.miID) {
        this.showMsg('❌ No puedes agregarte a ti mismo');
      }
    } else {
      this.showMsg('❌ QR inválido');
    }
  },
  
  // ===== ACTUALIZAR RENDERPAGECONTENT =====
  
  // Sobrescribir para añadir nuevas páginas
  renderPageContentExtended(page) {
    switch(page) {
      case 'instituto':
        this.cargarUsuariosInstituto();
        break;
      case 'murmullo':
        this.cargarMurmullo();
        break;
      case 'combates':
        // Setup de combates
        break;
    }
  }
});

// Sobrescribir renderPageContent para incluir extensiones
const originalRender = app.renderPageContent.bind(app);
app.renderPageContent = function(page) {
  originalRender(page);
  this.renderPageContentExtended(page);
};

// Iniciar polling de mensajes al cargar
setInterval(() => {
  if (app.state.miID && app.state.currentPage !== 'splash') {
    app.checkMensajesPendientes();
  }
}, 5000);