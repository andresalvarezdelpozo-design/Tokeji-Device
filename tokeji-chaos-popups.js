// tokeji-chaos-popups.js

(() => {
  const deviceScreen = document.getElementById('device-screen');
  if (!deviceScreen) return console.error('No se encontró #device-screen');

  const surveys = [
    {
      hour: 15, // hora 24h
      minute: 0,
      question: '¿Qué modo prefieres hoy?',
      options: ['Caos', 'Normal', 'Exploración', 'Social'],
      answered: false
    },
    // puedes añadir más encuestas aquí
  ];

  let queue = [];

  function renderSurvey(survey) {
    deviceScreen.innerHTML = `
      <div class="survey-card">
        <p class="survey-question">${survey.question}</p>
        <ul class="survey-options">
          ${survey.options.map((o, i) => `<li data-index="${i}">▶ ${o}</li>`).join('')}
        </ul>
        <p class="survey-instructions">Usa las flechas para elegir, OK para confirmar, C para cancelar</p>
      </div>
    `;

    let currentIndex = 0;
    const optionsEls = deviceScreen.querySelectorAll('.survey-options li');
    highlightOption(currentIndex, optionsEls);

    function highlightOption(index, optionsEls) {
      optionsEls.forEach((el, i) => {
        el.style.background = i === index ? '#333' : 'transparent';
        el.style.color = i === index ? '#fff' : '#000';
      });
    }

    function handleDeviceButton(event) {
      // Solo usamos botones del dispositivo según tu código
      // Simulamos que tu app dispara estos eventos
      if (event.type !== 'deviceButton') return;

      const btn = event.detail.button; // 'UP','DOWN','LEFT','RIGHT','OK','C'

      if (btn === 'UP') currentIndex = (currentIndex - 1 + optionsEls.length) % optionsEls.length;
      if (btn === 'DOWN') currentIndex = (currentIndex + 1) % optionsEls.length;
      if (btn === 'LEFT') currentIndex = (currentIndex - 1 + optionsEls.length) % optionsEls.length;
      if (btn === 'RIGHT') currentIndex = (currentIndex + 1) % optionsEls.length;
      if (btn === 'C') {
        closeSurvey();
        return;
      }
      if (btn === 'OK') {
        survey.answered = true;
        console.log(`Encuesta respondida: ${survey.options[currentIndex]}`);
        closeSurvey();
        return;
      }
      highlightOption(currentIndex, optionsEls);
    }

    function closeSurvey() {
      deviceScreen.innerHTML = '';
      window.removeEventListener('deviceButton', handleDeviceButton);
      nextSurvey();
    }

    window.addEventListener('deviceButton', handleDeviceButton);
  }

  function nextSurvey() {
    if (queue.length > 0) {
      const next = queue.shift();
      renderSurvey(next);
    }
  }

  function checkSurveys() {
    const now = new Date();
    surveys.forEach(survey => {
      if (!survey.answered && !queue.includes(survey)) {
        if (now.getHours() > survey.hour || (now.getHours() === survey.hour && now.getMinutes() >= survey.minute)) {
          queue.push(survey);
        }
      }
    });
    if (queue.length > 0 && deviceScreen.innerHTML === '') {
      nextSurvey();
    }
  }

  // Revisa cada 30s si hay encuestas pendientes
  setInterval(checkSurveys, 30000);
  // También revisa inmediatamente al cargar
  checkSurveys();
})();
