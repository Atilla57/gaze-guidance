/* SQL EINRICHTUNG
(Normalerweise) sollte alles fehlerlos laufen wenn du die sql commands nacheinander ausführst
bzw. dieses File einfach ausführst. */

/* Erst die Datenbank generieren*/
CREATE DATABASE `gaze_guidance` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */

/* Dann die Haupttabelle mit Primary Key für ID*/
CREATE TABLE `probanden` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vorname` varchar(50) NOT NULL,
  `nachname` varchar(50) NOT NULL,
  `alter_jahr` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `screen_resolution` varchar(20) DEFAULT NULL,
  `calibration_accuracy` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci


/* Dann das memory game dass ID von Probanden holt und auch eigene primary id hat*/
CREATE TABLE `memory_game` (
  `memory_id` int(11) NOT NULL AUTO_INCREMENT,
  `probanden_id` int(11) DEFAULT NULL,
  `benötigte_zeit` int(11) DEFAULT NULL,
  `blickdaten` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `gaze_guidance_moves` text DEFAULT NULL,
  `gaze_guidance_method` text DEFAULT NULL,
  PRIMARY KEY (`memory_id`),
  KEY `probanden_id` (`probanden_id`),
  CONSTRAINT `memory_game_ibfk_1` FOREIGN KEY (`probanden_id`) REFERENCES `probanden` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci


/* Dann das Puzzle Game --> auch mit ID von Probanden und eigene puzzle id zusätzlich */
CREATE TABLE `puzzle_game` (
  `puzzle_id` int(11) NOT NULL AUTO_INCREMENT,
  `probanden_id` int(11) DEFAULT NULL,
  `benötigte_zeit` int(11) DEFAULT NULL,
  `blickdaten` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `gaze_guidance_moves` longtext DEFAULT NULL,
  `gaze_guidance_method` text DEFAULT NULL,
  PRIMARY KEY (`puzzle_id`),
  KEY `probanden_id` (`probanden_id`),
  CONSTRAINT `puzzle_game_ibfk_1` FOREIGN KEY (`probanden_id`) REFERENCES `probanden` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

/* Als letztes das TicTacToe Game, auch gleich: probanden_id als foreign key und eigener primary key vorhanden */
CREATE TABLE `tictactoe_game` (
  `tictactoe_id` int(11) NOT NULL AUTO_INCREMENT,
  `probanden_id` int(11) DEFAULT NULL,
  `rundenanzahl` int(11) NOT NULL DEFAULT 5,
  `siege` int(11) DEFAULT 0,
  `unentschieden` int(11) DEFAULT 0,
  `verluste` int(11) DEFAULT 0,
  `zuganzahl` text NOT NULL,
  `blickdaten` text NOT NULL,
  `rundenzeiten` text NOT NULL,
  `rundenzeit_insgesamt` int(11) DEFAULT 0,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `gaze_guidance_moves` text DEFAULT NULL,
  `gaze_guidance_method` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`tictactoe_id`),
  KEY `probanden_id` (`probanden_id`),
  CONSTRAINT `tictactoe_game_ibfk_1` FOREIGN KEY (`probanden_id`) REFERENCES `probanden` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci