# Architektur- und Sicherheitsanalyse

Stand: 28.10.2026, Ausgangscommit b2adba9. Statische Prüfung aller Repositorydateien; keine Verbindung zum produktiven Lernstand und keine produktiven Schreibzugriffe.

## Architektur

Statische PWA ohne Buildsystem oder Abhängigkeiten. index.html enthält Oberfläche, CSS, 579 eingebettete Datensätze, Auswahlalgorithmus, Textbewertung, Speicherung, Import/Export und GitHub-Client. sw.js hält den Anwendungscache; manifest.webmanifest und drei PNG-Dateien beschreiben die Installation. Keine bestehende Testsuite oder CI. Datenfelder: id, topic, sub, q, a, sourceRow. Kein separater Katalog zusätzlicher Bewertungsaspekte vorhanden: Teilaspekte werden ausschließlich heuristisch aus Musterantworten abgeleitet. Originaltreue gegenüber einem externen Originalkatalog lässt sich ohne diesen nicht beweisen; der bestehende Katalog wird bytegenau geschützt.

## Befunde und Prioritäten

1. **Hoch – Verlust konkurrierender Bewertungen:** Zusammenführung verwendet letzten Zeitstempel pro Frage, keine Ereignisse. Bewertungen derselben Frage auf verschiedenen Geräten verdrängen sich, Geräteuhren beeinflussen das Ergebnis; gleiche Zeitstempel waren richtungsabhängig. Eine Ereignismigration braucht ein eigenes kompatibles Konzept. Dieser PR macht Gleichstände deterministisch, erhält aber bewusst das vorhandene Format. GitHub-Commithistorie und JSON-Sicherungen bleiben erforderlich.
2. **Hoch – Privatsphäre:** Nur im 404-Fall wird die Repositoryexistenz geprüft, nie das private Flag. Ein versehentlich öffentliches Lernstandrepository kann beschrieben werden. Vor jedem Abgleich private=true prüfen, bei Fehler geschlossen bleiben.
3. **Hoch – Datenvalidierung:** Lokaler Speicher wird ungeprüft geladen; Import akzeptiert gebrochene Zähler. Unbekannte Frage-IDs werden still entfernt, was beim Cloud-Roundtrip Daten eines anderen Katalogstands löschen kann. Cloudabgleich muss unbekannte IDs ablehnen. Beschädigte lokale Daten dürfen nicht still überschrieben werden.
4. **Mittel – Abmelden während laufender Requests:** Ein bereits gestarteter Abgleich kann nach Entfernen des Zugangs weiterlaufen. Sitzungssnapshot und Abbruchprüfung vor Folgezugriffen und Übernahme erforderlich. Ein bereits abgesendeter PUT kann nicht rückwirkend zurückgenommen werden.
5. **Mittel – leere Antwort:** scoreAnswer liefert bei leerem Text/fehlender Musterlösung weder strong noch weak; assessmentHtml greift darauf zu und wirft einen Fehler.
6. **Mittel – PWA:** Netzwerk zuerst benutzt normale HTTP-Caches, Cache.put ist nicht an die Ereignislebensdauer gebunden, CacheStorage.match sucht auch fremde Cachegenerationen. Netzwerk-HTTP-Fehler liefern keine Offline-Navigation. Unbegrenztes Caching aller URLs im Scope ist unnötig. Scopeeigene Assetliste, Revalidierung und wartbare Cacheversion erforderlich. Automatisches skipWaiting kann künftige Mehrdatei-Releases mischen; bei Modulaufteilung Updatebestätigung ergänzen.
7. **Icon:** Alle PNGs existieren; Apple-Icon ist 180×180 und zeigt bereits ein Buch. Link korrekt, aber unveränderter Dateiname ohne sizes. Manifest/Service-Worker allein aktualisieren kein zuverlässig bereits gespeichertes iOS-Webclip-Icon. Versionierte Icon-URL und sizes ergänzen. Exakte Ursache auf dem betroffenen iPhone bleibt unbestätigt. Vor Entfernen/Neuinstallation immer JSON exportieren und Sicherung prüfen, da lokale Daten verloren gehen können.
8. **Bewertung:** Reiner Wortvergleich, unscharfe Synonyme (z.B. Phosphor/Phosphat), Zahlen und Negationsheuristik beweisen keine Fachrichtigkeit. Keine separat gepflegten fachlichen Bewertungsaspekte. Selbstbewertung bleibt maßgeblich. Künftige Aspekte getrennt nach Frage-ID mit Provenienz pflegen, Originalantworten unverändert lassen.
9. **Responsivität:** Breakpoints für 780/480px, Safe-Area und 16px-Eingaben vorhanden. Gerätespezifische Safari-/Tastatur-/Homescreen-Tests sind zusätzlich erforderlich. Token liegt optional in localStorage, sonst sessionStorage: bei XSS auslesbar; korrektes HTML-Escaping vorhanden, keine externen Scripts. Fine-grained Token nur für privates Lernstandrepository verwenden.
10. **Offene Risiken:** Mehrere Browsertabs können lokale Daten überschreiben; quota-/Speicherausfälle werden nur angezeigt. Keine transaktionale IndexedDB oder Ereignishistorie. Kein automatisches Löschen oder Migrieren von Lernständen in diesem PR.

