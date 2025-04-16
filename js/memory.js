window.gameName = "memory"; // Spielname für das aktuelle Spiel

// -------------------------------------
// Karten-Array
// -------------------------------------
const cards = [
    "../img/hard/1.jpg", "../img/hard/1.jpg",
    "../img/hard/2.jpg", "../img/hard/2.jpg",
    "../img/hard/3.jpg", "../img/hard/3.jpg",
    "../img/hard/4.jpg", "../img/hard/4.jpg",
    "../img/hard/5.jpg", "../img/hard/5.jpg",
    "../img/hard/6.jpg", "../img/hard/6.jpg",
    "../img/hard/7.jpg", "../img/hard/7.jpg",
    "../img/hard/8.jpg", "../img/hard/8.jpg",
    "../img/hard/9.jpg", "../img/hard/9.jpg",
    "../img/hard/10.jpg", "../img/hard/10.jpg",
    "../img/hard/11.jpg", "../img/hard/11.jpg",
    "../img/hard/12.jpg", "../img/hard/12.jpg",
    "../img/hard/13.jpg", "../img/hard/13.jpg",
    "../img/hard/14.jpg", "../img/hard/14.jpg",
    "../img/hard/15.jpg", "../img/hard/15.jpg",
    "../img/hard/16.jpg", "../img/hard/16.jpg",
    "../img/hard/17.jpg", "../img/hard/17.jpg",
    "../img/hard/18.jpg", "../img/hard/18.jpg",
    "../img/hard/19.jpg", "../img/hard/19.jpg",
    "../img/hard/20.jpg", "../img/hard/20.jpg",
    "../img/hard/21.jpg", "../img/hard/21.jpg",
    "../img/hard/22.jpg", "../img/hard/22.jpg",
    "../img/hard/23.jpg", "../img/hard/23.jpg",
    "../img/hard/24.jpg", "../img/hard/24.jpg",
    "../img/hard/25.jpg", "../img/hard/25.jpg",
    "../img/hard/26.jpg", "../img/hard/26.jpg",
    "../img/hard/27.jpg", "../img/hard/27.jpg",
    "../img/hard/28.jpg", "../img/hard/28.jpg",
    "../img/hard/ballon_pink.jpg", "../img/hard/ballon_pink.jpg",
    "../img/hard/baum.jpg", "../img/hard/baum.jpg",
    "../img/hard/glocke.jpg", "../img/hard/glocke.jpg",
    "../img/hard/grauerMond.jpg", "../img/hard/grauerMond.jpg",
    "../img/hard/kirsche.jpg", "../img/hard/kirsche.jpg",
    "../img/hard/orangene_Sonne.jpg", "../img/hard/orangene_Sonne.jpg",
    "../img/hard/stern.jpg", "../img/hard/stern.jpg",
];

// -------------------------------------
// Globale Variablen
// -------------------------------------
let cards_pair_length = cards.length / 2;
let openCards = [];
let matchedPairs = 0;
let isCheckingMatch = false;

let isTrueMove = false; // Standardwert setzen

let currentGazeGuidanceMethod = window.GazeGuidanceConfig?.memory || "none";
console.log("🎯 Gaze Guidance Methode für Memory:", currentGazeGuidanceMethod);


let clickNumber = 0;
let memoryClickLog = [];
let GAZE_GUIDANCE_ENABLED = true;
const GAZE_GUIDANCE_METHODS = ["rotation", "contrast", "border", "size"];


window.addEventListener("load", function () {
    if (!document.fullscreenElement) {
        checkFullscreenAndPrompt();

    }
  });
  

// -------------------------------------
function updateCounter() {
    document.getElementById("matchedPairCounter").textContent = matchedPairs;
}

function updatePairLength() {
    document.getElementById("cards_length").textContent = cards_pair_length;
}

