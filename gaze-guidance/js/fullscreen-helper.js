/*
window.showFullscreenPrompt = function () {
  swal({
    title: "Vollbildmodus empfohlen",
    content: {
      element: "div",
      attributes: {
        innerHTML: `
          <p>Du bist aktuell <strong>nicht im Vollbildmodus</strong>.<br>
          Für ein optimales Spielerlebnis bitte den Modus aktivieren.</p>
          <button id="go-fullscreen" style="padding: 10px 20px; font-size: 16px; margin-top: 10px;">
            Vollbildmodus aktivieren
          </button>
        `
      }
    },
    buttons: false,
    closeOnClickOutside: false
  });

  setTimeout(() => {
    const fsBtn = document.getElementById("go-fullscreen");
    if (fsBtn) {
      fsBtn.addEventListener("click", () => {
        document.documentElement.requestFullscreen()
          .then(() => {
            console.log("🖥️ Vollbildmodus aktiviert über Button");
            swal.close();
          })
          .catch(err => {
            console.warn("⚠️ Vollbildmodus konnte nicht aktiviert werden:", err);
            alert("Bitte aktiviere manuell den Vollbildmodus mit F11.");
          });
      });
    }
  }, 100);
};

window.checkFullscreenAndPrompt = function () {
  if (!document.fullscreenElement) {
    console.log("🔍 Kein Vollbild erkannt – zeige Prompt");
    window.showFullscreenPrompt();
  } else {
    console.log("✅ Bereits im Vollbild – kein Prompt notwendig");
  }
};
*/
