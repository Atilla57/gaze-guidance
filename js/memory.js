window.gameName = "memory"; // Spielname für das aktuelle Spiel

// -------------------------------------
// Karten-Array
// -------------------------------------
const cards = [
    "../img/hard/1.jpg", "../img/hard/1.jpg",
    "../img/hard/2.jpg", "../img/hard/2.jpg",
    "../img/hard/3.jpg", "../img/hard/3.jpg",
    "../img/hard/4.jpg", "../img/hard/4.jpg",
/*    "../img/hard/5.jpg", "../img/hard/5.jpg",
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
    "../img/hard/stern.jpg", "../img/hard/stern.jpg", */
];

// -------------------------------------
// Globale Variablen
// -------------------------------------
let cards_pair_length = cards.length / 2;
let openCards = [];
let matchedPairs = 0;
let isCheckingMatch = false; // Blockiert weitere Klicks während der Match-Prüfung

// NEU: Gaze Guidance und Klick-Recorder Variablen
let gazeGuidanceCards = [];
let initialClicks = 0;
let clickNumber = 0;
let memoryClickLog = [];

// NEU: Zähler für Guidance
let totalGuidanceCount = 0; // Zählt, wie viele Karten dauerhaft als Guidance markiert wurden
let guidanceHits = 0;       // Zählt, wie oft der Spieler auf eine Guidance-Karte klickt

// -------------------------------------
// UI-/Info-Funktionen
// -------------------------------------
function updateCounter() {
    document.getElementById("matchedPairCounter").textContent = matchedPairs;
}

function updatePairLength() {
    document.getElementById("cards_length").textContent = cards_pair_length;
}

// -------------------------------------
// Timer-Logik
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
    
    // NEU: Gib den Klick-Log und Guidance-Zähler aus
    console.log("Klick-Verlauf:", JSON.stringify(memoryClickLog, null, 2));
    console.log(`Gesamt Guidance-Karten: ${totalGuidanceCount}, Guidance-Hits: ${guidanceHits}`);
    
    window.parent.probanden_id = localStorage.getItem('probanden_id');
    console.log(`🆕 NEUE Probanden-ID geladen: ${window.parent.probanden_id}`);
    
    if (!window.parent.probanden_id) {
        console.error("Fehler: Probanden-ID konnte nicht gesetzt werden!");
        return;
    }
    
    window.parent.recording_stop(window.gameName, window.elapsedTime);
    
    alert(`Herzlichen Glückwunsch! Du hast gewonnen!\nBenötigte Zeit: ${window.elapsedTime} Sekunden.
        \nDeine Daten werden nun abgespeichert...\nNach Klick auf "OK" geht's nach 5 Sekunden zum Puzzle-Spiel.`);
    
    setTimeout(() => {
        window.location.href = "../games/puzzle.html";
    }, 5000);
}

// -------------------------------------
// NEU: Gaze Guidance Funktionen für Paar-Hervorhebung
// -------------------------------------
function applyGazeGuidance(cards) {
    const shuffledCards = [...cards];
    shuffle(shuffledCards);
    const guidanceCount = 2; // Wir wählen immer genau 2 Karten zu Beginn als Guidance
    gazeGuidanceCards = shuffledCards.slice(0, guidanceCount);
    gazeGuidanceCards.forEach(card => {
        card.style.transform = `rotate(${getRandomRotation()}deg) scale(${getRandomScale()})`;
        card.dataset.gazeGuidance = "true";         // Aktives Guidance-Flag
        card.dataset.wasGazeGuidance = "true";        // Permanentes Guidance-Flag
        totalGuidanceCount++; // NEU: Guidance-Zähler erhöhen
    });
}

function getRandomRotation() {
    return (Math.random() * 10 - 5).toFixed(2); // ±5 Grad, subtil
}

function getRandomScale() {
    return (1.0 + Math.random() * 0.05).toFixed(2); // 1.0 bis 1.05
}

// NEU: Prüft, ob die Karte aktuell als Guidance aktiv ist
function isGazeGuidanceCard(cardElement) {
    return cardElement.dataset.gazeGuidance === "true";
}

function recordGazeGuidanceClick(gameName, moveNumber) {
    console.log(`📌 Gaze Guidance Click erkannt: Spiel=${gameName}, Zug=${moveNumber}`);
}

// -------------------------------------
// NEU: Sofortige Drehung des passenden Paares
// -------------------------------------
function rotatePairInstantly(selectedCard) {
    const pairCard = [...document.querySelectorAll(".card")].find(card => 
        card.dataset.card === selectedCard.dataset.card && card !== selectedCard
    );
    if (pairCard) {
        // Setze Guidance-Flags, falls noch nicht permanent gesetzt
        if (!pairCard.dataset.wasGazeGuidance) {
            pairCard.dataset.gazeGuidance = "true";
            pairCard.dataset.wasGazeGuidance = "true";
            // totalGuidanceCount++; // Optional, falls du einen Zähler nutzt
        }
        pairCard.style.transform = `rotate(${getRandomRotation()}deg)`;
        pairCard.dataset.guidanceModified = "true";
        pairCard.guidanceTimeout = setTimeout(() => {
            if (!pairCard.classList.contains("flipped")) {
                pairCard.style.transform = "";
                delete pairCard.dataset.gazeGuidance; // NEU: Aktives Guidance-Flag entfernen
                delete pairCard.dataset.guidanceModified;
            }
        }, 3000); // 3 Sekunden warten, dann zurücksetzen
    }
}


