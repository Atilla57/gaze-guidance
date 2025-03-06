// utils.js

// Spiel anhand der URL erkennen
function getGameFromUrl() {
    const url = window.location.href;
    if (url.includes("memory.html")) {
      return "memory";
    } else if (url.includes("puzzle.html")) {
      return "puzzle";
    } else if (url.includes("dame.html")) {
      return "dame";
    } else {
      return "unknown"; // Fallback, falls das Spiel nicht erkannt wird
  }
}  