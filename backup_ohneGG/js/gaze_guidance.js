// gaze_guidance_config.js
const GazeGuidanceConfig = {
    memory: {
        enableRotation: true,    // Drehen von 1-2 Karten
        enableScaling: true,     // Vergrößern von 1-2 Karten
        trackInitialClicks: true // Protokollierung der ersten 3-5 Züge
    },
    puzzle: {
        enableContrastChange: true, // Kontrastanpassung bei 1-2 Puzzleteilen
        enableImageScaling: true     // Veränderung der Bildgröße innerhalb eines Puzzleteils
    },
    ticTacToe: {
        enableWinningMoveHighlight: true, // Dunklere Hervorhebung für gewinnbringende Züge
        enableMovePrediction: true        // Aktivierung der Vorhersagefunktion für relevante Züge
    }
};

// Funktion zur Überprüfung, ob ein Feature aktiv ist
function isGazeGuidanceEnabled(game, feature) {
    return GazeGuidanceConfig[game] && GazeGuidanceConfig[game][feature] === true;
}

// Export für globale Nutzung in den Spielen
if (typeof module !== "undefined") {
    module.exports = GazeGuidanceConfig;
}
fsdfsdafsdafs
