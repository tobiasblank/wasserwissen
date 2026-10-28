# Wasserwissen – GitHub Pages PWA

Alle Dateien und den Ordner `icons` in das **öffentliche** GitHub-Repository `tobiasblank/wasserwissen` hochladen. Die Startdatei muss im Repository-Hauptverzeichnis **`index.html`** heißen. GitHub Pages: Settings → Pages → Deploy from a branch → `main` → `/(root)`.

Adresse: https://tobiasblank.github.io/wasserwissen/

Auf dem iPhone in **Safari** öffnen → Teilen → **Zum Home-Bildschirm**. Einmal bei Internetverbindung vollständig öffnen; anschließend funktioniert der Trainer auch offline. Das Gerät muss die Website dabei tatsächlich laden und den Service Worker installieren können.

**Wichtig:** Der Lernstand bleibt zurzeit lokal auf jedem Gerät gespeichert. Die GitHub-Synchronisierung ist **noch nicht eingebaut**. Zum Übertragen weiter die eingebaute JSON-Export-/Import-Funktion nutzen. Der Lernstand kann durch Löschen der Website-Daten verloren gehen.

Bei Aktualisierungen `CACHE` in `sw.js` auf z.B. `wasserwissen-pwa-v2` erhöhen, damit Offline-Dateien neu eingerichtet werden.
