<p align="center">
  <img src="bilder/banner.jpg" alt="Jayraid" width="820">
</p>

<h3 align="center">Ein Hexagon-Voxel-Abenteuer</h3>

<p align="center">
  <a href="https://pacointeractive.github.io/Jayraid/"><img src="https://img.shields.io/badge/Webseite-pacointeractive.github.io%2FJayraid-f08c1e?style=for-the-badge&labelColor=1c1c1e" alt="Webseite"></a>
  <a href="update/Jayraid-Launcher.zip?raw=1"><img src="https://img.shields.io/badge/Herunterladen-Jayraid%20Launcher-f08c1e?style=for-the-badge&labelColor=1c1c1e" alt="Herunterladen"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Windows-10%20%2F%2011-46464a?labelColor=1c1c1e" alt="Windows">
  <img src="https://img.shields.io/badge/.NET-8%20Desktop%20Runtime-46464a?labelColor=1c1c1e" alt=".NET 8">
  <img src="https://img.shields.io/badge/Lizenz-Alle%20Rechte%20vorbehalten-46464a?labelColor=1c1c1e" alt="Lizenz">
</p>

---

Dies ist die **offizielle Download-Seite** von Jayraid. Hier liegen die fertigen, signierten Versionen –
der Jayraid Launcher holt sich jede neue Version von hier.

## Spielen

1. [**Jayraid-Launcher.zip**](update/Jayraid-Launcher.zip?raw=1) herunterladen und in einen eigenen Ordner entpacken.
2. `Jayraid-Launcher.exe` starten (benötigt die [.NET 8 Desktop Runtime](https://dotnet.microsoft.com/download/dotnet/8.0)).
3. **INSTALLIEREN**, dann **SPIELEN**.

Gibt es eine neue Version, zeigt der Launcher beim Start einen großen **UPDATE**-Knopf. Auch der Launcher selbst aktualisiert sich so.

<p align="center">
  <img src="bilder/launcher.jpg" alt="Jayraid Launcher" width="720">
</p>

## Echtheit

Jede Version steht in einer **digital unterschriebenen** Versionsliste (`update/blockwelt-versionen.json` + `.sig`, RSA 3072).
Der Launcher prüft die Unterschrift und vor jedem Start jede einzelne Datei. Eine veränderte oder gefälschte
Version startet er nicht. Lade Jayraid deshalb nur von hier.

## Inhalt

| Ordner | |
|---|---|
| `update/` | Signierte Versionsliste, Spielpaket und Launcher (liest der Launcher) |
| `index.html`, `assets/`, `bilder/` | Die Webseite |
| [`CHANGELOG.md`](CHANGELOG.md) | Alle Änderungen |

---

<sub>Jayraid · © 2026 Jaylen (PacoInteractive). Alle Rechte vorbehalten – siehe [LICENSE](LICENSE).</sub>
