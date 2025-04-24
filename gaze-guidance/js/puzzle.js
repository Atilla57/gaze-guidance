window.gameName = "puzzle";

let moveLog = []; // Speichert alle Züge
let isGG_valid = false;
let currentGGCell = null;
const gridSize = 5; // 5x5-Raster
const totalPieces = gridSize * gridSize;

// Am Anfang der Datei:
const availablePuzzles = ["puzzle_1", "puzzle_2", "puzzle_5", "puzzle_6", "puzzle_7"];

// Ganz oben oder im DOMContentLoaded:
const chosenPuzzle = availablePuzzles[Math.floor(Math.random() * availablePuzzles.length)];
console.log("➡️ Gewähltes Puzzle:", chosenPuzzle);


let currentPuzzleGuidanceMethod = window.GazeGuidanceConfig?.puzzle || "rotation";
console.log("🎯 Gaze Guidance Methode für Puzzle:", currentPuzzleGuidanceMethod);

// Wahrscheinlichkeit, mit der pro Zug überhaupt Gaze Guidance angewendet wird
// z.B. 0.8 = 80 %
const PUZZLE_GUIDANCE_PROB = 0.4;


const frame = document.getElementById("puzzle-frame");
const pieces = document.getElementById("puzzle-pieces");

// Berechnung der neuen Puzzleteilgröße
const pieceSize = Math.floor(600 / gridSize); // 600px für das gesamte Puzzle

let highlightedPiece = null; // Speichert das besondere Puzzleteil

// Raster-Felder erstellen
for (let i = 0; i < totalPieces; i++) {
    const cell = document.createElement("div");
    // Fix: statt {100- 2}px => "98px"
    cell.style.width = "98px";
    cell.style.height = "98px";
    cell.style.backgroundColor = "#f0f0f0";
    cell.style.margin = "1px";
    cell.classList.add("cell");
    frame.appendChild(cell);
}

// Puzzleteile erstellen
const puzzlePieces = [];
for (let i = 0; i < totalPieces; i++) {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.draggable = true;
    piece.dataset.index = i + 1;

    const imageNumber = String(i + 1).padStart(3, '0');
    piece.style.backgroundImage = piece.style.backgroundImage = `url('../img/puzzle/${chosenPuzzle}/image_part_${imageNumber}.jpg')`;
    piece.style.width = "100px";
    piece.style.height = "100px";

    piece.addEventListener("dragstart", dragStart);
    puzzlePieces.push(piece);
}

// Mische die Puzzleteile und füge sie ins DOM ein
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffle(puzzlePieces);
puzzlePieces.forEach(piece => pieces.appendChild(piece));

// -------------------------------------
// 2) Gaze Guidance anwenden
// -------------------------------------

function getMatchingCell(piece) {
    // puzzlePieces haben dataset.index = i+1 (1 basiert)
    const index = parseInt(piece.dataset.index, 10) - 1;
 
    // puzzle-frame hat 25 childNodes in genau der Reihenfolge 
    // => frame.children[index]
    return frame.children[index];
 }
 


 function applyGazeGuidance() {
    // Nur mit PUZZLE_GUIDANCE_PROB‑Chance
    if (Math.random() > PUZZLE_GUIDANCE_PROB) {
       return;
    }
    const availablePieces = puzzlePieces.filter(piece => !isPiecePlaced(piece));

    if (availablePieces.length === 0) {
        console.log("⚠️ Keine verfügbaren Teile mehr für Gaze Guidance!");
        return;
    }


    // Zufällig ein Teil auswählen
    const randomIndex = Math.floor(Math.random() * availablePieces.length);
    highlightedPiece = availablePieces[randomIndex];


    // Methode anwenden
    switch (currentPuzzleGuidanceMethod) {
        case "rotation": applyRotation(highlightedPiece)
            break;
        case "border": applyBorder(highlightedPiece)
            break;
        case "contrast": applyContrast(highlightedPiece)
            break;
    }

    highlightedPiece.dataset.gazeGuidance = "true";

     // ✨ NEU: Nur den Index merken, NICHT einfärben
     const targetCell = getMatchingCell(highlightedPiece);
     if (targetCell) {
         // So findest du heraus, welcher index das `targetCell` hat
         // Da frame.children ein HTMLCollection ist, können wir es in ein Array umwandeln:
         const allCellsArr = Array.from(frame.children);
         const cellIndex = allCellsArr.indexOf(targetCell);
         highlightedPiece.dataset.targetCellIndex = cellIndex;
     }
    
    /*if (currentPuzzleGuidanceMethod !== "none") {
        const targetCell = getMatchingCell(highlightedPiece);
        if (targetCell) {
            targetCell.style.backgroundColor = "lightgrey";
            targetCell.dataset.gazeGuidanceTarget = "true";
            isGG_valid = true;
            currentGGCell = targetCell;

            setTimeout(() => {
                if (currentGGCell) {
                    currentGGCell.style.backgroundColor = "#F0F0F0";
                    delete currentGGCell.dataset.gazeGuidanceTarget;
                }
                isGG_valid = false;
                currentGGCell = null;
            }, 2000);
        }
    } else {return};*/

}




