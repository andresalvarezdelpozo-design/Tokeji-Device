// tokeji-chaos-popups.js
(() => {
  const screen = document.querySelector('.screen');
  const dpad = document.querySelector('.dpad');
  const okBtn = document.querySelector('.ok-btn');

  let currentSurvey = null;
  let selectedOption = 0;

  // Lista de encuestas programadas
  const surveysSchedule = [
    {
      question: "¿Qué prefieres para el recreo?",
      options: ["Chocolate", "Chicles", "Fruta", "Agua"],
      hour: 14, // 2 PM
      minute: 30
    },
    {
      question: "¿Quién ganará la partida de hoy?",
      options: ["Equipo rojo", "Equipo azul"],
      hour: 15, // 3 PM
      minute: 0
    }
  ];

  function createSurvey(survey) {
    // Pop-up container dentro de la pantalla
    const popup = document.createElement('div');
    popup.classList.add('encuesta-screen', 'active');
    popup.style.zIndex = 500;

    // Header
    const header = document.createElement('div');
    header.classList.add('encuesta-header');
    const badge = document.createElement('div');
    badge.classList.add('encuesta-badge');
    badge.textContent = "ENCUESTA CHAOS 🔥";
    header.appendChild(badge);
    popup.appendChild(header);

    // Pregunta
    const question = document.createElement('div');
    question.classList.add('encuesta-pregunta');
    question.textContent = survey.question;
    popup.appendChild(question);

    // Opciones
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('opciones-grid');
    survey.options.forEach((opt, i) => {
      const btn = document.createElement('div');
      btn.classList.add('opcion-btn');
      btn.dataset.index = i;

      const letra = document.createElement('div');
      letra.classList.add('opcion-letra');
      letra.textContent = String.fromCharCode(65 + i); // A, B, C...

      const text = document.createElement('div');
      text.classList.add('opcion-text');
      text.textContent = opt;

      btn.appendChild(letra);
      btn.appendChild(text);
      optionsContainer.appendChild(btn);
    });

    popup.appendChild(optionsContainer);

    // Añadimos al screen
    screen.appendChild(popup);

    // Guardamos referencia
    currentSurvey = {
      popup,
      optionsContainer,
      survey,
      selectedOption
    };

    highlightOption();
  }

  function highlightOption() {
    if (!currentSurvey) return;
    const buttons = currentSurvey.optionsContainer.querySelectorAll('.opcion-btn');
    buttons.forEach((btn, i) => {
      if (i === currentSurvey.selectedOption) {
        btn.classList.add('focused');
      } else {
        btn.classList.remove('focused');
      }
    });
  }

  // Función para mostrar resultados
  function showResults() {
    if (!currentSurvey) return;
    const { popup, survey, selectedOption } = currentSurvey;
    const optionsBtns = popup.querySelectorAll('.opcion-btn');

    optionsBtns.forEach((btn, i) => {
      btn.classList.remove('focused');
      btn.style.pointerEvents = 'none';
      if (i === selectedOption) {
        btn.style.background = 'linear-gradient(90deg, #00ff00, #00cc00)';
        btn.style.color = '#000';
        btn.style.boxShadow = '0 0 20px #00ff00';
      } else {
        btn.style.opacity = 0.5;
      }
    });

    const resultText = document.createElement('div');
    resultText.style.textAlign = 'center';
    resultText.style.marginTop = '20px';
    resultText.style.color = '#fff';
    resultText.style.fontWeight = '900';
    resultText.style.fontSize = '16px';
    resultText.textContent = `¡Elegiste: ${survey.options[selectedOption]}!`;
    popup.appendChild(resultText);

    // Cierra encuesta después de 5 segundos
    setTimeout(() => {
      popup.remove();
      currentSurvey = null;
      selectedOption = 0;
    }, 5000);
  }

  // Control del dispositivo
  function handleDpad(direction) {
    if (!currentSurvey) return;
    const total = currentSurvey.survey.options.length;
    if (direction === 'up') {
      currentSurvey.selectedOption = (currentSurvey.selectedOption - 1 + total) % total;
    } else if (direction === 'down') {
      currentSurvey.selectedOption = (currentSurvey.selectedOption + 1) % total;
    }
    highlightOption();
  }

  function handleOk() {
    if (!currentSurvey) return;
    showResults();
  }

  // Temporizador para encuestas programadas
  function checkSurveys() {
    const now = new Date();
    surveysSchedule.forEach(s => {
      if (
        now.getHours() === s.hour &&
        now.getMinutes() === s.minute &&
        !s.shown
      ) {
        createSurvey(s);
        s.shown = true; // evita mostrar varias veces
      }
    });
  }

  // Configura botones del dispositivo
  if (dpad) {
    dpad.addEventListener('up', () => handleDpad('up'));
    dpad.addEventListener('down', () => handleDpad('down'));
    dpad.addEventListener('left', () => handleDpad('up'));
    dpad.addEventListener('right', () => handleDpad('down'));
  }

  if (okBtn) {
    okBtn.addEventListener('click', handleOk);
  }

  // Intervalo para temporizador
  setInterval(checkSurveys, 1000);

  // Función pública para agregar nuevas encuestas dinámicamente
  window.tokejiSurveys = {
    addSurvey(surveyObj) {
      surveysSchedule.push(surveyObj);
    },
    showSurveyNow(surveyObj) {
      createSurvey(surveyObj);
    }
  };
})();
