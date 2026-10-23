# Bubbles' Worker: unbeantwortete Fragen sammeln und (optional) echte KI

Der Worker kann zwei Dinge, unabhängig voneinander:

1. **Unbeantwortete Fragen sammeln (kostenlos):** Weiss Bubbles etwas nicht, schickt die Website
   nur die Frage an den Worker, ohne IP-Adresse, Namen oder sonstige Daten. Gleiche Fragen werden gezählt.
   Du siehst die Liste, häufigste zuerst, und schreibst die Antworten in `bubbles-faq.md`.
2. **Echte KI (kostet pro Nachricht):** siehe weiter unten.

## Fragen sammeln einrichten

Im Ordner `tools/bubbles-worker`:

```
npm install
npx wrangler login
npx wrangler kv namespace create MISSES
```

Die angezeigte `id` in `wrangler.toml` bei `[[kv_namespaces]]` eintragen. Dann ein langes,
zufälliges Passwort für dich festlegen (z. B. aus einem Passwort-Manager):

```
npx wrangler secret put ADMIN_TOKEN
npx wrangler deploy
```

Die Adresse, die `deploy` anzeigt, in `assets/config.js` eintragen:

```
bubblesLog: "https://jayraid-bubbles.<dein-name>.workers.dev"
```

Ab dann steht unter dem Chat ein kurzer Hinweis, dass unbeantwortete Fragen anonym gespeichert werden.

**Die Liste ansehen:** https://pacointeractive.github.io/Jayraid/tools/bubbles-worker/fragen.html
öffnen und das `ADMIN_TOKEN` eingeben. Es bleibt nur in diesem Tab. Mit „Erledigt“ entfernst du
eine Frage, wenn du sie in die FAQ übernommen hast. Fragen verschwinden nach 120 Tagen von selbst.

---

## Echte KI (optional)

Ohne diesen Worker antwortet Bubbles auf der Website mit seinem eigenen kleinen Gehirn
(Wissensnetz in `assets/bubbles-brain.js`, FAQ in `bubbles-faq.md`). Mit dem Worker antwortet eine echte KI (Claude):
er versteht beliebige Fragen, antwortet auf Deutsch oder Englisch und liest seinen Wissensstand
live aus `CHANGELOG.md`. Fällt der Worker aus, springt automatisch wieder das kleine Gehirn ein.

### Was du brauchst

- Einen **Anthropic API-Schlüssel**: https://console.anthropic.com → API Keys.
  Lege dort unter *Limits* ein **monatliches Ausgabenlimit** fest, damit nichts aus dem Ruder läuft.
- Dein **Cloudflare-Konto** (das gleiche wie für die Tester-Plätze) und Node.js.

### Einrichten

```
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

`wrangler secret put` fragt nach dem Schlüssel. Er wird nur bei Cloudflare gespeichert, nie im Repo.
`wrangler deploy` zeigt am Ende eine Adresse wie `https://jayraid-bubbles.<dein-name>.workers.dev`.

Diese Adresse trägst du in `assets/config.js` ein:

```
bubblesApi: "https://jayraid-bubbles.<dein-name>.workers.dev"
```

Danach steht im Chatfenster neben „Bubbles“ ein kleines **AI**.

### Kosten und Schutz

- Jede Nachricht ist eine Anfrage an Claude. Der gleichbleibende Teil (Persona und Changelog) wird
  zwischengespeichert, das macht Folgefragen günstiger.
- `MODEL` in `wrangler.toml`: `claude-opus-5-5` antwortet am besten. `claude-haiku-5-5` kostet nur einen
  Bruchteil und reicht für einen Website-Helfer meist auch. Nach einer Änderung: `npx wrangler deploy`.
- Der Worker antwortet nur Anfragen von deiner Website (`ALLOWED_ORIGIN`), höchstens `MAX_PER_10_MIN`
  Nachrichten pro Besucher in 10 Minuten, kurze Nachrichten und nur die letzten 12 im Verlauf.
- Was Bubbles sagen darf und wie er klingt, steht oben in `worker.js` (`PERSONA`).
