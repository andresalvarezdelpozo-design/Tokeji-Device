// tokeji-chaos-popups.js
(() => {
  const deviceScreen = document.querySelector('#device-screen'); // Pantalla del dispositivo
  if (!deviceScreen) return console.warn('No se encontró #device-screen');

  const polls = [
    {
      id: 'poll1',
      question: '¿Qué color prefieres?',
      options: ['Rojo', 'Azul', 'Verde', 'Amarillo'],
      hour: 15 // hora programada en 24h (ej: 15 = 3pm)
    },
    {
      id: 'poll2',
      question: '¿Comida favorita?',
      options: ['Pizza', 'Sushi', 'Pasta', 'Ensalada'],
      hour: 16
    }
  ];

  const pendingPolls = [];
  let activePoll = null;
  let selectedOption = 0;

  // Crear pop-up en la pantalla
  function showPoll(poll) {
    activePoll = poll;
    selectedOption = 0;

    const popup = document.createElement('div');
    popup.id = 'tokeji-poll-popup';
    popup.style.cssText = `
      position: absolute;
      top: 10%; left: 10%;
      width: 80%; height: 80%;
      background: #222;
      color: #fff;
      border: 2px solid #fff;
      padding: 10px;
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    const question = document.createElement('div');
    question.textContent = poll.question;
    question.style.fontSize = '1.2em';
    question.style.marginBottom = '10px';
    popup.appendChild(question);

    const optionsDiv = document.createElement('div');
    optionsDiv.id = 'tokeji-poll-options';
    optionsDiv.style.display = 'flex';
    optionsDiv.style.flexDirection = 'column';
    optionsDiv.style.gap = '5px';

    poll.options.forEach((opt, idx) => {
      const optDiv = document.createElement('div');
      optDiv.textContent = (idx === selectedOption ? '👉 ' : '') + opt;
      optionsDiv.appendChild(optDiv);
    });

    popup.appendChild(optionsDiv);
    deviceScreen.appendChild(popup);
  }

  function updateOptions() {
    const optionsDiv = document.getElementById('tokeji-poll-options');
    if (!optionsDiv) return;
    [...optionsDiv.children].forEach((div, idx) => {
      div.textContent = (idx === selectedOption ? '👉 ' : '') + activePoll.options[idx];
    });
  }

  function closePoll() {
    const popup = document.getElementById('tokeji-poll-popup');
    if (popup) popup.remove();
    activePoll = null;
  }

  // Manejo de botones del dispositivo
  function handleDeviceButton(button) {
    if (!activePoll) return;

    if (button === 'ArrowUp') {
      selectedOption = (selectedOption + 3) % 4; // subir
      updateOptions();
    } else if (button === 'ArrowDown') {
      selectedOption = (selectedOption + 1) % 4; // bajar
      updateOptions();
    } else if (button === 'OK') {
      alert(`Seleccionaste: ${activePoll.options[selectedOption]}`);
      closePoll();
    } else if (button === 'C') {
      closePoll();
    }
  }

  // Simular el sistema de botones del dispositivo
  document.addEventListener('keydown', e => {
    const mapping = {
      ArrowUp: 'ArrowUp',
      ArrowDown: 'ArrowDown',
      ArrowLeft: 'ArrowLeft',
      ArrowRight: 'ArrowRight',
      Enter: 'OK',
      Backspace: 'C'
    };
    if (mapping[e.key]) handleDeviceButton(mapping[e.key]);
  });

  // Comprobar encuestas pendientes y programadas
  function checkPolls() {
    const nowHour = new Date().getHours();
    polls.forEach(p => {
      if (!pendingPolls.includes(p) && p.hour <= nowHour) {
        pendingPolls.push(p);
      }
    });
  }

  // Mostrar encuesta si no hay activa
  function showPendingPoll() {
    if (!activePoll && pendingPolls.length > 0) {
      showPoll(pendingPolls.shift());
    }
  }

  // Loop de comprobación cada segundo
  setInterval(() => {
    checkPolls();
    showPendingPoll();
  }, 1000);

})();