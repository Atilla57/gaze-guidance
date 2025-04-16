window.gameName = "tictactoe";

let rundenzeiten = [];
let rundenzeit_insgesamt = 0;
let zuganzahl = [];
let aktuelleZuganzahl = 0;
let startTime;
let moveLog = []; // Speichert alle Züge (Spieler & Computer)

let currentTttGuidanceMethod = window.GazeGuidanceConfig?.tictactoe;
console.log("🎯 Gaze Guidance Methode für TicTacToe:", currentTttGuidanceMethod);

let roundHadGazeGuidance = false;  // true, sobald in dieser Runde ein Feld hervorgehoben wurde


// Zufallswerte für TicTacToe:
const WINNING_HIGHLIGHT_PROB = 0.9;  
const DEFENSIVE_HIGHLIGHT_PROB = 0.9;



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
    
    // Initialisierung des Spiels
    function initializeGame() {
        board = Array.from({ length: size }, () => Array(size).fill(""));
        roundHadGazeGuidance = false;  // bei Rundenstart zurücksetzen
        gameOver = false;
        aktuelleZuganzahl = 0;
        startTime = Date.now();
        createBoard();
        //applyInitialGazeGuidance(); // Außenseiten leicht abdunkeln
        
        // Nach Spielstart beide Guidance-Funktionen aufrufen
        highlightWinningMove();   // Offensiv: Gewinnbringende Felder hervorheben
        highlightDefensiveMove(); // Defensiv: Felder hervorheben, die den Gegner gewinnen lassen würden

        if (roundCounter % 2 === 1) {
            playerCanClick = false;
            setTimeout(() => computerMove(), 500);
        } else {
            playerCanClick = true;
        }
    }
    
    // Erzeugt das Spielfeld
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
    
    const GAZE_GUIDANCE_DURATION_MS = 5000; // 5 Sekunden

function applyCellGazeGuidance(cell) {
    // 1) Style je nach Methode setzen
    roundHadGazeGuidance = true;  // Haben in dieser Runde Gaze Guidance angewendet

    switch (currentTttGuidanceMethod) {
        case "rotation":
            applyRotation(cell);
            break;
        case "contrast":
            applyContrast(cell);
            break;
        case "border":
            applyBorder(cell);
            break;
    }

    // 2) Data-Attribut hinzufügen
    cell.dataset.gazeGuidance = "true";
    cell.dataset.gazeGuidanceMethod = currentTttGuidanceMethod;

    // 3) Timer starten, nach Ablauf Gaze Guidance entfernen
    setTimeout(() => {
        resetGuidanceVisuals(cell);
        // setInitialBrightness(cell);  // Siehe Punkt 3: Rückkehr zur ursprünglichen Abdunklung
        delete cell.dataset.gazeGuidance;
        delete cell.dataset.gazeGuidanceMethod;
    }, GAZE_GUIDANCE_DURATION_MS);
}