function applyRotation(piece) {
    if (currentPuzzleGuidanceMethod === "rotation") {
        const angle = getConstrainedRotation();
        piece.style.transform = `rotate(${angle}deg)`;
        //card.style.transform = `rotate(45deg)`;
    }
}

function applyContrast(piece) {
    if (currentPuzzleGuidanceMethod === "contrast") {
        piece.style.filter = "brightness(1.2)";
        //piece.style.filter = "brightness(2)";
    }
}

function applyBorder(piece) {
    if (currentPuzzleGuidanceMethod === "border") {
        piece.style.border = "3px solid lightgrey";
    }
}



function getConstrainedRotation() {
    const MIN_ABS = 0.5;
    const MAX_ABS = 2;
    // Entweder positive oder negative Richtung
    const sign = Math.random() < 0.5 ? -1 : 1;
    // Magnitude gleichverteilt zwischen 0.5 und 2
    const mag = Math.random() * (MAX_ABS - MIN_ABS) + MIN_ABS;
    const angle = sign * mag;
    return angle.toFixed(2);
  }

  

function isPiecePlaced(piece) {
    // Wenn das Teil NICHT mehr in `pieces` liegt, gilt es als platziert
    return piece.parentElement !== pieces;
 
}

// Rufe Gaze Guidance auf
applyGazeGuidance();

function resetPuzzleGuidance() {
    puzzlePieces.forEach(piece => {
        piece.style.transform = "";
        piece.style.filter = "";
        piece.style.border = "";
        delete piece.dataset.gazeGuidance;
    });

    for (let i = 0; i < frame.children.length; i++) {
        frame.children[i].style.border = "1px solid #f0f0f0";
        delete frame.children[i].dataset.gazeGuidanceTarget;
    }
}



// Drag-and-Drop Events
let draggedItem = null;

function dragStart(e) {
    draggedItem = e.target;

    if (draggedItem) {
        let rect = draggedItem.getBoundingClientRect();
        draggedItem.dataset.startX = rect.x;
        draggedItem.dataset.startY = rect.y;

        draggedItem.dataset.startRow = Math.floor(rect.y / pieceSize);
        draggedItem.dataset.startCol = Math.floor(rect.x / pieceSize);
    }

    
    // ✨ NEU: Wenn das Teil GazeGuidance hat, dann Zelle hervorheben
    if (draggedItem && draggedItem.dataset.gazeGuidance === "true") {
        const indexStr = draggedItem.dataset.targetCellIndex;
        if (indexStr) {
            const cellIndex = parseInt(indexStr, 10);
            const allCellsArr = Array.from(frame.children);
            const targetCell = allCellsArr[cellIndex];
            if (targetCell) {
                targetCell.style.backgroundColor = "rgba(252, 252, 252, 0.4)";
                targetCell.dataset.gazeGuidanceTarget = "true";
                  // ⏲ Timeout (z.B. 2000 ms) – danach Highlight entfernen, falls noch vorhanden
                  setTimeout(() => {
                    // Nur entfernen, wenn der Nutzer es noch nicht gedroppt hat:
                    if (targetCell.dataset.gazeGuidanceTarget === "true") {
                        targetCell.style.backgroundColor = "#f0f0f0";
                        delete targetCell.dataset.gazeGuidanceTarget;
                    }
                }, 2000);

            }
        }
    }


}


