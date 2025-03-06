const gameName = "tictactoe";

document.addEventListener("DOMContentLoaded", function() {
    const size = 5;
    const winCondition = 4;
    let board;
    let gameOver = false;
    let playerCanClick = true;
    let playerScore = 0;
    let computerScore = 0;
    let roundCounter = 0;
    
    function initializeGame() {
        board = Array.from({ length: size }, () => Array(size).fill(""));
        gameOver = false;
        createBoard();
        if (roundCounter % 2 === 1) {
            playerCanClick = false;
            setTimeout(() => computerMove(), 500);
        } else {
            playerCanClick = true;
        }
    }
    
    function createBoard() {
        const boardElement = document.getElementById("tic-tac-toe-board");
        boardElement.innerHTML = "";
        boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener("click", playerMove);
                boardElement.appendChild(cell);
            }
        }
    }
    
    function updateScore() {
        document.getElementById("score").textContent = `Spieler X: ${playerScore} | Computer O: ${computerScore}`;
    }
    
    function findBestMove() {
let bestScore = -Infinity;
let move = null;

for (let i = 0; i < size; i++) {
for (let j = 0; j < size; j++) {
    if (!board[i][j]) {
        board[i][j] = "O"; 
        let score = minimax(board, 0, false, -Infinity, Infinity);
        board[i][j] = "";

        if (score > bestScore) {
            bestScore = score;
            move = { row: i, col: j };
        }
    }
}
}

// 15% Wahrscheinlichkeit, dass der Computer einen schlechteren Zug macht
if (Math.random() < 0.15) {
let emptyCells = [];
for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
        if (!board[i][j]) {
            emptyCells.push({ row: i, col: j });
        }
    }
}
if (emptyCells.length > 0) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}
}

return move;
}


function minimax(board, depth, isMaximizing, alpha, beta) {
if (checkWin("O")) return 10 - depth; 
if (checkWin("X")) return depth - 10;
if (board.flat().every(cell => cell !== "")) return 0;

if (depth >= 4) return 0; // Tiefenlimit

if (isMaximizing) {
let bestScore = -Infinity;
for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
        if (!board[i][j]) {
            board[i][j] = "O";
            let score = minimax(board, depth + 1, false, alpha, beta);
            board[i][j] = "";
            bestScore = Math.max(score, bestScore);
            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) break; // Abbruch, wenn weiterer Suchbaum nicht nötig ist
        }
    }
}
return bestScore;
} else {
let bestScore = Infinity;
for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
        if (!board[i][j]) {
            board[i][j] = "X";
            let score = minimax(board, depth + 1, true, alpha, beta);
            board[i][j] = "";
            bestScore = Math.min(score, bestScore);
            beta = Math.min(beta, bestScore);
            if (beta <= alpha) break; // Abbruch, wenn weiterer Suchbaum nicht nötig ist
        }
    }
}
return bestScore;
}
}



// Computer setzt eigene Gabeln
function createFork() {
for (let i = 0; i < size; i++) {
for (let j = 0; j < size; j++) {
    if (!board[i][j]) {
        board[i][j] = "O";
        let forkCount = countForks("O");
        board[i][j] = "";
        if (forkCount >= 2) {
            return { row: i, col: j };
        }
    }
}
}
return null;
}


// Verhindert Gabelangriffe
function preventFork() {
for (let i = 0; i < size; i++) {
for (let j = 0; j < size; j++) {
    if (!board[i][j]) {
        board[i][j] = "X";
        let forkCount = countForks("X");
        board[i][j] = "";
        if (forkCount >= 2) {
            return { row: i, col: j };
        }
    }
}
}
return null;
}

// Zählt mögliche Gabeln des Spielers
function countForks(player) {
let forkCount = 0;
for (let i = 0; i < size; i++) {
for (let j = 0; j < size; j++) {
    if (!board[i][j]) {
        board[i][j] = player;
        if (checkWin(player)) forkCount++;
        board[i][j] = "";
    }
}
}
return forkCount;
}



// Gezieltes Blockieren von 2 nebeneinander liegenden X (horizontal, vertikal, diagonal)
function findBestBlock(row, col) {
let directions = [
[1, 0], [-1, 0], [0, 1], [0, -1], // Vertikal & Horizontal
[1, 1], [-1, -1], [1, -1], [-1, 1] // Diagonal
];

for (let [dr, dc] of directions) {
let r1 = row + dr, c1 = col + dc;
let r2 = row - dr, c2 = col - dc;

if (isValid(r1, c1) && isValid(r2, c2) && board[r1][c1] === "X" && board[r2][c2] === "X") {
    return { row, col }; // Blocke das Feld zwischen den X
}
if (isValid(r1, c1) && board[r1][c1] === "X" && isValid(row - dr, col - dc) && board[row - dr][col - dc] === "") {
    return { row: row - dr, col: col - dc }; // Blocke das offene Ende
}
if (isValid(r2, c2) && board[r2][c2] === "X" && isValid(row + dr, col + dc) && board[row + dr][col + dc] === "") {
    return { row: row + dr, col: col + dc }; // Blocke das andere Ende
}
}
return null;
}

// Hilfsfunktion: Ist die Position gültig?
function isValid(row, col) {
return row >= 0 && row < size && col >= 0 && col < size;
}

