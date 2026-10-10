<p align="center">
  <img src="images/banner.jpg" alt="Jayraid" width="820">
</p>

<h3 align="center">A hexagon voxel adventure</h3>

<p align="center">
  <a href="https://pacointeractive.github.io/Jayraid/"><img src="https://img.shields.io/badge/Website-pacointeractive.github.io%2FJayraid-f08c1e?style=for-the-badge&labelColor=1c1c1e" alt="Website"></a>
  <a href="update/Jayraid-Launcher.zip?raw=1"><img src="https://img.shields.io/badge/Download-Jayraid%20Launcher-f08c1e?style=for-the-badge&labelColor=1c1c1e" alt="Download"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Windows-10%20%2F%2011-46464a?labelColor=1c1c1e" alt="Windows">
  <img src="https://img.shields.io/badge/.NET-8%20Desktop%20Runtime-46464a?labelColor=1c1c1e" alt=".NET 8">
  <img src="https://img.shields.io/badge/License-All%20rights%20reserved-46464a?labelColor=1c1c1e" alt="License">
</p>

---

This is the **official download page** of Jayraid. It holds the finished, signed versions –
the Jayraid Launcher fetches every new version from here.

## Play

1. Download [**Jayraid-Launcher.zip**](update/Jayraid-Launcher.zip?raw=1) and unpack it into a folder of its own.
2. Start `Jayraid-Launcher.exe` (requires the [.NET 8 Desktop Runtime](https://dotnet.microsoft.com/download/dotnet/8.0)).
3. Click **INSTALL**, then **PLAY**.

Whenever there is a new version, the launcher shows a big **UPDATE** button on start. The launcher updates itself the same way.

<p align="center">
  <img src="images/launcher.jpg" alt="Jayraid Launcher" width="720">
</p>

## Authenticity

Every version is listed in a **digitally signed** version list (`update/blockwelt-versionen.json` + `.sig`, RSA 3072).
The launcher checks the signature and, before every start, every single file. It refuses to start a modified or
forged version. So only download Jayraid from here.

## Contents

| Folder | |
|---|---|
| `update/` | Signed version list, game package and launcher (read by the launcher) |
| `index.html`, `assets/`, `images/` | The website |
| [`CHANGELOG.md`](CHANGELOG.md) | All changes |

---

<sub>Jayraid · © 2026 Jaylen (PacoInteractive). All rights reserved – see [LICENSE](LICENSE).</sub>