frame.addEventListener("dragover", (e) => {
    e.preventDefault();
});

frame.addEventListener("drop", (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    


    // **So**: erst alles zurücksetzen, dann return
    const allCellsArr = Array.from(frame.children);
    allCellsArr.forEach(cell => {
        if (cell.dataset.gazeGuidanceTarget === "true") {
            cell.style.backgroundColor = "#f0f0f0";
            delete cell.dataset.gazeGuidanceTarget;
        }
    });

    const targetCell = e.target;
    if (!targetCell.classList.contains("cell") || targetCell.hasChildNodes()) return;

    // Koordinaten des frame
    let frameRect = frame.getBoundingClientRect();
    // Koordinaten der Zielzelle
    let cellRect = targetCell.getBoundingClientRect();

    let localX = cellRect.x - frameRect.x;
    let localY = cellRect.y - frameRect.y;

    // Jede Zelle ist 98px
    let endRow = Math.floor(localY / 98);
    let endCol = Math.floor(localX / 98);

    // Erwartete Zeile / Spalte
    let index = parseInt(draggedItem.dataset.index, 10);
    let expectedRow = Math.floor((index - 1) / gridSize);
    let expectedCol = (index - 1) % gridSize;
    let correctMove = (endRow === expectedRow && endCol === expectedCol);

    // Gaze Guidance Flags
    let wasGG = draggedItem.dataset.gazeGuidance === "true";
    let isGG = isGG_valid && targetCell === currentGGCell;


    // Timestamp
    let moveTimestamp = performance.now();

    // Die Startkoordinaten, die du in dragStart gespeichert hast
    let startX = parseInt(draggedItem.dataset.startX) || 0;
    let startY = parseInt(draggedItem.dataset.startY) || 0;
    let startRow = parseInt(draggedItem.dataset.startRow) || 0;
    let startCol = parseInt(draggedItem.dataset.startCol) || 0;

    // Move ins Array
    moveLog.push({
        chosenPuzzle: chosenPuzzle,
        zug: moveLog.length + 1,
        start_x: startX,
        start_y: startY,
        end_x: cellRect.x,
        end_y: cellRect.y,
        row_start: startRow,
        col_start: startCol,
        row_end: endRow,
        col_end: endCol,
        wasGazeGuidanceCard: wasGG,
        isGazeGuidance: isGG,
        correct_move: correctMove, 
        timestamp: moveTimestamp
    });

    console.log("[MOVE LOG]", JSON.stringify(moveLog, null, 2));

    // Platziere das Teil
    targetCell.appendChild(draggedItem);
    draggedItem = null;

    // Gaze Guidance reset + neu
    resetPuzzleGuidance();
    setTimeout(() => applyGazeGuidance(), 500);
    setTimeout(checkIfPuzzleSolved, 100);
});






pieces.addEventListener("dragover", (e) => {
    e.preventDefault();
});

pieces.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedItem) {
        pieces.appendChild(draggedItem);
        draggedItem = null;
    }
     // Auch hier alle Zellen resetten
     const allCellsArr = Array.from(frame.children);
     allCellsArr.forEach(cell => {
         if (cell.dataset.gazeGuidanceTarget === "true") {
             cell.style.backgroundColor = "#f0f0f0";
             delete cell.dataset.gazeGuidanceTarget;
         }
     });
});

// Timer-Funktionen
let timerElement = document.getElementById("timer");
let timerInterval;
let startTime;
let isTimerRunning = false;

