<?php
include 'connection.php'; // Verbindung zur Datenbank herstellen

$data = json_decode(file_get_contents("php://input"), true);

// 🔥 Debugging: Eingehende Daten ausgeben
error_log("📌 [DEBUG] Empfangene Daten: " . json_encode($data));
echo "📌 [DEBUG] Empfangene Daten: " . json_encode($data) . "<br>";


$table = $data['table'];
$gazeData = $conn->real_escape_string($data['gazeData']);
$playTime = isset($data['playTime']) ? (int)$data['playTime'] : 0;
$probanden_id = isset($data['probanden_id']) ? (int)$data['probanden_id'] : null;

// Tabelle validieren
$validTables = ['memory_game', 'puzzle_game', 'tictactoe_game'];
if (!in_array($table, $validTables)) {
    echo "Ungültige Tabelle: $table";
    exit();
}



// SQL-Abfrage für Tic-Tac-Toe anpassen
if ($table === 'tictactoe_game') {
    $rundenanzahl = isset($data['rundenanzahl']) ? (int)$data['rundenanzahl'] : 0;
    $siege = isset($data['siege']) ? (int)$data['siege'] : 0;
    $unentschieden = isset($data['unentschieden']) ? (int)$data['unentschieden'] : 0;
    $verluste = isset($data['verluste']) ? (int)$data['verluste'] : 0;
    $zuganzahl = isset($data['zuganzahl']) ? $conn->real_escape_string($data['zuganzahl']) : "[]";
    $rundenzeiten = isset($data['rundenzeiten']) ? $conn->real_escape_string($data['rundenzeiten']) : "[]";
    $rundenzeit_insgesamt = isset($data['rundenzeit_insgesamt']) ? (int)$data['rundenzeit_insgesamt'] : 0;
    
    $gazeGuidanceMoves = isset($data['gazeGuidanceMoves'])
    ? $conn->real_escape_string($data['gazeGuidanceMoves'])
    : "[]";
    $gazeGuidanceMethod = isset($data['gazeGuidanceMethod'])
    ? $conn->real_escape_string($data['gazeGuidanceMethod'])
    : "[]";

    $sql = "INSERT INTO tictactoe_game
            (probanden_id, rundenanzahl, siege, unentschieden, verluste,
            zuganzahl, blickdaten, rundenzeiten, rundenzeit_insgesamt, gaze_guidance_moves, gaze_guidance_method)
VALUES
  ($probanden_id, $rundenanzahl, $siege, $unentschieden, $verluste,
   '$zuganzahl', '$gazeData', '$rundenzeiten', $rundenzeit_insgesamt,
   '$gazeGuidanceMoves', '$gazeGuidanceMethod')";
} else if ($table === 'memory_game') {
    $gazeGuidanceMoves = isset($data['gazeGuidanceMoves'])
        ? $conn->real_escape_string($data['gazeGuidanceMoves'])
        : "[]";

    $gazeData = isset($data['gazeData'])
        ? $conn->real_escape_string($data['gazeData'])
        : "[]";

    $playTime = isset($data['playTime']) ? (int)$data['playTime'] : 0;

    $gazeGuidanceMethod = isset($data['gazeGuidanceMethod'])
        ? $conn->real_escape_string($data['gazeGuidanceMethod']): error;

    $sql = "INSERT INTO memory_game
               (probanden_id, benötigte_zeit, blickdaten, gaze_guidance_method, gaze_guidance_moves)
            VALUES
               ($probanden_id, $playTime, '$gazeData', '$gazeGuidanceMethod', '$gazeGuidanceMoves')";

} else if ($table === 'puzzle_game') {
    $gazeGuidanceMoves = isset($data['gazeGuidanceMoves'])
        ? $conn->real_escape_string($data['gazeGuidanceMoves'])
        : "[]";
    $gazeGuidanceMethod = isset($data['gazeGuidanceMethod'])
        ? $conn->real_escape_string($data['gazeGuidanceMethod'])
        : "[]";
    
    $sql = "INSERT INTO puzzle_game
               (probanden_id, benötigte_zeit, blickdaten, gaze_guidance_moves, gaze_guidance_method)
            VALUES
               ($probanden_id, $playTime, '$gazeData', '$gazeGuidanceMoves' , '$gazeGuidanceMethod')";
}





// SQL ausführen und Ergebnis zurückgeben
if ($conn->query($sql) === TRUE) {
    echo "✅ Daten erfolgreich in $table gespeichert!";
} else {
    echo "❌ Fehler beim Einfügen der Daten: " . $conn->error;
}



$conn->close(); // Verbindung schließen
?>