// -------------------------------------
// Timer
// -------------------------------------
let startTime, timer;
function startTimer() {
    alert("Das Spiel startet jetzt! Die Zeit läuft!");
    startTime = Date.now();
    timer = setInterval(() => {
        window.elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);

    console.log("Klick-Verlauf:", JSON.stringify(memoryClickLog, null, 2));

    window.parent.probanden_id = localStorage.getItem('probanden_id');

    window.parent.gameStats = {
        table: "memory_game",
        probanden_id: window.parent.probanden_id,
        gazeGuidanceMethod: currentGazeGuidanceMethod,
        gazeGuidanceMoves: JSON.stringify(memoryClickLog)
    };

    window.parent.recording_stop(window.gameName, window.elapsedTime);

    alert(`Herzlichen Glückwunsch! Du hast gewonnen!\nBenötigte Zeit: ${window.elapsedTime} Sekunden.`);
    setTimeout(() => {
        window.location.href = "../games/puzzle.html";
    }, 5000);
}

let gg_prob = 0.9;

function applyRotation(card) {
    if (currentGazeGuidanceMethod === "rotation") {
        const angle = (Math.random() * 3 + 2).toFixed(2); // ergibt 3-5 grad
        card.style.transform = `rotate(${angle}deg)`;
        //card.style.transform = `rotate(45deg)`;
    }
}

function applyContrast(card) {
    if (currentGazeGuidanceMethod === "contrast") {
        card.style.filter = "brightness(1.12)";
        //card.style.filter = "brightness(1.5)";
    }
}

function applyBorder(card) {
    if (currentGazeGuidanceMethod === "border") {
        card.style.border = "2px solid rgb(103, 103, 103)";
        //card.style.border = "2px solid rgb(255, 0, 0)"
    }
}

function applySize(card) {
    if (currentGazeGuidanceMethod === "size") {
        card.style.transform = `scale(1.04)`;
        //card.style.transform = `scale(1.08)`;
    }
}

function resetGuidanceVisuals(card) {
    card.style.transform = "";
    card.style.filter = "";
    card.style.border = "";
    delete card.dataset.gazeGuidance;
}


function getRandomRotation() {
    return (Math.random() * 10 - 5).toFixed(2);
}

function getRandomScale() {
    return (1.0 + Math.random() * 0.05).toFixed(2);
}

// -------------------------------------
function isGazeGuidanceCard(card) {
    return card.dataset.gazeGuidance === "true";
}

// -------------------------------------
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generateRandomPosition(maxW, maxH, size) {
    const x = Math.random() * (maxW - size);
    const y = Math.random() * (maxH - size);
    return { x, y };
}

function isOverlapping(newPos, positions, size) {
    return positions.some(pos => (
        newPos.x < pos.x + size &&
        newPos.x + size > pos.x &&
        newPos.y < pos.y + size &&
        newPos.y + size > pos.y
    ));
}

// -------------------------------------
function startGame() {
    shuffle(cards);
    startTimer();
    window.parent.recording_start();

    const board = document.getElementById("memory-game");
    const size = 50;
    const positions = [];

    cards.forEach(card => {
        const el = document.createElement("div");
        el.classList.add("card");

        const img = document.createElement("img");
        img.src = card;
        img.style.visibility = "hidden";
        el.appendChild(img);

        el.dataset.card = card;
        el.addEventListener("click", flipCard);

        let pos;
        do {
            pos = generateRandomPosition(board.offsetWidth, board.offsetHeight, size);
        } while (isOverlapping(pos, positions, size));

        el.style.left = `${pos.x}px`;
        el.style.top = `${pos.y}px`;
        positions.push(pos);

        board.appendChild(el);
    });

    updateCounter();
    updatePairLength();
}

// -------------------------------------
function flipCard(e) {
    const card = e.currentTarget;
    if (isCheckingMatch || openCards.length >= 2 || card.classList.contains("flipped")) return;

    clickNumber++;

    const isGG = isGazeGuidanceCard(card);
    const wasGG = card.dataset.wasGazeGuidance === "true";
    const ts = performance.now();

    

    // 💡 Bei ungeraden Klicknummern (erster Klick eines Zugs) → "none"
    // Bei geraden Klicknummern (zweiter Klick eines Paares) → currentGazeGuidanceMethod
    memoryClickLog.push({
        moveNumber: clickNumber,
        x: e.clientX,
        y: e.clientY,
        wasGazeGuidance: (clickNumber % 2 === 1) ? "user_move" : wasGG,
        isGazeGuidance: (clickNumber % 2 === 1) ? "user_move" : isGG,
        isTrueMove: (clickNumber %2 === 1) ? "user_move" :isTrueMove,  // Hier wird der neue Wert geloggt
        timestamp: ts
    });

    if (isGG) {
        delete card.dataset.gazeGuidance;
        resetGuidanceVisuals(card);  // <--- NEU
    }

    card.classList.add("flipped");
    card.querySelector("img").style.visibility = "visible";
    openCards.push(card);

    // Gaze Guidance nur beim ersten Klick des Paares (ungerade Zugzahl)
    if (openCards.length === 1) {

        if (Math.random() < gg_prob) {
            const selectedCard = openCards[0];
            const matchingCard = [...document.querySelectorAll(".card")]
                .find(c =>
                    c !== selectedCard &&
                    c.dataset.card === selectedCard.dataset.card &&
                    !c.classList.contains("flipped")
                );

                if (matchingCard) {
                    const method = currentGazeGuidanceMethod;  // Hier nutzen wir die Methode aus der GazeGuidance-Konfiguration
                    matchingCard.dataset.gazeGuidance = "true";
                    matchingCard.dataset.wasGazeGuidance = "true";
                    matchingCard.dataset.gazeGuidanceMethod = method;
                
                    switch (method) {
                        case "rotation": applyRotation(matchingCard); break;
                        case "contrast": applyContrast(matchingCard); break;
                        case "border":   applyBorder(matchingCard); break;
                        case "size":     applySize(matchingCard); break;
                        case "none":     // Keine Veränderung
                            break;
                    }
                
                    // Debugging: Überprüfe die transform-Eigenschaft in der Konsole
                    console.log(matchingCard.style.transform);  // Hier sehen wir die angewandte Transformation
                
                    setTimeout(() => {
                        if (!matchingCard.classList.contains("flipped")) {
                            resetGuidanceVisuals(matchingCard);
                        }
                    }, 3000);
                }                
        }
    }

    if (openCards.length === 2) {
        isCheckingMatch = true;
        setTimeout(checkForMatch, 500);
    }
}



// -------------------------------------
function checkForMatch() {
    const [c1, c2] = openCards;
    if (c1.dataset.card === c2.dataset.card) {
        matchedPairs++;
        updateCounter();
        openCards = [];
        isTrueMove = true;
        if (matchedPairs === cards_pair_length) stopTimer();
    } else {
        setTimeout(() => {
            c1.classList.remove("flipped");
            c1.querySelector("img").style.visibility = "hidden";
            c2.classList.remove("flipped");
            c2.querySelector("img").style.visibility = "hidden";
            openCards = [];
            isTrueMove = false;
        }, 800);
    }
    isCheckingMatch = false;
}


// -------------------------------------
startGame();
updateCounter();
updatePairLength();