document.addEventListener("DOMContentLoaded", function () {
    let overlay = document.getElementById("overlay");
    let body = document.body;

    if (!overlay) {
        console.error("Overlay-Element wurde nicht gefunden!");
        return;
    }

    body.style.visibility = "hidden";
    overlay.style.display = "flex";

    alert("Bereit für das Puzzle? Die Zeit startet jetzt!");

    body.style.visibility = "visible";
    overlay.style.display = "none";

    startTimer();

    // **Dynamisch das Lösungsbild setzen**
    const solutionImage = document.getElementById("solution-image");
    if (solutionImage) {
        const solutionImagePath = `../img/puzzle/${chosenPuzzle}/solution_puzzle.jpg`;
        solutionImage.style.backgroundImage = `url('${solutionImagePath}')`;


        // **Lösungsbild kann geklickt werden, um es in einem Overlay anzuzeigen**
        solutionImage.addEventListener("click", function () {
            showSolutionImage(solutionImagePath);
        });
    }


    // Event-Listener für das Schließen des Overlays
    const overlayElement = document.getElementById("image-overlay");
    const closeOverlayButton = document.getElementById("close-overlay");

    closeOverlayButton.addEventListener("click", function () {
        closeSolutionImage();
    });

    overlayElement.addEventListener("click", function (e) {
        if (e.target === overlayElement) {
            closeSolutionImage();
        }
    });
});

// Lösung in Overlay
function showSolutionImage(imagePath) {
    const overlay = document.getElementById("image-overlay");
    const overlayImage = document.getElementById("overlay-image");

    overlay.style.display = "flex";
    overlayImage.src = imagePath;
}

function closeSolutionImage() {
    document.getElementById("image-overlay").style.display = "none";
}

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
        window.parent.recording_start();
    }
}

function updateTimer() {
    window.elapsedTime2 = Math.floor((Date.now() - startTime) / 1000);
    let minutes = Math.floor(elapsedTime2 / 60);
    let seconds = elapsedTime2 % 60;
    timerElement.textContent = `Zeit: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function stopTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    window.parent.recording_stop(gameName);
}

function checkIfPuzzleSolved() {
    const cells = frame.children;

    if (frame.querySelectorAll(".piece").length !== totalPieces) {
        return;
    }

    for (let i = 0; i < cells.length; i++) {
        const piece = cells[i].querySelector(".piece");
        if (!piece) return;

        const expectedIndex = i + 1;
        const actualIndex = parseInt(piece.dataset.index);
        if (expectedIndex !== actualIndex) {
            return;
        }
    }

    // SPIEL BEENDET –> Stop-Timer, JSON-Objekt aufbauen:
    let endTime = Date.now() - startTime; // RICHTIGE Stoppuhr mit ms

    // Puzzle-spezifische Felder
    let puzzleStats = {
        table: "puzzle_game",
        probanden_id: window.parent.probanden_id,
        elapsed_time: endTime,  // Zeit in ms
        gazeGuidanceMoves: moveLog, // **Hier speichern wir ALLES als JSON**
        gazeGuidanceMethod: currentPuzzleGuidanceMethod
    };

    // **gameStats in window.parent speichern**
    window.parent.puzzleStats = puzzleStats;
    console.log("✅ puzzleStats in gameStats gespeichert:", puzzleStats);

    stopTimer();

    console.log("🎯 SPIEL BEENDET! JSON-DATEN:");
    console.log(JSON.stringify({
        table: "puzzle_game",
        probanden_id: window.parent.probanden_id,
        total_moves: moveLog.length,
        correct_moves: moveLog.filter(m => m.correct_move).length,
        incorrect_moves: moveLog.filter(m => !m.correct_move).length,
        elapsed_time: performance.now() - startTime,
        gazeGuidanceMoves: moveLog
    }, null, 2));
  

    alert("Glückwunsch! 🎉 Du hast das Puzzle gelöst!\nBenötigte Zeit: " + timerElement.textContent + "\nNach Bestätigung mit OK wirst Du in 5 Sekunden zur Startseite zurückgeleitet");

    setTimeout(() => {
        window.location.href = "../games/tictactoe.html";
    }, 5000);
}
