// guidance-config.js

(function () {
    const METHODS = ["rotation", "contrast", "border", "size", "none"];

    function getRandomMethod_memory() {
        const memory_methods = ["rotation", "contrast", "border", "size", "none"];
        return memory_methods[Math.floor(Math.random() * memory_methods.length)];
    }
    
    function getRandomMethod_puzzle() {
        const puzzle_methods = ["rotation", "contrast", "border", "none"];
        return puzzle_methods[Math.floor(Math.random() * puzzle_methods.length)];
    }
    function getRandomMethod_ttt() {
        const ttt_methods = ["border", "contrast", "rotation", "none"];
        return ttt_methods[Math.floor(Math.random() * ttt_methods.length)];
    }

    // Funktion zum Setzen der Konfiguration im localStorage
    function setGazeGuidanceConfig() {
        const config = {
            memory: getRandomMethod_memory(),  // Hier ist der Wert für Memory, kann später geändert werden
            puzzle: getRandomMethod_puzzle(),
            tictactoe: getRandomMethod_ttt()
        };
        localStorage.setItem("gaze_guidance_config", JSON.stringify(config));
    }

    // Überprüfen, ob der Wert gesetzt wurde. Falls nicht, setzen wir ihn.
    if (!localStorage.getItem("gaze_guidance_config")) {
        setGazeGuidanceConfig();
    }

    // Globale Variable setzen (damit in memory.js usw. verfügbar)
    window.GazeGuidanceConfig = JSON.parse(localStorage.getItem("gaze_guidance_config"));

    // Funktion zum Löschen der Konfiguration (wird nach TicTacToe-Spiel ausgeführt)
    window.deleteGazeGuidanceConfig = function() {
        localStorage.removeItem("gaze_guidance_config");
    };

})();