function resetGuidanceVisuals(cell) {
    cell.style.filter = "";
    cell.style.border = "";
    cell.style.transform = "";
}

    

    function applyRotation(cell) {
        cell.style.transform = `rotate(${getTinyRotation()}deg)`;
    }
    
    function applyContrast(cell) {
        cell.style.filter = "brightness(96%)";
    }
    
    function applyBorder(cell) {
        cell.style.border = "2px solid rgb(68, 68, 68)";
    }
    

    function getTinyRotation() {
        return (Math.random() * 3 - 1.5).toFixed(2); // ergibt –1.50 bis +1.50 Grad
      }
    


    // Auskommentiert weil kb
    // Außenseiten initial abdunkeln
    function applyInitialGazeGuidance() {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (row === 0 || row === size - 1 || col === 0 || col === size - 1) {
                cell.style.filter = "brightness(75%)";
            } else {
                cell.style.filter = "brightness(80%)";
            }
        });
    }

    function setInitialBrightness(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (row === 0 || row === size - 1 || col === 0 || col === size - 1) {
            cell.style.filter = "brightness(75%)";
        } else {
            cell.style.filter = "brightness(80%)";
        }
    }
    
    
    function highlightWinningMove() {
        if (currentTttGuidanceMethod === "none") return;
    
        // Mit gewisser Wahrscheinlichkeit NICHT hervorheben
        if (Math.random() > WINNING_HIGHLIGHT_PROB) return;
    
        let winningMoves = [];
    
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (!board[i][j]) {
                    board[i][j] = "X"; // Spielerzug simulieren
                    if (checkWin("X")) {
                        winningMoves.push({ row: i, col: j });
                    }
                    board[i][j] = "";
                }
            }
        }
    
        winningMoves.forEach(({ row, col }) => {
            let cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
            if (cell) {
                applyCellGazeGuidance(cell);
            }
        });
    }
    
      
    

  
    
    function highlightDefensiveMove() {
        if (currentTttGuidanceMethod === "none") return;
    
        // Mit gewisser Wahrscheinlichkeit NICHT hervorheben
        if (Math.random() > DEFENSIVE_HIGHLIGHT_PROB) return;
    
        let defensiveMoves = [];
    
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (!board[i][j]) {
                    board[i][j] = "O"; // Gegnerzug simulieren
                    if (checkWin("O")) {
                        defensiveMoves.push({ row: i, col: j });
                    }
                    board[i][j] = "";
                }
            }
        }
    
        defensiveMoves.forEach(({ row, col }) => {
            let cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
            if (cell) {
                applyCellGazeGuidance(cell);
            }
        });
    }
    
    

    function resetFilters() {
        const allCells = document.querySelectorAll(".cell");
        allCells.forEach(cell => {
            cell.style.filter = "";
            cell.style.border = "";
            cell.style.transform = "";
            delete cell.dataset.gazeGuidance;
            delete cell.dataset.gazeGuidanceMethod;
        });
        //applyInitialGazeGuidance();
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
        if (Math.random() < 0.25) {
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
        if (depth >= 4) return 0;

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
                        if (beta <= alpha) break;
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
                        if (beta <= alpha) break;
                    }
                }
            }
            return bestScore;
        }
    }
    
    // NEU: Defensive Züge – Hier könnten auch weitere heuristische Funktionen eingefügt werden
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
    
    function findBestBlock(row, col) {
        let directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [-1, -1], [1, -1], [-1, 1]
        ];
    
        for (let [dr, dc] of directions) {
            let r1 = row + dr, c1 = col + dc;
            let r2 = row - dr, c2 = col - dc;
            if (isValid(r1, c1) && isValid(r2, c2) && board[r1][c1] === "X" && board[r2][c2] === "X") {
                return { row, col };
            }
            if (isValid(r1, c1) && board[r1][c1] === "X" && isValid(row - dr, col - dc) && board[row - dr][col - dc] === "") {
                return { row: row - dr, col: col - dc };
            }
            if (isValid(r2, c2) && board[r2][c2] === "X" && isValid(row + dr, col + dc) && board[row + dr][col + dc] === "") {
                return { row: row + dr, col: col + dc };
            }
        }
        return null;
    }
    
    function isValid(row, col) {
        return row >= 0 && row < size && col >= 0 && col < size;
    }
    
    function countNear(player, row, col) {
        let count = 0;
        let directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1],
            [1, 1], [-1, -1], [1, -1], [-1, 1]
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

    // Für unten
    function getElapsedTimeMs() {
        return Date.now() - startTime; 
        // Gibt z. B. 5283 (ms) zurück, wenn 5,283 s vergangen sind
      }
    
      function computerMove() {
        if (gameOver) return;
        let bestMove = findBestMove();
        if (!bestMove) return;
    
        let { row, col } = bestMove;
        board[row][col] = "O";
    
        // Hol dir das DOM-Element (Zelle), damit wir an die Koordinaten kommen
        const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
        cell.textContent = "O";
        aktuelleZuganzahl++;
    
        // Gaze Guidance Checks
        let wasGG = cell.style.filter.includes("brightness(72%)") || cell.style.border.includes("2.6px ridge");
        let isGG = wasGG && (cell.style.filter.includes("brightness(72%)") || cell.style.border.includes("2.6px ridge"));
    
        // 1) Echte Koordinaten (Zell-Mittelpunkt)
        let rect = cell.getBoundingClientRect();
        let realX = rect.left + (rect.width / 2);
        let realY = rect.top  + (rect.height / 2);
    
        // 2) moveLog speichern
        moveLog.push({
            runde: roundCounter + 1, 
            zug: aktuelleZuganzahl,
            spieler: "O",
    
            // Haupt-Koordinaten => Zell-Mittelpunkt
            x: realX,
            y: realY,

            // Zusätzlich: row/col für deine Spiellogik
            row: row,
            col: col,

            wasGazeGuidanceCard: wasGG,
            isGazeGuidance: isGG,
            whichGazeGuidance: 'none',
            // Falls du die Zeit in ms möchtest
            timestamp: getElapsedTimeMs(), 
        });
    
        console.log("🔹 [MOVE LOG]", JSON.stringify(moveLog, null, 2));
    
        if (checkWin("O")) {
            computerScore++;
            updateScore();
            setTimeout(() => alert("Computer O gewinnt diese Runde!"), 100);
            checkGameEnd();
            return;
        }
    
        // **Board jetzt voll => Unentschieden?**
        if (board.flat().every(c => c !== "")) {
            unentschieden++;
            updateScore();
            alert("Unentschieden! Neues Spiel in 3 Sekunden...");
            setTimeout(() => {
                roundCounter++;
                initializeGame();
            }, 3000);
            return;
        }
        
        playerCanClick = true;
    }
    
    
    function playerMove(event) {
        if (gameOver || !playerCanClick) return;
        // Echte Mauskoordinaten relativ zum sichtbaren Browserfenster
        let clickX = event.clientX;
        let clickY = event.clientY;

        let cell = event.target;
        let row = parseInt(cell.dataset.row);
        let col = parseInt(cell.dataset.col);
        let gazeMethod = "none";

        // Falls Gaze Guidance auf dem Spielfeld vorhanden ist, lese Methode aus
        const allCells = document.querySelectorAll(".cell");
        for (let cellElem of allCells) {
            if (cellElem.dataset.gazeGuidance === "true") {
                gazeMethod = cellElem.dataset.gazeGuidanceMethod || "none";
                break;
            }
        }


        if (!board[row][col]) {
            board[row][col] = "X";
            cell.textContent = "X";
            aktuelleZuganzahl++;
            playerCanClick = false;
    
        // Prüfen, ob irgendwo Gaze Guidance auf dem Feld existiert
        let anyGazeGuidance = Array.from(document.querySelectorAll(".cell"))
        .some(c => c.dataset.gazeGuidance === "true");

        // Prüfen, ob der Spieler gerade eine Zelle mit Gaze Guidance angeklickt hat
        let isGG = (cell.dataset.gazeGuidance === "true");


        // Logik anpassen: Wenn es Gaze Guidance gibt, aber der Spieler sie nicht gewählt hat
        let wasGG = anyGazeGuidance;  // Jetzt auf `true`, sobald irgendwo auf dem Feld eine Gaze Guidance existiert

            
            // Bewegung speichern
            moveLog.push({
                runde: roundCounter + 1,  // **Rundenzähler hinzufügen**
                zug: aktuelleZuganzahl,
                spieler: "X",
                x: clickX,
                y: clickY,
                row: row,
                col: col,
                wasGazeGuidanceCard: roundHadGazeGuidance,   // => true, sobald in dieser Runde jemals Gaze Guidance gesetzt wurde
                isGazeGuidance: cell.dataset.gazeGuidance === "true",  // nur true, solange der Timeout noch läuft
                timestamp: getElapsedTimeMs(),
            });
            


            console.log("🔹 [MOVE LOG]", moveLog);

            if (checkWin("X")) {
                playerScore++;
                updateScore();
                setTimeout(() => alert("Spieler X gewinnt diese Runde!"), 100);
                checkGameEnd();
                return;
            }

            // **HIER: Prüfe, ob das Board jetzt voll ist => Unentschieden**
            if (board.flat().every(c => c !== "")) {
                unentschieden++;
                updateScore();
                alert("Unentschieden! Neues Spiel in 3 Sekunden...");
                setTimeout(() => {
                    roundCounter++;
                    initializeGame();
                }, 3000);
                return;
            }

            setTimeout(() => {
                computerMove();
                // NEU: Aktualisiere beide Guidance-Funktionen nach jedem Zug
                resetFilters();
                highlightWinningMove();
                highlightDefensiveMove();
            }, 1000);
        }
    }


    function checkGameEnd() {
    gameOver = true;
    let endTime = Date.now();
    let rundenzeit = (endTime - startTime) / 1000;
    rundenzeiten.push(rundenzeit);
    zuganzahl.push(aktuelleZuganzahl);
    rundenzeit_insgesamt += rundenzeit;

    // Unentschieden?
    if (board.flat().every(cell => cell !== "")) {
        unentschieden++;
        updateScore();
        setTimeout(() => {
            alert("Unentschieden! Nächste Runde startet in 3 Sekunden...");
            roundCounter++;
            initializeGame();
        }, 3000);
        return;
    }
    
    // Spielende bei 5 Siegen
    if (playerScore === 5 || computerScore === 5) {
        setTimeout(() => {
            alert(`Spiel beendet! Gewinner: ${playerScore === 5 ? "Spieler X" : "Computer O"}`);
            
            window.parent.ttt_Stats = {
                table: "tictactoe_game",
                probanden_id: window.parent.probanden_id,
                rundenanzahl: 5,
                siege: playerScore,
                unentschieden: unentschieden,
                verluste: computerScore,
                zuganzahl: JSON.stringify(zuganzahl),
                rundenzeiten: JSON.stringify(rundenzeiten),
                rundenzeit_insgesamt: rundenzeit_insgesamt,
                // NEU: Alle Moves als JSON
                gazeGuidanceMoves: JSON.stringify(moveLog),
                gazeGuidanceMethod: currentTttGuidanceMethod
            };
          
              console.log("✅ gameStats erfolgreich gesetzt:", window.parent.ttt_Stats);
            
                
                // 3) Falls du Recording stoppen willst
                setTimeout(() => {
                    window.parent.recording_stop(gameName);
                }, 500);

                // 4) UI-Redirect
                setTimeout(() => {
                    window.location.href = "../startpage.html";
                    window.deleteGazeGuidanceConfig(); // Löscht den localStorage-Wert, sodass beim nächsten Nutzer neue Werte gesetzt werden
                    console.log("Config wurde zurückgesetzt?? -->" + localStorage.getItem("gaze_guidance_config"));
                }, 3000);   
        }, 100);
    } 
    else {
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
                    countInDirection(i, j, 1, 0) ||
                    countInDirection(i, j, 0, 1) ||
                    countInDirection(i, j, 1, 1) ||
                    countInDirection(i, j, 1, -1)
                ) {
                    return true;
                }
            }
        }
        return false;
    }
    
    window.addEventListener("load", function() {
            if (!document.fullscreenElement) {
                checkFullscreenAndPrompt();

            }
          
        setTimeout(() => {
            alert("Sobald du auf OK klickst, beginnt das Spiel und die Blickdatenaufzeichnung.");
            console.log("Tic-Tac-Toe startet - Blickdatenaufzeichnung beginnt.");
    
            if (typeof window.parent.recording_start === "function") {
                window.parent.recording_start();
                console.log("✅ recording_start() wurde erfolgreich aufgerufen!");
            } else {
                console.error("❌ Fehler: recording_start() ist nicht verfügbar! Prüfe calibration.js.");
            }
    
            initializeGame();
        }, 200);
    });
    
    // Initialisiere das Spiel
    initializeGame();
});
