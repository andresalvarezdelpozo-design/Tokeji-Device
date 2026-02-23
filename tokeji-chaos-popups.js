// tokeji-chaos-popups.js
(() => {
  const deviceScreen = document.getElementById('device-screen');
  const deviceButtons = {
    ok: document.getElementById('btn-ok'),
    back: document.getElementById('btn-c'),
    up: document.getElementById('btn-up'),
    down: document.getElementById('btn-down'),
    left: document.getElementById('btn-left'),
    right: document.getElementById('btn-right'),
  };

  if (!deviceScreen || !deviceButtons.ok) {
    console.warn('Tokeji Popups: contenedor o botones no encontrados');
    return;
  }

  // Configuración de encuestas: hora en 24h, mensaje y opciones
  const surveys = [
    {
      hour: 15, // ejemplo: 15 = 3 PM
      minute: 0,
      question: '¿Cómo te sientes hoy?',
      options: ['Bien', 'Normal', 'Mal', 'Otro'],
    },
    {
      hour: 18,
      minute: 30,
      question: '¿Te gustó el último combate?',
      options: ['Sí', 'No', 'Más o menos', 'No lo vi'],
    }
  ];

  let queue = [];
  let currentSurvey = null;

  function pad(n) { return n.toString().padStart(2,'0'); }

  function checkSurveys() {
    const now = new Date();
    surveys.forEach(s => {
      const surveyTime = new Date();
      surveyTime.setHours(s.hour, s.minute, 0, 0);
      if (now >= surveyTime && !queue.includes(s) && currentSurvey !== s) {
        queue.push(s);
      }
    });
  }

  function renderSurvey(survey) {
    if (!survey) return;
    currentSurvey = survey;

    const html = `
      <div class="popup-survey" style="
        width: 90%; margin: auto; background:#222; color:#fff;
        padding:10px; border-radius:8px; text-align:center;
      ">
        <div style="margin-bottom:10px; font-weight:bold;">${survey.question}</div>
        <ul style="list-style:none; padding:0;">
          ${survey.options.map((opt,i)=>`<li data-index="${i}" style="margin:5px 0;">${opt}</li>`).join('')}
        </ul>
        <div style="margin-top:10px; font-size:0.8em;">Usa botones del dispositivo para elegir, OK para enviar, C para salir</div>
      </div>
    `;
    deviceScreen.innerHTML = html;
    highlightOption(0);
  }

  let selectedIndex = 0;

  function highlightOption(index) {
    const options = deviceScreen.querySelectorAll('li');
    options.forEach((li,i)=>{
      li.style.background = i===index?'#555':'transparent';
    });
    selectedIndex = index;
  }

  function handleButton(e) {
    if (!currentSurvey) return;
    const options = deviceScreen.querySelectorAll('li');
    switch(e) {
      case 'up': highlightOption((selectedIndex-1+options.length)%options.length); break;
      case 'down': highlightOption((selectedIndex+1)%options.length); break;
      case 'ok':
        console.log('Tokeji encuesta respuesta:', currentSurvey.question, options[selectedIndex].innerText);
        closeSurvey();
        break;
      case 'back': closeSurvey(); break;
    }
  }

  function closeSurvey() {
    deviceScreen.innerHTML = '';
    currentSurvey = null;
    if (queue.length>0) nextSurvey();
  }

  function nextSurvey() {
    if (currentSurvey) return;
    if (queue.length === 0) return;
    const next = queue.shift();
    renderSurvey(next);
  }

  // Botones
  Object.entries(deviceButtons).forEach(([name, btn])=>{
    if(!btn) return;
    btn.addEventListener('click',()=>handleButton(name));
  });

  // Revisar encuestas cada 30 segundos
  setInterval(()=>{
    checkSurveys();
    nextSurvey();
  }, 30000);

  // Inicial
  window.addEventListener('load',()=>{
    checkSurveys();
    nextSurvey();
  });

})();
