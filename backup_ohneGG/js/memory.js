window.gameName = "memory"; // Spielname für das aktuelle Spiel

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


let cards_pair_length = cards.length / 2;
let openCards = [];
let matchedPairs = 0;

// Funktion zum Updaten des Counters auf der HTML matchedPairs
function updateCounter() {
    document.getElementById("matchedPairCounter").textContent = matchedPairs;   
}

function updatePairLength() {
    document.getElementById("cards_length").textContent = cards_pair_length;
}

// STOPPUHR
// Startet die Stoppuhr
function startTimer() {
    alert("Das Spiel startet jetzt! Die Zeit läuft!");
    startTime = Date.now(); // Startzeit nach dem Alert festlegen
    timer = setInterval(() => {
        window.elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
}

// Stoppt die Stoppuhr
function stopTimer() {
    clearInterval(timer);
    
    // 🔹 Probanden-ID direkt vor `recording_stop()` erneut aus `localStorage` holen
    window.parent.probanden_id = localStorage.getItem('probanden_id');
    console.log(`🆕 NEUE Probanden-ID geladen: ${window.parent.probanden_id}`);

    // 🔹 Falls die ID immer noch nicht richtig ist, breche ab
    if (!window.parent.probanden_id) {
        console.error("Fehler: Probanden-ID konnte nicht gesetzt werden!");
        return;
    }

    // 🔹 Jetzt wird die korrekte ID mit den Blickdaten gespeichert
    window.parent.recording_stop(window.gameName, window.elapsedTime);

    alert(`Herzlichen Glückwunsch! Du hast gewonnen!\nBenötigte Zeit: ${window.elapsedTime} Sekunden.
        \nDeine Daten werden nun abgespeichert...\nNach Bestätigen mit "OK" wirst du in 5 Sekunden zum nächsten Spiel "Puzzle" weitergeleitet.`);

    // Weiterleitung nach 5 Sekunden zum Puzzle-Spiel
    setTimeout(() => {
        window.location.href = "../games/puzzle.html";
    }, 5000);
}


// Spielfeld erstellen - siehe memory.html
const main_game = document.getElementById("memory-game");

function startGame() {
    shuffle(cards);
    startTimer();
    // Webgazer Aufnahme starten
    window.parent.recording_start();
    const memoryBoard = document.getElementById("memory-game");

    const cardSize = 50; // Breite und Höhe der Karten
    const positions = []; // Array zur Speicherung der belegten Positionen

    cards.forEach((card) => {
        // Erstelle Karten-Elemente
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");

        const cardImage = document.createElement("img");
        cardImage.src = card;
        cardImage.style.visibility = "hidden";
        cardElement.appendChild(cardImage);

        cardElement.dataset.card = card;
        cardElement.addEventListener("click", flipCard);

        // Zufällige, nicht überlappende Position finden
        let position;
        do {
            position = generateRandomPosition(memoryBoard.offsetWidth, memoryBoard.offsetHeight, cardSize);
        } while (isOverlapping(position, positions, cardSize));

        // Position setzen
        cardElement.style.left = `${position.x}px`;
        cardElement.style.top = `${position.y}px`;
        positions.push(position);

        // Füge die Karte zum Spielfeld hinzu
        memoryBoard.appendChild(cardElement);
    });
}

// Funktion zur Generierung einer zufälligen Position
function generateRandomPosition(maxWidth, maxHeight, cardSize) {
    const x = Math.random() * (maxWidth - cardSize);
    const y = Math.random() * (maxHeight - cardSize);
    return { x, y };
}

// Funktion zur Überprüfung von Überlappungen
function isOverlapping(newPos, positions, cardSize) {
    return positions.some((pos) => {
        return (
            newPos.x < pos.x + cardSize &&
            newPos.x + cardSize > pos.x &&
            newPos.y < pos.y + cardSize &&
            newPos.y + cardSize > pos.y
        );
    });
}

// Karten mischen 
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function flipCard() {
    if (openCards.length < 2 && !this.classList.contains("flipped")) {
        this.classList.add("flipped");

        // Zeige das Bild an
        const img = this.querySelector("img");
        img.style.visibility = "visible";

        openCards.push(this);

        if (openCards.length === 2) {
            checkForMatch();
        }
    }
}

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
            // Verstecke die Bilder wieder
            card1.classList.remove("flipped");
            card1.querySelector("img").style.visibility = "hidden";
            card2.classList.remove("flipped");
            card2.querySelector("img").style.visibility = "hidden";

            openCards = [];
        }, 1000);
    }
}

startGame();
updateCounter();
updatePairLength();
