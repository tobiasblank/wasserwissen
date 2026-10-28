# Wasserwissen PWA mit GitHub-Lernstand

## Dateien hochladen
Alle Dateien und den Ordner `icons/` ins **öffentliche** Repository `tobiasblank/wasserwissen` hochladen (Root, `main`). Keine Tokens oder Lernstände ins öffentliche Repository hochladen.

## Privaten Datenspeicher einrichten
GitHub → Neues Repository `wasserwissen-lernstand` → **Private** → README aktivieren.
Unter Settings → Developer settings → Personal access tokens → Fine-grained tokens einen Token mit **Repository access: Only select repositories → wasserwissen-lernstand** und **Repository permissions: Contents → Read and write** erstellen. Token sicher aufbewahren, niemals an andere senden oder in den Code einfügen.

## Verbinden
PWA öffnen → unten Abschnitt `GitHub-Lernstand` → Token eingeben → `Verbinden & abgleichen`. Standardmäßig bleibt der Token nur für die Browser-Sitzung erhalten; die Checkbox `Token auf diesem Gerät behalten` speichert ihn im lokalen Browserspeicher (praktischer, aber bei kompromittiertem Browser unsicher). iOS kann die Token-Eingabe ggf. per Passwortmanager erleichtern, **keine native Face-ID-Anmeldung**.

## Synchronisation
Nach jeder Bewertung wird zunächst lokal gesichert, anschließend online über die GitHub Contents API abgeglichen. Beim Start (sofern verbunden), nach Rückkehr in die App und nach Netzrückkehr erfolgt ebenfalls ein Abgleich. Gleichzeitige Änderungen werden für jede Frage anhand des letzten Bewertungszeitpunkts zusammengeführt. Das ist keine vollständige Ereignishistorie: Bewertungen derselben Frage auf zwei Geräten können kollidieren; der neuere Stand gewinnt. Manuelle JSON-Sicherung weiterhin möglich.

## Hinweise
- GitHub-Pages-Repository öffentlich, Lernstand-Repository privat.
- Die API-Synchronisierung benötigt Internet; Lernen funktioniert offline.
- Bei einem iPhone-PWA-Update ggf. App mit Internet öffnen und neu laden, damit der Service Worker die neue Version zwischenspeichert.
- Bei gemeinsam genutzten Geräten besser keine dauerhafte Token-Speicherung wählen.
- GitHub-Tokens können ablaufen oder widerrufen werden; bei Fehler erneut verbinden.


## Erweiterte Offline-Bewertung
Erkennt Teilaspekte, Synonyme, Zahlen, Rechtsgrundlagen, mögliche Verneinungswidersprüche. Keine KI und keine verlässliche Prüfung der fachlichen Korrektheit. Die Selbstbewertung bleibt maßgeblich.

## Entwicklung und Prüfung

Architektur, priorisierte Risiken und Zielstruktur: [Analysebericht](docs/ANALYSE.md).
Mit Node.js 20 oder neuer `npm test` ausführen. Keine Installation von Paketen erforderlich.
Tests verwenden ausschließlich synthetische Daten und simulierte GitHub-Antworten.
Die CI führt dieselben Tests bei Push und Pull Request aus.

Das Buch-Icon erhält eine versionierte Apple-Touch-URL. Bereits installierte iOS-Icons
können weiterhin alt bleiben. Vor jeder Neuinstallation den Lernstand als JSON sichern
und den Inhalt prüfen; das Entfernen einer PWA kann lokale Daten löschen.
