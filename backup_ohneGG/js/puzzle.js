window.gameName = "puzzle";

const gridSize = 5; // 5x5-Raster
const totalPieces = gridSize * gridSize;

const frame = document.getElementById("puzzle-frame");
const pieces = document.getElementById("puzzle-pieces");

// Berechnung der neuen Puzzleteilgröße
const pieceSize = Math.floor(600 / gridSize); // 600px für das gesamte Puzzle

// Raster-Felder erstellen
for (let i = 0; i < totalPieces; i++) {
    const cell = document.createElement("div");
    cell.style.width = `{100- 2}px`; // Platz für Rand lassen
    cell.style.height = `{100- 2}px`;
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
    piece.style.width = `100px`;
    piece.style.height = `100px`;

    piece.addEventListener("dragstart", dragStart);
    puzzlePieces.push(piece);
}

// Puzzleteile mischen und hinzufügen
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

shuffle(puzzlePieces);
puzzlePieces.forEach(piece => pieces.appendChild(piece));

// Drag-and-Drop Events
let draggedItem = null;

function dragStart(e) {
    draggedItem = e.target;
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

    // **Event-Listener für das Schließen des Overlays**
    const overlayElement = document.getElementById("image-overlay");
    const closeOverlayButton = document.getElementById("close-overlay");

    // Klick auf das X-Icon
    closeOverlayButton.addEventListener("click", function () {
        closeSolutionImage();
    });

    // Klick auf den Hintergrund schließt das Overlay
    overlayElement.addEventListener("click", function (e) {
        if (e.target === overlayElement) {
            closeSolutionImage();
        }
    });
});

// **Funktion zum Öffnen des Lösungsbildes im Overlay**
function showSolutionImage(imagePath) {
    const overlay = document.getElementById("image-overlay");
    const overlayImage = document.getElementById("overlay-image");

    overlay.style.display = "flex";
    overlayImage.src = imagePath;
}

// **Funktion zum Schließen des Overlays**
function closeSolutionImage() {
    document.getElementById("image-overlay").style.display = "none";
}


// **Funktion zum Öffnen des Lösungsbildes in Vollbild-Overlay**
function showSolutionImage(imagePath) {
    const overlay = document.getElementById("image-overlay");
    const overlayImage = document.getElementById("overlay-image");

    overlay.style.display = "flex";
    overlayImage.src = imagePath;
}

// **Funktion zum Schließen des Overlays**
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