## Empfohlene Zielstruktur

Schrittweise, jeweils mit Kompatibilitätsprüfung: index.html (Shell), styles/app.css, data/questions.json (unveränderte Originale), data/assessment-aspects.json (separate Ergänzungen), js/{app,assessment,scheduler,storage,backup,github-sync}.js, sw.js, icons/, tests/{unit,integration,browser}/, docs/. Zuerst Regressionstests, danach Extraktion reiner Funktionen, zuletzt transaktionaler Speicher und Ereignissynchronisation. Keine komplette Umstrukturierung zusammen mit Sicherheitskorrekturen.

## Quellen

- Apple Webclip-Konfiguration: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
- GitHub Contents API / SHA / Schreibkonflikte: https://docs.github.com/en/rest/repos/contents
- Service-Worker-Lebenszyklus: https://web.dev/articles/service-worker-lifecycle

## Testgrenzen

Tests verwenden ausschließlich synthetische Lernstände und gemockte Netzwerke/Speicher. Kein Zugriff auf wasserwissen-lernstand. Ein echter iPhone-Test und ein synchronisierter Zwei-Geräte-Test in einem separaten privaten Testrepository bleiben manuelle Abnahmeaufgaben.

## Umgesetzte Verbesserungen und Ergebnisse

- Unveränderter Katalog per SHA-256-Regressionstest geschützt: 579 eindeutige IDs, acht Themen, eine bereits zuvor leere Musterantwort.
- Leere Bewertungsresultate repariert; lokale/Cloud-Daten strenger validiert. Beschädigte lokale Originaldaten werden weder überschrieben noch synchronisiert. Wiederherstellung solcher Daten erfordert eine gesonderte Prüfung; ein normaler Export zeigt dann nur den Arbeitsspeicherstand, nicht die beschädigten Rohdaten.
- Private-Repository-Prüfung, Sitzungsschutz, deterministische Gleichstände und reihenfolgeunabhängiger Vergleich ergänzt. Keine Änderung des Lernstandformats.
- Bekannte Offlineassets begrenzt, HTTP-Cache revalidiert, Cache-Schreiben abgewartet, HTTP-Fehler mit vorhandenen Assets abgefangen, versionierter Apple-Link ergänzt.
- 13 automatisierte Tests mit Node.js 24.19.0 bestanden; `git diff --check` ohne Befund. Keine Drittanbieterpakete für Unit-/Integrationstests erforderlich.
- Lokaler Chrome-Smoke-Test: Breiten 390, 820 und 1440 Pixel; Start und Anzeige der Bewertung einer leeren Antwort ohne JavaScriptfehler und ohne horizontalen Seitenüberlauf bestanden. Das ist keine Safari-/iPhone-Hardwareprüfung. Reproduzierbares Skript: scripts/browser-smoke.cjs (optionale lokale Playwright-Installation und Chrome erforderlich; `node scripts/browser-smoke.cjs`).
- Produktiver Lernstand wurde nicht gelesen oder geändert. Tests verwendeten ausschließlich synthetische Daten; keine produktive Veröffentlichung.
