window.gameName = "tictactoe";

let rundenzeiten = [];
let rundenzeit_insgesamt = 0;
let zuganzahl = [];
let aktuelleZuganzahl = 0;
let startTime;

document.addEventListener("DOMContentLoaded", function() {
    const size = 5;
    const winCondition = 4;
    let board;
    let gameOver = false;
    let playerCanClick = true;
    let playerScore = 0;
    let computerScore = 0;
    let unentschieden = 0;
    let roundCounter = 0;
    
    function initializeGame() {
        board = Array.from({ length: size }, () => Array(size).fill(""));
        gameOver = false;
        aktuelleZuganzahl = 0;  // Setze Zuganzahl für neue Runde zurück
        startTime = Date.now(); // Starte Zeitmessung für neue Runde
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
        document.getElementById("score").textContent = `Spieler X: ${playerScore} | Unentschieden: ${unentschieden} | Computer O: ${computerScore}`;
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
        aktuelleZuganzahl++;  // 🔥 Zug zählen

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
            aktuelleZuganzahl++;  // Zug zählen
            playerCanClick = false;
    
            if (checkWin("X")) {
                playerScore++;
                updateScore();
                setTimeout(() => alert("Spieler X gewinnt diese Runde!"), 100);
                checkGameEnd();
                return;
            }
            if (board.flat().every(cell => cell !== "")) {
                setTimeout(() => alert("Unentschieden, nächste Runde!"), 100);
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
        let endTime = Date.now();
        let rundenzeit = (endTime - startTime) / 1000;  // Rundenzeit in Sekunden
        rundenzeiten.push(rundenzeit);
        zuganzahl.push(aktuelleZuganzahl);
        rundenzeit_insgesamt += rundenzeit;
    
        // 🔥 Falls das Spielfeld voll ist, aber niemand gewonnen hat = Unentschieden
        if (board.flat().every(cell => cell !== "")) {
            unentschieden++; // ✅ Zähler für Unentschieden erhöhen
            updateScore(); // ✅ Score aktualisieren
            setTimeout(() => {
                roundCounter++;
                initializeGame();
            }, 1000);
            return;
        }
    
        // 🔥 Falls ein Spieler 5 Punkte erreicht hat = Spielende
        if (playerScore === 5 || computerScore === 5) {
            setTimeout(() => {
                alert(`Spiel beendet! Gewinner: ${playerScore === 5 ? "Spieler X" : "Computer O"}`);
    
                // ✅ `gameStats` in `window.parent` speichern (damit `calibration.js` darauf zugreifen kann)
                window.parent.gameStats = {
                    table: "tictactoe_game",
                    probanden_id: window.parent.probanden_id,
                    rundenanzahl: 5,
                    siege: playerScore,
                    unentschieden: unentschieden,  // ✅ Fix: Unentschieden wird jetzt mitgezählt
                    verluste: computerScore,
                    zuganzahl: JSON.stringify(zuganzahl),
                    blickdaten: JSON.stringify(window.parent.gazeData),
                    rundenzeiten: JSON.stringify(rundenzeiten),
                    rundenzeit_insgesamt: rundenzeit_insgesamt
                };
    
                console.log("✅ gameStats erfolgreich an window.parent übergeben:", window.parent.gameStats);
    
                setTimeout(() => {
                    window.parent.recording_stop(gameName);
                }, 500); // ✅ Verzögerung, um sicherzustellen, dass `gameStats` gespeichert ist
    
                setTimeout(() => {
                    window.location.href = "../startpage.html";
                }, 4000);
            }, 100);
        } else {
            setTimeout(() => {
                roundCounter++;
                initializeGame();
            }, 100);
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

window.addEventListener("load", function() {
    setTimeout(() => {
        alert("Sobald du auf OK klickst, beginnt das Spiel und die Blickdatenaufzeichnung.");
        console.log("Tic-Tac-Toe startet - Blickdatenaufzeichnung beginnt.");

        if (typeof window.parent.recording_start === "function") {
            window.parent.recording_start(); // 🔥 Blickaufzeichnung sicher starten
            console.log("✅ recording_start() wurde erfolgreich aufgerufen!");
        } else {
            console.error("❌ Fehler: recording_start() ist nicht verfügbar! Prüfe calibration.js.");
        }

        initializeGame(); // Erstes Spiel starten
    }, 200);
});

function saveGameData() {
    
    console.log("✅ [DEBUG] Daten, die an save_game_data.php gesendet werden:", window.parent.gameStats);

fetch("../../../gaze-guidance/db/save_game_data.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(window.parent.gameStats) // 🔥 Nutze die übergeordnete `gameStats`!
})

    .then(response => response.text())
    .then(data => console.log("✅ [DEBUG] Antwort von save_game_data.php:", data))
    .catch(error => console.error("❌ Fehler beim Speichern:", error));
}




    initializeGame();

    
});



