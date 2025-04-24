<?php
include 'connection.php'; // Verbindung zur Datenbank herstellen

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $vorname = $conn->real_escape_string($_POST['vorname']);
    $nachname = $conn->real_escape_string($_POST['nachname']);
    $alter = (int)$_POST['alter_jahr'];
    $screen_resolution = $conn->real_escape_string($_POST['screen_resolution'] ?? "unknown");
    $calibration_accuracy = $conn->real_escape_string($_POST['accuracy'] ?? "unknown");

    // Tabelle erweitern: Spalte `screen_resolution` muss existieren!
    $sql = "INSERT INTO probanden (vorname, nachname, alter_jahr, screen_resolution, calibration_accuracy) 
            VALUES ('$vorname', '$nachname', $alter, '$screen_resolution', '$calibration_accuracy')";
    
    if ($conn->query($sql) === TRUE) {
        $probanden_id = $conn->insert_id; // Holt die letzte eingefügte ID
        echo json_encode(["status" => "success", "probanden_id" => $probanden_id]); // JSON-Antwort
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]); // Fehler als JSON zurückgeben
    }

    $conn->close();
}
?>
