var PointCalibrate = 0;
var CalibrationPoints = {};
var helpModal;
let gazeData = [];
let recordingActive = false;
window.probanden_id = null; // Globale Variable für die Probanden-ID

/**
 * Clear the canvas and the calibration button.
 */
function ClearCanvas() {
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.setProperty('display', 'none');
  });
  var canvas = document.getElementById("plotting_canvas");
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Show the instruction of using calibration at the start up screen.
 */
function PopUpInstruction() {
  ClearCanvas();
  swal({
    title: "Calibration",
    text: "Please click on each of the 9 points on the screen. You must click on each point 5 times till it goes yellow. This will calibrate your eye movements.",
    buttons: {
      cancel: false,
      confirm: true
    }
  }).then(isConfirm => {
    ShowCalibrationPoint();
  });
}

/**
 * Show the help instructions right at the start.
 */
function helpModalShow() {
  if (!helpModal) {
    helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
  }
  helpModal.show();
}

function calcAccuracy() {
  swal({
    title: "Calculating measurement",
    text: "Please don't move your mouse & stare at the middle dot for the next 5 seconds. This will allow us to calculate the accuracy of our predictions.",
    closeOnEsc: false,
    allowOutsideClick: false,
    closeModal: true
  }).then(() => {
    store_points_variable();
    sleep(5000).then(() => {
      stop_storing_points_variable();
      var past50 = webgazer.getStoredPoints();
      var precision_measurement = calculatePrecision(past50);
      var accuracyLabel = "<a>Accuracy | " + precision_measurement + "%</a>";
      localStorage.setItem("calibration_accuracy", precision_measurement);
      console.log("🎯 Accuracy gespeichert in localStorage:", precision_measurement);

      document.getElementById("Accuracy").innerHTML = accuracyLabel;
      swal({
        title: "Your accuracy measure is " + precision_measurement + "%",
        allowOutsideClick: false,
        buttons: {
          cancel: "Recalibrate",
          confirm: true,
        }
      }).then(isConfirm => {
        if (isConfirm) {
          ClearCanvas();
        } else {
          document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
          webgazer.clearData();
          ClearCalibration();
          ClearCanvas();
          ShowCalibrationPoint();
        }
      });
    });
  });
}

function calPointClick(node) {
  const id = node.id;
  if (!CalibrationPoints[id]) {
    CalibrationPoints[id] = 0;
  }
  CalibrationPoints[id]++;

  if (CalibrationPoints[id] == 5) {
    node.style.setProperty('background-color', 'yellow');
    node.setAttribute('disabled', 'disabled');
    PointCalibrate++;
  } else if (CalibrationPoints[id] < 5) {
    var opacity = 0.2 * CalibrationPoints[id] + 0.2;
    node.style.setProperty('opacity', opacity);
  }

  if (PointCalibrate == 8) {
    document.getElementById('Pt5').style.removeProperty('display');
  }

  if (PointCalibrate >= 9) {
    document.querySelectorAll('.Calibration').forEach((i) => {
      i.style.setProperty('display', 'none');
    });
    document.getElementById('Pt5').style.removeProperty('display');
    var canvas = document.getElementById("plotting_canvas");
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    calcAccuracy();
  }
}

function docLoad() {
  ClearCanvas();
  helpModalShow();
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.addEventListener('click', () => calPointClick(i));
  });
}

// Probanden-ID aus `localStorage` abrufen und global setzen
window.addEventListener('load', function () {
  // FULLSCREEN CHECK
  checkFullscreenAndPrompt();

  docLoad();

  function checkProbandenID() {
    const probandenId = localStorage.getItem('probanden_id');
    if (probandenId) {
      window.probanden_id = probandenId;
      console.log(`✅ Probanden-ID erfolgreich geladen: ${window.probanden_id}`);
    } else {
      console.warn("⚠️ Probanden-ID noch nicht gefunden. Warte auf Update...");
      setTimeout(checkProbandenID, 500);
    }
  }

  checkProbandenID();  // Stellt sicher, dass die neue ID geladen wird

  // "Spiel starten"-Fix für den Button
  var iframeStartBtn = document.getElementById('iframestart');
  if (iframeStartBtn) {
    iframeStartBtn.addEventListener('click', function () {
      document.getElementById('iframe-container').style.display = 'block';
      console.log('IFrame sichtbar gemacht');
    });
  } else {
    console.error("❌ Button 'iframestart' nicht gefunden.");
  }

  webgazer.setRegression('ridge')
    .setGazeListener(function (data, elapsedTime) {
      if (data !== null) {
        let x = data.x;
        let y = data.y;

        if (recordingActive) {
          gazeData.push({ x: x, y: y, time: elapsedTime });
          console.log(`Recording GazeData - X: ${x}, Y: ${y}, Time: ${elapsedTime}`);
        } else {
          console.log(`GazeData ohne Aufnahme - X: ${x}, Y: ${y}, Time: ${elapsedTime}`);
        }
      }
    }).begin();
});


