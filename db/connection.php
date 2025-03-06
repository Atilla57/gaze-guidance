<?php
$servername = "localhost";
$username = "root"; // Standard-Benutzername bei XAMPP
$password = ""; // Standard ist kein Passwort
$dbname = "gaze_guidance"; // Passe den Namen der Datenbank an

// Verbindung erstellen
$conn = new mysqli($servername, $username, $password, $dbname);

// Verbindung prüfen
if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

// Optional: UTF-8-Zeichensatz setzen, falls nötig
$conn->set_charset("utf8");

// Verbindung erfolgreich
//echo "Verbindung erfolgreich"; // Debugging-Zwecke

?>
