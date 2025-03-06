// gaze_guidance_config.js

// Gaze Guidance Konfiguration
const GazeGuidanceConfig = {
    memory: {

    },
    puzzle: {

    },
    ticTacToe: {
          
    }
};

// Funktion zur Überprüfung, ob ein Feature aktiv ist
function isGazeGuidanceEnabled(game, feature) {
    return GazeGuidanceConfig[game] && GazeGuidanceConfig[game][feature] === true;
}

