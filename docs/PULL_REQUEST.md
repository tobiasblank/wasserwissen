# PWA-Caching und Lernstandsabgleich absichern

Leere Antworten konnten die Bewertungsansicht abbrechen. Der GitHub-Abgleich konnte außerdem ein öffentlich gewordenes Lernstandrepository beschreiben und unbekannte Frage-IDs beim Zurückschreiben entfernen.

Dieser PR repariert die Bewertungsansicht, prüft private Repositoryeigenschaften vor jedem Abgleich, schützt Sitzungswechsel, validiert Daten und sperrt das Überschreiben beschädigter lokaler Originaldaten. Gleichzeitige Bewertungen mit gleichem Zeitstempel werden deterministisch aufgelöst. Der Service Worker revalidiert bekannte Assets und wartet auf Cache-Schreibvorgänge; das Apple-Touch-Icon erhält eine versionierte URL.

Alle 579 bestehenden Datensätze bleiben bytegenau unverändert. Kein produktiver Lernstand wurde gelesen oder verändert. Architektur, Risiken und vorgeschlagene schrittweise Projektstruktur stehen in docs/ANALYSE.md.

Validierung: 13 Node-Tests bestanden; Chrome-Smoke-Test bei 390/820/1440px bestanden; git diff --check sauber. CI-Konfiguration hinzugefügt, bislang nur lokal ausgeführt.

Grenzen: Last-write-wins ersetzt keine Ereignishistorie. Mehrere Tabs und abweichende Geräteuhren bleiben offene Risiken. Kein iPhone-Hardwaretest; ein bereits installiertes iOS-Icon kann weiterhin alt bleiben. Vor Neuinstallation Lernstand sichern. Keine produktive Veröffentlichung.
