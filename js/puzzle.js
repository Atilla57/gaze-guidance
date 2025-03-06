window.gameName = "puzzle";

const gridSize = 5; // 5x5-Raster
const totalPieces = gridSize * gridSize;

const frame = document.getElementById("puzzle-frame");
const pieces = document.getElementById("puzzle-pieces");

// Berechnung der neuen Puzzleteilgröße
const pieceSize = Math.floor(600 / gridSize); // 600px für das gesamte Puzzle

// -------------------------------------
// 1) Gaze Guidance: Hervorgehobenes Teil
// -------------------------------------
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
    piece.style.backgroundImage = `url('../img/puzzle/puzzle-pieces/image_part_${imageNumber}.jpg')`;
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
function applyGazeGuidance() {
    // Wähle ein zufälliges Teil aus, das NICHT unscharf wird
    const randomIndex = Math.floor(Math.random() * puzzlePieces.length);
    highlightedPiece = puzzlePieces[randomIndex];

    // Markiere und manipuliere alle Teile
    puzzlePieces.forEach(piece => {
        if (piece === highlightedPiece) {
            // Das besondere Teil -> heller statt blur
            piece.style.filter = "brightness(1.2)";
            piece.dataset.gazeGuidance = "true";
            highlightedPiece.style.borderWidth = "1.8px"; 
            //highlightedPiece.style.width = "104px";
            //highlightedPiece.style.height = "100px";
        } else {
            // Alle anderen leicht unscharf machen
            piece.style.filter = "grayscale(35%)";
            piece.style.opacity = "0.9";
          
        }
    });

    console.log("🔹 Gaze Guidance aktiv: 1 Teil heller, Rest minimal unscharf.");
}

// Rufe Gaze Guidance auf
applyGazeGuidance();

// Drag-and-Drop Events
let draggedItem = null;

function dragStart(e) {
    draggedItem = e.target;
    // Wenn Spieler das hervorgehobene Teil schnappt
    if (draggedItem === highlightedPiece) {
        console.log(`📌 Spieler bewegt das hervorgehobene Teil (Index: ${draggedItem.dataset.index})`);
    }
}

frame.addEventListener("dragover", (e) => {
    e.preventDefault();
});

frame.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedItem) {
        const targetCell = e.target;
        if (targetCell.classList.contains("cell") && !targetCell.hasChildNodes()) {
            targetCell.appendChild(draggedItem);
            draggedItem = null;

            setTimeout(checkIfPuzzleSolved, 100);
        }
    }
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
        const solutionImagePath = "../img/puzzle/puzzle-pieces/solution_landscape.jpeg"; 
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

    stopTimer();
    alert("Glückwunsch! 🎉 Du hast das Puzzle gelöst!\nBenötigte Zeit: " + timerElement.textContent + "\nNach Bestätigung mit OK wirst Du in 5 Sekunden zur Startseite zurückgeleitet");

    setTimeout(() => {
        window.location.href = "../games/tictactoe.html";
    }, 5000);
}
