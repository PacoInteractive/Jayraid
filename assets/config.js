// Wohin die Seite fragt (wird von tools/tester-worker/Einrichten.ps1 geschrieben).
//   testerApi: der Cloudflare Worker mit den Tester-Plaetzen (leer: Plaetze noch nicht offen)
//   preview:   die Browser-Vorschau auf itch.io (leer: kein Link)
window.JAYRAID = {
  testerApi: "https://jayraid-tester.jayraid-tester.workers.dev",
  preview: "https://paco-interactive.itch.io/jayraid",
  // discord: der Einladungslink (leer: kein Knopf in der Seitenleiste)
  discord: "",
  // bubblesApi: der Cloudflare Worker, ueber den Bubbles mit einer echten KI antwortet
  // (tools/bubbles-worker). Leer: Bubbles antwortet mit seinem eigenen kleinen Gehirn.
  bubblesApi: "",
  // bubblesLog: derselbe Worker, Bubbles meldet ihm anonym die Fragen, die er nicht beantworten
  // konnte (tools/bubbles-worker). Leer: nichts wird gesendet.
  bubblesLog: ""
};