// -------------------------------------
// Karten mischen
// -------------------------------------
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// -------------------------------------
// Zufällige Position generieren
// -------------------------------------
function generateRandomPosition(maxWidth, maxHeight, cardSize) {
    const x = Math.random() * (maxWidth - cardSize);
    const y = Math.random() * (maxHeight - cardSize);
    return { x, y };
}

// -------------------------------------
// Überlappung prüfen
// -------------------------------------
function isOverlapping(newPos, positions, cardSize) {
    return positions.some(pos => {
        return (
            newPos.x < pos.x + cardSize &&
            newPos.x + cardSize > pos.x &&
            newPos.y < pos.y + cardSize &&
            newPos.y + cardSize > pos.y
        );
    });
}

// -------------------------------------
// Spielfeld erstellen
// -------------------------------------
function startGame() {
    shuffle(cards);
    startTimer();
    window.parent.recording_start();

    const memoryBoard = document.getElementById("memory-game");
    const cardSize = 50; // Breite und Höhe der Karten
    const positions = [];

    cards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");

        const cardImage = document.createElement("img");
        cardImage.src = card;
        cardImage.style.visibility = "hidden";
        cardElement.appendChild(cardImage);

        cardElement.dataset.card = card;
        cardElement.addEventListener("click", function(e) { flipCard(e); });

        let position;
        do {
            position = generateRandomPosition(memoryBoard.offsetWidth, memoryBoard.offsetHeight, cardSize);
        } while (isOverlapping(position, positions, cardSize));

        cardElement.style.left = `${position.x}px`;
        cardElement.style.top = `${position.y}px`;
        positions.push(position);

        memoryBoard.appendChild(cardElement);
    });

    // NEU: Falls du die alte Guidance-Funktion nicht nutzen willst, auskommentieren
    // applyGazeGuidance(document.querySelectorAll(".card"));

    updateCounter();
    updatePairLength();
}

// -------------------------------------
// Flip-Logik mit Klick-Recorder und Paar-Hervorhebung
// -------------------------------------
function flipCard(e) {
    const clickedCard = e.currentTarget;

    if (isCheckingMatch || openCards.length >= 2 || clickedCard.classList.contains("flipped")) {
        return;
    }

    clickNumber++;
    const clickX = e.clientX;
    const clickY = e.clientY;
    const currentTimestamp = performance.now();
    const isGG = isGazeGuidanceCard(clickedCard); // Aktuell aktiv
    const wasGG = (clickedCard.dataset.wasGazeGuidance === "true"); // Dauerhaft gesetzt

    console.log(`Karte ${clickedCard.dataset.card} angeklickt. wasGazeGuidance: ${wasGG}, isGazeGuidance: ${isGG}`);

    memoryClickLog.push({
        moveNumber: clickNumber,
        x: clickX,
        y: clickY,
        wasGazeGuidance: wasGG,
        isGazeGuidance: isGG,
        timestamp: currentTimestamp
    });

    // NEU: Falls Guidance aktiv, löschen wir den aktuellen Guidance-Flag (behalten aber das permanente Flag)
    if (clickedCard.dataset.gazeGuidance === "true") {
        delete clickedCard.dataset.gazeGuidance;
    }

    clickedCard.classList.add("flipped");
    const img = clickedCard.querySelector("img");
    img.style.visibility = "visible";
    openCards.push(clickedCard);

    if (openCards.length === 1) {
        rotatePairInstantly(clickedCard);
    }

    if (openCards.length === 2) {
        isCheckingMatch = true;
        setTimeout(checkForMatch, 1000);
    }
}

// -------------------------------------
// Kartenvergleich
// -------------------------------------
function checkForMatch() {
    const [card1, card2] = openCards;
    if (card1.dataset.card === card2.dataset.card) {
        matchedPairs++;
        updateCounter();
        openCards = [];
        if (matchedPairs === cards_pair_length) {
            stopTimer();
        }
    } else {
        setTimeout(() => {
            card1.classList.remove("flipped");
            card1.querySelector("img").style.visibility = "hidden";
            card2.classList.remove("flipped");
            card2.querySelector("img").style.visibility = "hidden";
            openCards = [];
        }, 1000);
    }
    isCheckingMatch = false;
}

// -------------------------------------
// Spiel starten
// -------------------------------------
startGame();
updateCounter();
updatePairLength();
