# Wissen aus dem Spiel für Bubbles (`update/wissen.json`)

Bubbles liest beim Öffnen der Website die Datei `update/wissen.json`, wenn es sie gibt.
Alles, was darin steht, kennt er danach: Namen auf Deutsch und Englisch, Beschreibung,
Werte wie Leben, Schaden oder Beute, Fundort, wie man es besiegt, Tipps.
Fragen wie „How many lives does a sabre diver have?“ oder „Was kostet der grüne Stab?“
beantwortet er dann mit den echten Zahlen aus dem Spiel.

Die Datei am besten **beim Bauen eines Releases automatisch erzeugen**, aus denselben Daten,
die das Spiel benutzt. Dann stimmt sie nach jedem Update von selbst. Sie kommt in den
Ordner `update/`, genau wie die Versionsliste.

## Format

```json
{
  "version": "Alpha 1.42.0",
  "things": [
    {
      "id": "sabre_diver",
      "kind": "enemy",
      "name": { "en": "Sabre diver", "de": "Säbeltaucher" },
      "aliases": ["sword diver"],
      "text": { "en": "A diver with a sabre. Guards the camps.", "de": "Ein Taucher mit Säbel. Bewacht die Lager." },
      "stats": { "lives": 6, "damage": 1, "drops": { "en": ["sabre"], "de": ["Säbel"] } },
      "where": { "en": "In the diver camps.", "de": "In den Lagern der Taucher." },
      "beat": { "en": "Block, then strike back.", "de": "Blocken, dann zurückschlagen." },
      "tips": { "en": "Don't stand still.", "de": "Bleib nicht stehen." },
      "go": "#game"
    }
  ]
}
```

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `id` | ja | Eindeutiger Name. Gibt es das Thema in Bubbles schon (z. B. `golem`, `bell`, `divers`, `sabre`, `traders`), wird es ergänzt statt ersetzt. |
| `name` | ja | Name auf Englisch und Deutsch. Daran erkennt Bubbles die Frage. |
| `aliases` | nein | Weitere Namen, auch umgangssprachlich oder mit Tippfehlern. |
| `kind` | nein | Zur Ordnung: `enemy`, `item`, `block`, `weapon`, `key`, `place` … |
| `text` | nein | Was es ist. |
| `stats` | nein | Beliebige Werte. Bekannte Namen werden übersetzt: `lives`, `health`, `damage`, `hits`, `drops`, `cost`, `price`, `speed`, `range`, `time`, `key`, `where`. Andere erscheinen mit ihrem Namen. Werte können Zahlen, Texte, Listen oder `{ "en": …, "de": … }` sein. |
| `where`, `beat`, `how`, `tips`, `reward`, `danger`, `why` | nein | Antworten auf die jeweilige Frageart, je `{ "en": …, "de": … }`. |
| `go` | nein | Abschnitt der Seite, zu dem Bubbles führt (`#game`, `#controls` …). |

Fehlt `de`, nimmt Bubbles `en`.

## Beispiel: Export in C#

Ungefähr so, angepasst an die eigenen Klassen (Namen hier nur als Beispiel):

```csharp
using System.Text.Json;

var things = new List<object>();
foreach (var enemy in EnemyCatalog.All)            // eure Liste der Gegner
{
    things.Add(new
    {
        id = enemy.Id,
        kind = "enemy",
        name = new { en = enemy.NameEn, de = enemy.NameDe },
        stats = new { lives = enemy.Lives, damage = enemy.Damage, drops = new { en = enemy.DropsEn, de = enemy.DropsDe } }
    });
}
// … dasselbe für Gegenstände, Blöcke, Tasten, Handelsangebote

var json = JsonSerializer.Serialize(new { version = GameVersion.Name, things },
    new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
File.WriteAllText(Path.Combine(updateFolder, "wissen.json"), json);
```

Die Datei muss nicht signiert werden: Sie ändert nur, was Bubbles erzählt, nicht das Spiel.
Was Bubbles nicht als Wert, sondern als ganze Frage beantworten soll, gehört in `bubbles-faq.md`.
