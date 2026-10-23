# Bubbles FAQ

Was hier steht, weiss Bubbles. Du kannst die Datei direkt auf GitHub bearbeiten (Stift-Symbol),
nach dem Speichern kennt Bubbles die neuen Antworten, sobald die Website neu gebaut ist.

So sieht ein Eintrag aus, getrennt durch eine Leerzeile:

    ? Erste Formulierung der Frage | weitere Formulierung | auch auf Deutsch
    en: The answer in English.
    de: Die Antwort auf Deutsch.
    go: #install

- `?` Fragen, mehrere Formulierungen mit `|` trennen. Bubbles erkennt auch ähnliche Sätze.
- `en:` und `de:` die Antworten (eine reicht, dann nimmt er die vorhandene).
- `go:` optional: dorthin führt er auf der Seite (#play, #news, #game, #install, #controls).

Tipp: Unbeantwortete Fragen der Besucher (siehe tools/bubbles-worker/LIESMICH.md) sind die beste Quelle für neue Einträge.

---

? Where can I see which version I play? | which version do I have | welche Version habe ich | wo sehe ich die Version
en: The version is shown in the main menu of the game, for example "Alpha 1.41.1". Please mention it when you report something.
de: Die Version steht im Hauptmenü des Spiels, zum Beispiel „Alpha 1.41.1“. Nenn sie bitte, wenn du etwas meldest.

? Can I share my tester code with a friend? | can my friend use my code | darf ich meinen Code teilen | Code an Freund weitergeben
en: Please don't. Every code is personal. A shared code can be blocked, and then the launcher locks again. Your friend can claim their own place if one is free.
de: Bitte nicht. Jeder Code ist persönlich. Ein geteilter Code kann gesperrt werden, dann sperrt sich der Launcher wieder. Dein Freund kann sich selbst einen Platz holen, wenn noch einer frei ist.
go: #play

? Where are my worlds saved? | where is my save | wo sind meine Welten gespeichert | wo liegt mein Spielstand
en: In %AppData%\Blockwelt2\worlds. Paste that into the address bar of the Windows Explorer. All installed versions share these worlds.
de: In %AppData%\Blockwelt2\worlds. Kopier das in die Adresszeile des Windows Explorers. Alle installierten Versionen teilen sich diese Welten.

? The game stutters, what can I do? | it lags | das Spiel ruckelt | es laggt
en: Turn off shadows and bloom under Light in the settings. And please send Tixx the file %AppData%\Blockwelt2\ruckler.txt, it shows what slowed the game down.
de: Schalte Schatten und Bloom unter Licht in den Einstellungen aus. Und schick Tixx bitte die Datei %AppData%\Blockwelt2\ruckler.txt, dort steht, was das Spiel ausgebremst hat.

? There is no Run anyway button | Windows blocks the launcher completely | kein Trotzdem ausführen | Windows blockiert den Launcher
en: Right click Jayraid-Launcher.exe, choose Properties and tick "Unblock" at the bottom. Then start it again.
de: Rechtsklick auf Jayraid-Launcher.exe, Eigenschaften, unten den Haken bei „Zulassen“ setzen. Dann nochmal starten.
go: #install

? Do I need to update by hand? | how do I update | wie update ich | muss ich selbst aktualisieren
en: No. When there is a new version, the big button in the launcher turns into UPDATE. One click. The launcher updates itself the same way.
de: Nein. Gibt es eine neue Version, wird der grosse Knopf im Launcher zu UPDATE. Ein Klick. Der Launcher aktualisiert sich selbst genauso.
go: #install

? Can I play an older version? | go back to an old version | alte Version spielen | zurück zu einer älteren Version
en: Yes. Open INSTALLATIONS in the launcher, pick a version and click PLAY. Your worlds are backed up before an older version starts.
de: Ja. Öffne INSTALLATIONS im Launcher, wähle eine Version und klick PLAY. Deine Welten werden gesichert, bevor eine ältere Version startet.

? What should I test? | what helps the most | was soll ich testen | was hilft am meisten
en: Play the way you like. Most helpful: anything that crashes, freezes or stutters, anything that felt unfair, confusing or boring, and ideas for what Jayraid should get next.
de: Spiel, wie du magst. Am meisten hilft: alles, was abstürzt, hängt oder ruckelt, alles, was sich unfair, verwirrend oder langweilig anfühlt, und Ideen, was Jayraid als Nächstes bekommen soll.

? How do I turn the story goals on or off? | story goals off | Story-Ziele ausschalten | Ziele ein und aus
en: Press Y in the game. The first time you enter a world, the game also asks whether you want to follow the story.
de: Drück Y im Spiel. Beim ersten Betreten einer Welt fragt das Spiel ausserdem, ob du der Geschichte folgen willst.
go: #controls

? Can I play on Mac or Linux? | does it run on mac | läuft es auf Mac | geht es unter Linux
en: The launcher is Windows only for now. On Mac, Linux or a phone, the browser preview works: one island, no download.
de: Der Launcher läuft vorerst nur unter Windows. Auf Mac, Linux oder dem Handy geht die Browser-Vorschau: eine Insel, kein Download.
go: #play
