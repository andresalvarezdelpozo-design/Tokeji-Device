// tokeji-chaos-popups.js
window.addEventListener('load', () => {
  console.log('Tokeji PopUps iniciado...');

  const deviceScreen = document.getElementById('device-screen'); // Pantalla del dispositivo
  const popupQueue = [];

  // Ejemplo de encuestas
  const surveys = [
    {
      id: 1,
      question: "¿Cuál es tu modo favorito?",
      options: ["Normal", "Caos", "Duelo", "Exploración"],
      time: "15:00", // hora de activación
      shown: false
    },
    {
      id: 2,
      question: "¿Quieres desbloquear un premio?",
      options: ["Sí", "No", "Quizás", "Más tarde"],
      time: "16:00",
      shown: false
    }
  ];

  // Convertir hora en minutos para comparar
  function timeToMinutes(hhmm) {
    const [hh, mm] = hhmm.split(':').map(Number);
    return hh * 60 + mm;
  }

  function checkSurveys() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    surveys.forEach(survey => {
      if (!survey.shown && currentMinutes >= timeToMinutes(survey.time)) {
        popupQueue.push(survey);
        survey.shown = true; // evitar que se vuelva a poner en cola
      }
    });

    if (popupQueue.length > 0) {
      showPopup(popupQueue[0]);
    }
  }

  function showPopup(survey) {
    // Crear pop-up estilo Chaos
    const popup = document.createElement('div');
    popup.id = 'tokeji-popup';
    popup.style.position = 'absolute';
    popup.style.top = '10%';
    popup.style.left = '10%';
    popup.style.width = '80%';
    popup.style.height = '60%';
    popup.style.background = 'rgba(30,30,30,0.95)';
    popup.style.color = 'white';
    popup.style.border = '3px solid #f0f';
    popup.style.borderRadius = '12px';
    popup.style.padding = '10px';
    popup.style.zIndex = '9999';
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.justifyContent = 'space-between';

    // Pregunta
    const question = document.createElement('div');
    question.textContent = survey.question;
    question.style.fontSize = '1.2em';
    question.style.marginBottom = '10px';
    popup.appendChild(question);

    // Opciones
    const optionsDiv = document.createElement('div');
    optionsDiv.style.display = 'grid';
    optionsDiv.style.gridTemplateColumns = '1fr 1fr';
    optionsDiv.style.gap = '10px';

    survey.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.style.padding = '10px';
      btn.style.fontSize = '1em';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        console.log(`Encuesta ${survey.id} seleccionada: ${opt}`);
        closePopup();
      };
      optionsDiv.appendChild(btn);
    });

    popup.appendChild(optionsDiv);

    // Añadir al dispositivo
    deviceScreen.appendChild(popup);

    function closePopup() {
      popup.remove();
      popupQueue.shift();
      if (popupQueue.length > 0) {
        showPopup(popupQueue[0]);
      }
    }

    // Solo se abre con OK del dispositivo
    window.addEventListener('deviceButton', (e) => {
      if (e.detail === 'ok') {
        popup.style.display = 'flex';
      }
    });
  }

  // Revisar encuestas al cargar y cada minuto
  checkSurveys();
  setInterval(checkSurveys, 60000);
});
