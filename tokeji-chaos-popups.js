/* ======================================================
   TOKEJI – CHAOS POPUPS MVP
   Solo JS | No rompe HTML | Botones del dispositivo
   ====================================================== */

(function () {
  console.log("[Tokeji] Chaos system loaded");

  /* ---------- CONFIG ---------- */
  const TEST_MODE = true; // 🔥 ponlo en false en producción
  const STORAGE_KEY = "tokeji_poll_voted_";

  const POLL = {
    id: "pasillo_001",
    question: "👀 Ahora mismo en tu clase hay...",
    options: [
      "Alguien pensando en su crush",
      "Dos personas mirándose",
      "Un secreto a punto de salir",
    ],
  };

  /* ---------- STYLE INJECTION ---------- */
  const style = document.createElement("style");
  style.innerHTML = `
  .tokeji-overlay {
    position: fixed;
    inset: 0;
    background: radial-gradient(circle at top, #1b1b2f, #000);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.4s ease;
  }

  .tokeji-popup {
    width: 90%;
    max-width: 420px;
    background: linear-gradient(135deg, #ff0080, #7928ca);
    border-radius: 20px;
    padding: 24px;
    color: white;
    box-shadow: 0 0 40px rgba(255,0,128,0.6);
    animation: float 3s ease-in-out infinite;
  }

  .tokeji-question {
    font-size: 1.2rem;
    text-align: center;
    margin-bottom: 20px;
  }

  .tokeji-option {
    padding: 14px;
    margin: 10px 0;
    border-radius: 14px;
    background: rgba(0,0,0,0.25);
    transition: all 0.2s;
  }

  .tokeji-option.active {
    background: rgba(255,255,255,0.25);
    transform: scale(1.05);
    box-shadow: 0 0 15px #fff;
  }

  .tokeji-results {
    margin-top: 10px;
  }

  .tokeji-bar {
    height: 12px;
    background: rgba(255,255,255,0.2);
    border-radius: 10px;
    overflow: hidden;
    margin-top: 6px;
  }

  .tokeji-bar-fill {
    height: 100%;
    background: #00ffd5;
    width: 0%;
    animation: grow 1s forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0 }
    to { opacity: 1 }
  }

  @keyframes float {
    0%,100% { transform: translateY(0) }
    50% { transform: translateY(-8px) }
  }

  @keyframes grow {
    to { width: var(--w) }
  }
  `;
  document.head.appendChild(style);

  /* ---------- UTILS ---------- */
  function alreadyVotedToday() {
    const today = new Date().toDateString();
    return localStorage.getItem(STORAGE_KEY + POLL.id) === today;
  }

  function markVoted() {
    const today = new Date().toDateString();
    localStorage.setItem(STORAGE_KEY + POLL.id, today);
  }

  /* ---------- POPUP ---------- */
  let selectedIndex = 0;
  let overlay, popup;

  function showPoll() {
    if (!TEST_MODE && alreadyVotedToday()) return;

    overlay = document.createElement("div");
    overlay.className = "tokeji-overlay";

    popup = document.createElement("div");
    popup.className = "tokeji-popup";

    popup.innerHTML = `
      <div class="tokeji-question">${POLL.question}</div>
      ${POLL.options
        .map(
          (opt, i) =>
            `<div class="tokeji-option ${
              i === 0 ? "active" : ""
            }">${opt}</div>`
        )
        .join("")}
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    document.addEventListener("keydown", handleKeys);
  }

  /* ---------- RESULTS ---------- */
  function showResults() {
    popup.innerHTML = `
      <div class="tokeji-question">🔥 Lo que se siente en el pasillo…</div>
      <div class="tokeji-results">
        ${POLL.options
          .map(
            (opt) => `
          <div>${opt}
            <div class="tokeji-bar">
              <div class="tokeji-bar-fill" style="--w:${
                30 + Math.random() * 60
              }%"></div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    markVoted();

    setTimeout(() => {
      overlay.remove();
      document.removeEventListener("keydown", handleKeys);
    }, 7000);
  }

  /* ---------- CONTROLS ---------- */
  function handleKeys(e) {
    const options = popup.querySelectorAll(".tokeji-option");

    if (e.key === "ArrowDown") {
      options[selectedIndex].classList.remove("active");
      selectedIndex = (selectedIndex + 1) % options.length;
      options[selectedIndex].classList.add("active");
    }

    if (e.key === "ArrowUp") {
      options[selectedIndex].classList.remove("active");
      selectedIndex =
        (selectedIndex - 1 + options.length) % options.length;
      options[selectedIndex].classList.add("active");
    }

    if (e.key === "Enter") {
      showResults();
    }
  }

  /* ---------- INIT ---------- */
  if (TEST_MODE) {
    setTimeout(showPoll, 1500);
  } else {
    const hour = new Date().getHours();
    if (hour === 11 || hour === 18) showPoll();
  }
})();