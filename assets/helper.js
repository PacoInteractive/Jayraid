// Bubbles, der kleine Taucher unten rechts: schwimmt, blinzelt, schaut der Maus nach,
// erzaehlt ab und zu einen Fakt ueber Jayraid und man kann mit ihm schreiben.
// Mit window.JAYRAID.bubblesApi (config.js) antwortet eine echte KI (tools/bubbles-worker),
// ohne sie oder wenn sie nicht erreichbar ist, antwortet sein eigenes kleines Gehirn hier.
(function () {
  "use strict";
  var root = document.getElementById("helper");
  if (!root) return;
  var bot = root.querySelector(".helper-bot");
  var box = root.querySelector(".helper-box");
  var pupils = root.querySelectorAll(".pupil");
  var cfg = window.JAYRAID || {};
  var api = (cfg.bubblesApi || "").replace(/\/$/, "");

  // ── Das Chatfenster ───────────────────────────────────────────────
  box.innerHTML =
    '<div class="helper-head"><b>Bubbles</b><span class="helper-mode"></span>' +
    '<button class="helper-close" type="button" aria-label="Close">×</button></div>' +
    '<div class="helper-log" aria-live="polite"></div>' +
    '<div class="helper-asks"></div>' +
    '<form class="helper-form"><input type="text" maxlength="400" placeholder="Ask Bubbles anything…" aria-label="Message to Bubbles">' +
    '<button type="submit" aria-label="Send">➤</button></form>' +
    '<button class="helper-hide" type="button">Hide Bubbles</button>';
  var log = box.querySelector(".helper-log"), asks = box.querySelector(".helper-asks");
  var form = box.querySelector(".helper-form"), input = form.querySelector("input");
  box.querySelector(".helper-mode").textContent = api ? "AI" : "";
  var tip = document.createElement("div");
  tip.className = "helper-tip panel";
  tip.hidden = true;
  root.insertBefore(tip, box);

  // ── Was Bubbles weiss (Englisch und Deutsch) ─────────────────────
  var latest = "Alpha 1.41.1";
  var facts = [
    ["The divers trained in their own AI training centre before they ever met a player. They remember how you fight.",
      "Die Taucher wurden in einem eigenen KI-Trainingszentrum trainiert. Sie merken sich, wie du kämpfst."],
    ["A thrown block lands in exactly the same spot at any frame rate. That was built for speedruns.",
      "Ein geworfener Block landet bei jeder Bildrate genau gleich. Das ist für Speedruns gemacht."],
    ["The bell's sound wave hurts exactly as far as you can see it. Not one block further.",
      "Die Schallwelle der Glocke trifft genau so weit, wie du sie siehst. Keinen Block weiter."],
    ["Lives used to be half hearts. Since Alpha 1.30 you have twelve whole hexagons, and every hit costs exactly one.",
      "Früher gab es halbe Herzen. Seit Alpha 1.30 hast du zwölf ganze Sechsecke, jeder Treffer kostet genau eins."],
    ["The golem only falls to the sabre and only dies to the golden wand. Bring both.",
      "Der Golem fällt nur durch den Säbel und stirbt nur durch den goldenen Stab. Nimm beides mit."],
    ["Every block in Jayraid has 16 variants, so no wall looks copy-pasted.",
      "Jeder Block hat 16 Varianten, deshalb sieht keine Wand kopiert aus."],
    ["Melvin sits at the top of every watchtower. Say hi. From a distance.",
      "Melvin sitzt oben auf jedem Wachturm. Sag hallo. Aus sicherer Entfernung."],
    ["The traders put out burning ships with snow. Where they get it from on the open sea is their secret.",
      "Die Händler löschen brennende Schiffe mit Schnee. Woher sie den auf hoher See haben, bleibt ihr Geheimnis."],
    ["In the pixel workshop you can redraw the sabre, the torch, the wands and even the fish, with an eyedropper.",
      "In der Pixelwerkstatt pixelst du Säbel, Fackel, Stäbe und sogar den Fisch selbst, mit Pipette."],
    ["The first C# version of Jayraid came out on 20 September 2026. More than 50 versions followed in a month.",
      "Die erste C#-Version von Jayraid kam am 20. September 2026. In einem Monat folgten über 50 Versionen."],
    ["Gravel by the water turns into wet gravel. Dry gravel, sand and snow crumble when nothing holds them.",
      "Kies am Wasser wird zu nassem Kies. Trockener Kies, Sand und Schnee rieseln, wenn nichts sie hält."],
    ["The golem's treasure chest leaps out in an arc and eats its way into the ground. Dramatic, I know.",
      "Die Schatztruhe des Golems springt im Bogen heraus und frisst sich in den Boden. Dramatisch, ich weiss."],
    ["Sometimes a defeated rotten diver stands back up, blue, and follows you. Give it a sabre and it fights with you.",
      "Manchmal steht ein besiegter verrotteter Taucher blau wieder auf und folgt dir. Gib ihm einen Säbel."],
    ["The game speaks German too. You can switch the language in the game or in the launcher.",
      "Das Spiel kann auch Deutsch. Umstellen kannst du im Spiel oder im Launcher."],
    ["Every launcher checks every single file against a signed list before the game starts. Changed files don't run.",
      "Der Launcher prüft vor jedem Start jede Datei gegen eine signierte Liste. Veränderte Dateien starten nicht."],
    ["Fire spreads over wood, leaves and grass and chars them. Rain puts it out. So does jumping into the sea.",
      "Feuer breitet sich über Holz, Laub und Gras aus und verkohlt sie. Regen löscht es. Ins Meer springen auch."]
  ];
  // Die erste passende Regel gewinnt: Themen zuerst, Begruessung zuletzt.
  // Jede Regel: Suchmuster, Antwort Englisch, Antwort Deutsch, optional ein Abschnitt zum Hinscrollen.
  var brain = [
    [/join|tester|place|code|claim|platz|mitmachen|teilnehmen|beta|alpha|play|spielen|download|herunterladen/, "Click CLAIM A PLACE at the top. You get a personal code and the launcher. There are only 20 places.", "Klick oben auf CLAIM A PLACE. Du bekommst einen persönlichen Code und den Launcher. Es gibt nur 20 Plätze.", "#play"],
    [/windows|warn|smartscreen|virus|safe|sicher|run anyway|trotzdem/, "Windows warns about every small game it doesn't know. Click More info, then Run anyway. The launcher checks every file itself.", "Windows warnt bei jedem kleinen Spiel, das es nicht kennt. Klick auf Weitere Informationen, dann Trotzdem ausführen. Der Launcher prüft jede Datei selbst.", "#install"],
    [/\.net|runtime|install|installier|start|launcher|update/, "Install the free .NET 8 Desktop Runtime once, unpack the launcher into its own folder, enter your code, then INSTALL and PLAY. Updates come by themselves.", "Einmal die kostenlose .NET 8 Desktop Runtime installieren, den Launcher in einen eigenen Ordner entpacken, Code eingeben, dann INSTALL und PLAY. Updates kommen von selbst.", "#install"],
    [/mac|linux|apple|handy|phone|mobile|browser|preview|vorschau/, "The launcher is Windows only for now. On Mac, Linux or anywhere else, the browser preview works: one island, no download.", "Der Launcher läuft vorerst nur unter Windows. Auf Mac, Linux und überall sonst geht die Browser-Vorschau: eine Insel, kein Download.", "PREVIEW"],
    [/price|cost|free|pay|kostet|kosten|gratis|kostenlos|bezahl/, "Testing the alpha is free. You just need one of the 20 places.", "Die Alpha zu testen ist kostenlos. Du brauchst nur einen der 20 Plätze."],
    [/blood|moon|raid|blut|mond|überfall|ueberfall|night|nacht/, "Some nights the moon turns red and the divers raid your base, with field cannons. Build walls during the day. There's also a poison moon with acid rain.", "In manchen Nächten wird der Mond rot und die Taucher überfallen deine Basis, mit Feldkanonen. Bau tagsüber Mauern. Es gibt auch einen Giftmond mit Säureregen.", "#game"],
    [/mode|sandbox|adventure|challenge|modus|modi/, "Three modes: Sandbox to just build, Adventure with the story, and Challenge with only four lives.", "Drei Modi: Sandbox zum Bauen, Adventure mit der Geschichte und Challenge mit nur vier Leben.", "#game"],
    [/golem|boss|ending|ende|ruin|ruine|chest|truhe/, "The golem sleeps in chains in a castle ruin. Walk quietly. The sabre knocks it down, only the golden wand finishes it. Its chest ends the story.", "Der Golem schläft angekettet in einer Burgruine. Geh leise. Der Säbel wirft ihn um, nur der goldene Stab besiegt ihn. Seine Truhe beendet die Geschichte.", "#game"],
    [/bell|glocke|wand|stab|golden/, "Every trader ship has a giant bell that guards the golden wand. Its sound waves hurt, and it can leap at you. Watch the golden ring and step out of it.", "Auf jedem Händlerschiff wacht eine riesige Glocke über den goldenen Stab. Ihre Schallwellen tun weh und sie springt dich an. Achte auf den goldenen Ring und tritt heraus.", "#game"],
    [/companion|blue|blau|begleiter|friend|freund/, "Sometimes a defeated rotten diver gets back up blue and follows you. Press E to hand it a sabre.", "Manchmal steht ein besiegter verrotteter Taucher blau wieder auf und folgt dir. Mit E gibst du ihm einen Säbel.", "#game"],
    [/diver|taucher|enemy|enemies|gegner|attack|angriff|fight|kampf/, "Divers only attack if you strike first, or during a blood moon raid. They learn how you fight, so mix it up. Hold both mouse buttons to block a hit.", "Taucher greifen nur an, wenn du zuerst zuschlägst, oder im Blutmond-Überfall. Sie lernen, wie du kämpfst, also wechsle ab. Beide Maustasten halten blockt einen Schlag.", "#controls"],
    [/trader|ship|händler|haendler|schiff|trade|handel/, "The traders sail between the islands. Press E near one to trade. They're friendly, until you take the bell's wand.", "Die Händler segeln zwischen den Inseln. Drück E bei einem, um zu handeln. Sie sind nett, bis du den Stab der Glocke nimmst.", "#game"],
    [/control|key|button|taste|steuer|block|mouse|maus|jump|spring|swim|schwimm/, "WASD to walk, Space to jump, sprint in deep water to swim. Both mouse buttons block a hit, Y turns the story goals on or off. All keys are on this page.", "WASD zum Laufen, Leertaste zum Springen, im tiefen Wasser sprinten zum Schwimmen. Beide Maustasten blocken, Y schaltet die Story-Ziele ein und aus. Alle Tasten stehen auf dieser Seite.", "#controls"],
    [/fire|torch|feuer|fackel|burn|brenn/, "Fire spreads over wood, leaves and grass. Water and rain put it out. Press T for the torch.", "Feuer breitet sich über Holz, Laub und Gras aus. Wasser und Regen löschen es. Mit T nimmst du die Fackel.", "#controls"],
    [/story|goal|ziel|geschichte|quest|what to do|was tun|langweilig|bored/, "Turn on the story: goals with an arrow and a golden beam lead you from the first watchtower to the golem. Y turns them on or off.", "Schalt die Geschichte ein: Ziele mit Pfeil und goldenem Strahl führen dich vom ersten Wachturm bis zum Golem. Mit Y an und aus.", "#controls"],
    [/\bnew\b|news|version|\bneu|latest|changelog|änderung|aenderung/, "NEWS", "NEWS", "#news"],
    [/minecraft|clone|klon/, "Jayraid is built from hexagon pillars, with ships, two factions that fight each other, bosses and an ending. Different water, different game.", "Jayraid besteht aus Sechsecksäulen, mit Schiffen, zwei Fraktionen, die sich bekämpfen, Bossen und einem Ende. Anderes Wasser, anderes Spiel."],
    [/fact|fun|tell me|something|fakt|erzähl|erzaehl|wusstest|did you know/, "FACT", "FACT"],
    [/who are you|what are you|wer bist du|was bist du|your name|dein name/, "I'm Bubbles, a diver from Jayraid. I live in the corner of this page and know a thing or two about the game.", "Ich bin Bubbles, ein Taucher aus Jayraid. Ich wohne in der Ecke dieser Seite und kenne mich mit dem Spiel aus."],
    [/\b(hi|hello|hey|hallo|servus|grüezi|moin|yo)\b/, "Hi! I'm Bubbles, a diver. One of the friendly ones. Ask me about Jayraid.", "Hallo! Ich bin Bubbles, ein Taucher. Einer von den netten. Frag mich etwas über Jayraid."],
    [/thank|thx|danke|merci/, "Anytime! Blub.", "Gern! Blub."],
    [/bye|ciao|tschüss|tschuess|see you/, "Bye! Watch out for red moons.", "Tschüss! Pass auf bei rotem Mond."]
  ];
  var GERMAN = /\b(ich|du|wie|was|wo|wer|warum|kann|ist|und|nicht|der|die|das|ein|eine|mit|für|spiel|hallo|danke|bitte)\b/;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  var factOrder = facts.map(function (f, i) { return i; }).sort(function () { return Math.random() - 0.5; }), factAt = 0;
  function fact(de) { var f = facts[factOrder[factAt++ % facts.length]]; return de ? "Fakt: " + f[1] : "Fun fact: " + f[0]; }

  // Die neueste Version aus der signierten Liste, damit "What's new?" immer stimmt.
  var newsEn = "", newsDe = "";
  fetch("update/blockwelt-versionen.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (l) {
      var v = l && (l.versionen || []).filter(function (x) { return x.id === l.neueste; })[0];
      if (!v) return;
      latest = v.nameEn || v.name;
      newsEn = "The newest version is " + latest + " (" + v.datum + "). " + (v.neuEn || "");
      newsDe = "Die neueste Version ist " + v.name + " (" + v.datum + "). " + (v.neu || "");
    })
    .catch(function () {});

  function think(text) {
    var t = text.toLowerCase(), de = GERMAN.test(t), best = null;
    for (var i = 0; i < brain.length && !best; i++) if (brain[i][0].test(t)) best = brain[i];
    if (!best) {
      return { text: de
        ? "Hm, da bin ich überfragt. Ich bin ein Taucher, kein Lexikon. Frag mich nach dem Spiel, den Bossen, der Installation oder den Tasten. Oder willst du einen Fakt?"
        : "Hm, no idea. I'm a diver, not a library. Ask me about the game, the bosses, installing or the controls. Or want a fun fact?" };
    }
    var answer = de ? best[2] : best[1];
    if (answer === "FACT") answer = fact(de);
    if (answer === "NEWS") answer = (de ? newsDe : newsEn) || (de ? "Das Neueste steht im Changelog." : "Everything new is in the changelog.");
    return { text: answer, go: best[3] };
  }

  // ── Nachrichten ───────────────────────────────────────────────────
  var history = [], busy = false;
  function add(who, text) {
    var m = document.createElement("p");
    m.className = "helper-msg " + who;
    m.textContent = text;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }
  function nod() { bot.classList.remove("nod"); void bot.offsetWidth; bot.classList.add("nod"); }
  function goTo(go) {
    if (go === "PREVIEW") {
      if (!cfg.preview) return;
      var a = document.createElement("a");
      a.href = cfg.preview; a.rel = "noopener"; a.textContent = "Open the browser preview →";
      var p = document.createElement("p"); p.className = "helper-msg bot"; p.appendChild(a);
      log.appendChild(p); log.scrollTop = log.scrollHeight;
      return;
    }
    var target = go && document.querySelector(go);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  }

  function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    add("me", text);
    history.push({ role: "user", content: text });
    var typing = add("bot typing", "");
    typing.innerHTML = "<i></i><i></i><i></i>";
    function answer(reply, go) {
      typing.remove();
      add("bot", reply);
      history.push({ role: "assistant", content: reply });
      if (history.length > 12) history = history.slice(-12);
      busy = false;
      nod();
      if (go) goTo(go);
    }
    var local = think(text);
    if (!api) { setTimeout(function () { answer(local.text, local.go); }, 500 + Math.random() * 500); return; }
    fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }) })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) { answer(d.reply || local.text, d.reply ? null : local.go); })
      .catch(function () { answer(local.text, local.go); });
  }

  [["What's new?", "What's new?"], ["How do I join?", "How do I join?"], ["Controls", "Controls?"], ["Fun fact", "Tell me a fun fact"]]
    .forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = q[0];
      b.addEventListener("click", function () { ask(q[1]); });
      asks.appendChild(b);
    });
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); input.value = ""; });

  function open() {
    tip.hidden = true;
    box.hidden = false;
    root.classList.add("open");
    if (!log.children.length) add("bot", "Hi, I'm Bubbles! Most divers are friendly, as long as you don't hit us first. Ask me anything about Jayraid.");
    if (window.innerWidth > 860) input.focus();
  }
  function close() {
    box.hidden = true;
    root.classList.remove("open");
  }

  bot.addEventListener("click", function () {
    if (root.classList.contains("hidden")) { root.classList.remove("hidden"); store("jr-helper", "on"); return; }
    if (box.hidden) open(); else close();
  });
  box.querySelector(".helper-close").addEventListener("click", close);
  box.querySelector(".helper-hide").addEventListener("click", function () {
    close();
    root.classList.add("hidden");
    store("jr-helper", "off");
  });
  if (store("jr-helper") === "off") root.classList.add("hidden");

  // ── Kleine Sprechblasen: Tipps beim Scrollen und ab und zu ein Fakt ─
  var tipTimer;
  function say(text) {
    if (!box.hidden || root.classList.contains("hidden") || window.innerWidth < 860) return false;
    tip.textContent = text;
    tip.hidden = false;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(function () { tip.hidden = true; }, 7000);
    nod();
    return true;
  }
  tip.addEventListener("click", function () { open(); add("bot", tip.textContent); });

  var hints = {
    "#install": "Psst. Windows will warn you. Click More info, then Run anyway.",
    "#news": "Blood moon is out. I'm hiding.",
    "#controls": "Both mouse buttons block a hit. Try it on a sabre diver."
  }, seen = {};
  window.addEventListener("scroll", function () {
    Object.keys(hints).forEach(function (id) {
      var s = document.querySelector(id);
      if (seen[id] || !s) return;
      var r = s.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.5 && r.bottom > 0 && say(hints[id])) seen[id] = true;
    });
  }, { passive: true });
  // Ein Fakt nach einer Weile, danach selten, hoechstens drei pro Besuch.
  var told = 0;
  (function later(ms) {
    setTimeout(function () {
      if (told < 3 && !document.hidden && say(fact(false))) told++;
      if (told < 3) later(80000 + Math.random() * 60000);
    }, ms);
  })(35000);

  // Die Augen folgen der Maus.
  window.addEventListener("mousemove", function (e) {
    var r = bot.getBoundingClientRect();
    var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.4);
    var d = Math.max(1, Math.hypot(dx, dy));
    var x = dx / d * 2.4, y = dy / d * 2.4;
    pupils.forEach(function (p) { p.setAttribute("transform", "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ")"); });
  }, { passive: true });
})();
