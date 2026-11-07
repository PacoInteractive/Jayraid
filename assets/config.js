// Wohin die Seite fragt (wird von tools/tester-worker/Einrichten.ps1 geschrieben).
//   testerApi: der Cloudflare Worker mit den Tester-Plaetzen (leer: Plaetze noch nicht offen)
//   preview:   die Browser-Vorschau (seit 2026-11-07 hier unter play/; leer: kein Link)
window.JAYRAID = {
  testerApi: "https://jayraid-tester.jayraid-tester.workers.dev",
  preview: "play/",
  // discord: der Einladungslink (leer: Reiter, Banner und Fusszeilen-Link verschwinden)
  discord: "https://discord.gg/SNkbBtUwEf"
};