// Hilfsfunktion zur Zählung benachbarter X-Steine
function countNear(player, row, col) {
let count = 0;
let directions = [
[1, 0], [-1, 0], [0, 1], [0, -1], // Vertikal und Horizontal
[1, 1], [-1, -1], [1, -1], [-1, 1] // Diagonal
];

for (let [dr, dc] of directions) {
let r = row + dr;
let c = col + dc;
if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
    count++;
}
}
return count;
}


    
    function computerMove() {
        if (gameOver) return;
        let bestMove = findBestMove();
        if (bestMove) {
            let { row, col } = bestMove;
            board[row][col] = "O";
            document.querySelector(`[data-row='${row}'][data-col='${col}']`).textContent = "O";
            
            if (checkWin("O")) {
                computerScore++;
                updateScore();
                setTimeout(() => alert("Computer O gewinnt diese Runde!"), 100);
                checkGameEnd();
                return;
            }
        }
        playerCanClick = true;
    }
    
    function playerMove(event) {
        if (gameOver || !playerCanClick) return;
        let cell = event.target;
        let row = parseInt(cell.dataset.row);
        let col = parseInt(cell.dataset.col);
        if (!board[row][col]) {
            board[row][col] = "X";
            cell.textContent = "X";
            playerCanClick = false;
            
            if (checkWin("X")) {
                playerScore++;
                updateScore();
                setTimeout(() => alert("Spieler X gewinnt diese Runde!"), 100);
                checkGameEnd();
                return;
            }
            if (board.flat().every(cell => cell !== "")) {
                setTimeout(() => alert("Unentschieden!"), 100);
                checkGameEnd();
                return;
            }
            setTimeout(() => {
                computerMove();
            }, 1000);
        }
    }
    
    function checkGameEnd() {
gameOver = true;

if (playerScore === 5 || computerScore === 5) {
setTimeout(() => {
    alert(`Spiel beendet! Gewinner: ${playerScore === 5 ? "Spieler X" : "Computer O"}`);
    window.parent.recording_stop();
    setTimeout(() => {
        window.location.href = "../startpage.html";
    }, 2000); // Zeigt das Spielfeld für 2 Sekunden, bevor es zur Startseite geht
}, 100);
} else if (board.flat().every(cell => cell !== "")) {
setTimeout(() => {
    alert("Unentschieden! Das Spielfeld ist voll.");
    setTimeout(() => {
        roundCounter++;
        initializeGame();
    }, 2000); // Warte 2 Sekunden, damit das Spielfeld sichtbar bleibt
}, 100);
} else {
setTimeout(() => {
    roundCounter++;
    initializeGame();
}, 100); // Verhindert, dass das Feld vor dem Alert gelöscht wird
}
}

function checkWin(player) {
function countInDirection(row, col, rowDir, colDir) {
let count = 0;
for (let i = 0; i < winCondition; i++) {
    let r = row + i * rowDir;
    let c = col + i * colDir;
    if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
        count++;
    } else {
        break;
    }
}
return count >= winCondition;
}

for (let i = 0; i < size; i++) {
for (let j = 0; j < size; j++) {
    if (
        countInDirection(i, j, 1, 0) ||  // Vertikal
        countInDirection(i, j, 0, 1) ||  // Horizontal
        countInDirection(i, j, 1, 1) ||  // Diagonal nach unten rechts
        countInDirection(i, j, 1, -1)    // Diagonal nach unten links
    ) {
        return true;
    }
}
}
return false;
}    
    initializeGame();

    
});














// PUZZLE 4x4

window.gameName = "puzzle";

const gridSize = 5; // Ändere das Raster auf 5x5
const totalPieces = gridSize * gridSize;

const frame = document.getElementById("puzzle-frame");
const pieces = document.getElementById("puzzle-pieces");

// Berechnung der neuen Puzzleteilgröße
const pieceSize = Math.floor(600 / gridSize); // Annahme: 600px Breite für das Puzzle

// Raster-Felder erstellen
for (let i = 0; i < totalPieces; i++) {
    const cell = document.createElement("div");
    cell.style.width = `${pieceSize - 2}px`; // Platz für den Rand lassen
    cell.style.height = `${pieceSize - 2}px`;
    cell.style.backgroundColor = "#f0f0f0";
    cell.style.margin = "1px";
    cell.classList.add("cell"); // Zelle markieren
    frame.appendChild(cell);
}

// Puzzleteile erstellen
const puzzlePieces = [];
for (let i = 0; i < totalPieces; i++) {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.draggable = true;
    piece.dataset.index = i + 1; // Nummer des Puzzleteils

    const imageNumber = String(i + 1).padStart(3, '0'); // Formatiert 1 → 001
    piece.style.backgroundImage = `url('../img/puzzle/puzzle-pieces/image_part_${imageNumber}.jpg')`;
    piece.style.width = `${pieceSize}px`;
    piece.style.height = `${pieceSize}px`;

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

            // Nach jedem Drop die Gewinnprüfung durchführen
            setTimeout(checkIfPuzzleSolved, 100);
        }
    }
});

// Ursprungsbereich erlaubt das Ablegen
pieces.addEventListener("dragover", (e) => {
    e.preventDefault();
});

pieces.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedItem) {
        pieces.appendChild(draggedItem); // Zurück in den Ursprungsbereich
        draggedItem = null;
    }
});

// Lösungsbild anzeigen
const solutionContainer = document.getElementById("solution-image");
solutionContainer.style.backgroundImage = "url('../img/puzzle/puzzle-pieces/solution_landscape.jpeg')";

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
});

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

function highlightPuzzleFrame() {
    frame.style.border = "4px solid green";
    frame.style.transition = "border 0.5s ease";
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
    highlightPuzzleFrame();
    elapsedTime2 = timerElement.textContent;
    alert("Glückwunsch! 🎉 Du hast das Puzzle gelöst!\nBenötigte Zeit: " + elapsedTime2 + "\nNach Bestätigung mit OK wirst Du in 5 Sekunden zur Startseite zurückgeleitet");

    setTimeout(() => {
        window.location.href = "../games/tictactoe.html";
    }, 5000);
}