/**
 * Speicherung der Blickdaten mit Probanden-ID
 */
window.recording_start = function startRecording() {
  gazeData = [];
  recordingActive = true;
  console.log('Blickdatenaufzeichnung gestartet.');
};

window.recording_stop = function stopRecording(gameName) {
  recordingActive = false;

  if (!window.probanden_id) {
      console.error("Fehler: Probanden-ID ist nicht gesetzt!");
      return;
  }

  

  console.log(`Blickdatenaufzeichnung beendet für ${gameName}. Gespeicherte Daten:`, gazeData);
  console.log("✅ gameStats erfolgreich von window geladen:", gameStats);

  if (gameName === "tictactoe") {
    // 🔥 Prüfen, ob `gameStats` in `window.parent` existiert
      const ttt_gameStats = window.parent.ttt_Stats || {};
      const gameStatsStringified = {
          table: "tictactoe_game",  // ✅ Korrektur: table ist jetzt gesetzt!
          probanden_id: window.probanden_id,
          rundenanzahl: ttt_gameStats.rundenanzahl || 0,
          siege: ttt_gameStats.siege || 0,
          unentschieden: ttt_gameStats.unentschieden || 0,
          verluste: ttt_gameStats.verluste || 0,
          zuganzahl: ttt_gameStats.zuganzahl || "[]",
          gazeData: JSON.stringify(gazeData),  // ✅ Korrektur: Blickdaten richtig übergeben
          rundenzeiten: ttt_gameStats.rundenzeiten || "[]",
          rundenzeit_insgesamt: ttt_gameStats.rundenzeit_insgesamt || 0,
           // NEU:
          gazeGuidanceMoves: ttt_gameStats.gazeGuidanceMoves ,
          gazeGuidanceMethod: ttt_gameStats.gazeGuidanceMethod
      };

      fetch('../../../gaze-guidance/db/save_game_data.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(gameStatsStringified)
      })
      .then(response => response.text())
      .then(result => {
          console.log('✅ Tic-Tac-Toe Daten erfolgreich gespeichert:', result);
      })
      .catch(error => {
          console.error('❌ Fehler beim Speichern der Tic-Tac-Toe-Daten:', error);
      }); 

      
    } else if (gameName === "memory") {
    const gameStats = window.parent.gameStats || {};
    const data = {
        table: "memory_game",
        probanden_id: window.parent.probanden_id,
        // Alte Felder
        gazeData: JSON.stringify(gazeData),
        playTime: document.getElementById("iframe-container").contentWindow.elapsedTime || 
                  document.getElementById("iframe-container").contentWindow.elapsedTime2,
        
        // NEU: Gaze Guidance JSON
        gazeGuidanceMethod: gameStats.gazeGuidanceMethod,
        gazeGuidanceMoves: gameStats.gazeGuidanceMoves || "[]"
    };

        fetch('../../../gaze-guidance/db/save_game_data.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
          })
          .then(response => response.text())
          .then(result => {
              console.log('✅ Daten erfolgreich gespeichert:', result);
          })
          .catch(error => {
              console.error('❌ Fehler beim Speichern der Daten:', error);
          });

        } else if (gameName === "puzzle") {
          const puzzleStats = window.parent.puzzleStats || {};
      
          const data = {
              table: "puzzle_game",
              probanden_id: window.probanden_id,
              gazeData: JSON.stringify(gazeData),
              playTime: document.getElementById("iframe-container").contentWindow.elapsedTime2 || 0,
              gazeGuidanceMethod: puzzleStats.gazeGuidanceMethod
          };
      
          // Jetzt ist data deklariert, also ist das erlaubt:
          if (puzzleStats.gazeGuidanceMoves) {
              data.gazeGuidanceMoves = JSON.stringify(puzzleStats.gazeGuidanceMoves);
          }
      
          fetch('../../../gaze-guidance/db/save_game_data.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          })
          .then(response => response.text())
          .then(result => {
              console.log('✅ Puzzle-Daten erfolgreich gespeichert:', result);
          })
          .catch(error => {
              console.error('❌ Fehler beim Speichern der Puzzle-Daten:', error);
          });
      }
};



function ShowCalibrationPoint() {
  localStorage.removeItem("calibration_accuracy");
  console.log("🧹 Accuracy-Wert aus localStorage entfernt (neue Kalibrierung gestartet)");
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.removeProperty('display');
  });
  document.getElementById('Pt5').style.setProperty('display', 'none');
}

function ClearCalibration() {
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.setProperty('background-color', 'red');
    i.style.setProperty('opacity', '0.2');
    i.removeAttribute('disabled');
  });

  CalibrationPoints = {};
  PointCalibrate = 0;
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
