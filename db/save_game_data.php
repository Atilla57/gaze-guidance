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
$validTables = ['memory_game', 'puzzle_game', 'tictactoe_game', 'gaze_guidance_events'];
if (!in_array($table, $validTables)) {
    echo "Ungültige Tabelle: $table";
    exit();
}


if ($table === 'memory_gaze_guidance') {
    $memory_id    = (int)$data['memory_id'];
    $probanden_id = (int)$data['probanden_id'];
    $gameName     = $conn->real_escape_string($data['game_name']);
    $moveNumber   = (int)$data['move_number'];
    $posX         = (int)$data['gg_pos_x'];
    $posY         = (int)$data['gg_pos_y'];

    $sql = "INSERT INTO memory_gaze_guidance 
                (memory_id, probanden_id, game_name, move_number, gg_pos_x, gg_pos_y)
            VALUES
                ($memory_id, $probanden_id, '$gameName', $moveNumber, $posX, $posY)";

    if ($conn->query($sql) === TRUE) {
        echo "✅ memory_gaze_guidance erfolgreich gespeichert!";
    } else {
        echo "❌ Fehler beim Einfügen von memory_gaze_guidance: " . $conn->error;
    }
    $conn->close();
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

    $sql = "INSERT INTO tictactoe_game (probanden_id, rundenanzahl, siege, unentschieden, verluste, zuganzahl, blickdaten, rundenzeiten, rundenzeit_insgesamt) 
            VALUES ($probanden_id, $rundenanzahl, $siege, $unentschieden, $verluste, '$zuganzahl', '$gazeData', '$rundenzeiten', $rundenzeit_insgesamt)";
} else {
    // Standard SQL für Memory, Puzzle, Dame
    $sql = "INSERT INTO $table (probanden_id, benötigte_zeit, blickdaten) VALUES ($probanden_id, $playTime, '$gazeData')";
}





// SQL ausführen und Ergebnis zurückgeben
if ($conn->query($sql) === TRUE) {
    echo "✅ Daten erfolgreich in $table gespeichert!";
} else {
    echo "❌ Fehler beim Einfügen der Daten: " . $conn->error;
}



$conn->close(); // Verbindung schließen
?>
