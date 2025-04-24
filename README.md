# Gaze Guidance Projekt

## Kurzanleitung zum lokal (oder serverseitigem) Aufsetzen:

- Man braucht nur den Ordner gaze-guidance in den htdocs-Ordner des Apache Servers reinhauen
- Beachte: die Startseite ist *nicht* startseite.html, sondern die calibration.html im webgazer/www/ Ordner:
- Der Link zur ersten Seite ist also: https://localhost/gaze-guidance/webgazer/www/calibration.html
- Dort geht die Calibration los und anschließend gelangt man über einen IFrame auf meine Website mit den Spielen.

  ### Apache Server
  - Für den Apache Webserver hänge ich noch meine httpd.conf an, da ich mir nicht sicher bin, ob ich da etwas geändert habe.

  ### Falls Webgazer nicht tun sollte...
- Falls webgazer nicht ordnungsgemäß funktionieren sollte und du das neu einbinden bzw. neu herunterladen willst/musst, dann reicht es von meinem ordner die calibration.js und die calibration.html in das neue repo zu übernehmen
- Ohne diese zwei files funktioniert nämlich so gesehen nichts.
