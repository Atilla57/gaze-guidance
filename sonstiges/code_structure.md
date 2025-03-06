# 📌 WebGazer.js – Übersicht der wichtigsten Funktionen für Gaze Guidance Studien

## **🔹 1️⃣ Grundlegende Funktionen (Start, Stop, Reset)**
| **Funktion** | **Beschreibung** |
|-------------|----------------|
| `webgazer.begin()` | Startet WebGazer und beginnt mit dem Eye-Tracking. |
| `webgazer.pause()` | Pausiert das Tracking, ohne die Daten zu löschen. |
| `webgazer.resume()` | Setzt das Tracking nach einer Pause fort. |
| `webgazer.stop()` | Stoppt WebGazer und entfernt die Webcam-Verbindung. |
| `webgazer.clearData()` | Löscht alle gesammelten Kalibrierdaten. |
| `webgazer.showPredictionPoints(true/false)` | Zeigt oder versteckt die vorhergesagte Blickposition. |

**✅ Anwendung für Studien:**  
- `webgazer.begin()` starten, wenn ein Spiel beginnt.  
- `webgazer.stop()` verwenden, um Eye-Tracking für ein bestimmtes Spiel zu deaktivieren.  
- `webgazer.clearData()` nutzen, wenn eine neue Kalibrierung nötig ist.  

---

## **🔹 2️⃣ Kalibrierung & Genauigkeit**
| **Funktion** | **Beschreibung** |
|-------------|----------------|
| `webgazer.showVideo(true/false)` | Zeigt oder versteckt das Webcam-Video. |
| `webgazer.showFaceOverlay(true/false)` | Zeigt oder versteckt das Overlay zur Gesichtserkennung. |
| `webgazer.showFaceFeedbackBox(true/false)` | Zeigt oder versteckt die Feedback-Box (grünes Quadrat um die Augen). |
| `webgazer.getStoredPoints()` | Gibt die gesammelten Blickpunkte zurück. |
| `webgazer.getCurrentPrediction()` | Gibt die aktuelle Blickposition (`x, y`) zurück. |
| `webgazer.setGazeListener(callback)` | Führt eine Funktion aus, wenn eine neue Blickposition erkannt wird. |

**✅ Anwendung für Studien:**  
- `webgazer.showVideo(false)` verwenden, um das Webcam-Fenster zu verstecken.  
- `webgazer.getStoredPoints()` nutzen, um gespeicherte Daten zu analysieren.  
- `webgazer.setGazeListener()` nutzen, um **Echtzeit-Interaktionen** im Spiel zu ermöglichen.  

**📌 Beispiel für Echtzeit-Blicktracking:**  
```js
webgazer.setGazeListener((data, elapsedTime) => {
    if (data) {
        console.log("Blickposition:", data.x, data.y);
    }
}).begin();
