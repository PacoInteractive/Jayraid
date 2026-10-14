<p align="center">
  <img src="images/banner.jpg" alt="Jayraid" width="820">
</p>

<h3 align="center">A hexagon voxel adventure</h3>

<p align="center">
  <a href="https://pacointeractive.github.io/Jayraid/"><img src="https://img.shields.io/badge/Website-pacointeractive.github.io%2FJayraid-f08c1e?style=for-the-badge&labelColor=1c1c1e" alt="Website"></a>
  <a href="https://paco-interactive.itch.io/jayraid"><img src="https://img.shields.io/badge/Play-Browser%20preview-f08c1e?style=for-the-badge&labelColor=1c1c1e" alt="Browser preview"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Windows-10%20%2F%2011-46464a?labelColor=1c1c1e" alt="Windows">
  <img src="https://img.shields.io/badge/.NET-8%20Desktop%20Runtime-46464a?labelColor=1c1c1e" alt=".NET 8">
  <img src="https://img.shields.io/badge/License-All%20rights%20reserved-46464a?labelColor=1c1c1e" alt="License">
</p>

---

This is the **official download page** of Jayraid. It holds the finished, signed versions:
the Jayraid Launcher fetches every new version from here.

## Play (closed alpha)

Jayraid is in a **closed alpha with 20 tester places**. Every tester gets a personal code for the launcher.

1. Go to the [website](https://pacointeractive.github.io/Jayraid/) and click **CLAIM A PLACE**. You get your code file and the launcher.
2. Install the [.NET 8 Desktop Runtime](https://dotnet.microsoft.com/download/dotnet/8.0) if you do not have it, and unpack the launcher into a folder of its own.
3. Start `Jayraid-Launcher.exe` and type in your code (or drag the code file into the window).
4. Click **INSTALL**, then **PLAY**.

No place left? Play the [browser preview on itch.io](https://paco-interactive.itch.io/jayraid): one island, no download.

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
| `update/` | Signed version list, encrypted game package, tester list and launcher (read by the launcher) |
| `index.html`, `assets/`, `images/` | The website |
| [`CHANGELOG.md`](CHANGELOG.md) | All changes |

---

<sub>Jayraid · © 2026 Jaylen (PacoInteractive). All rights reserved. See [LICENSE](LICENSE).</sub>
