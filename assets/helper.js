// Bubbles, der kleine Taucher unten rechts: schwimmt, blinzelt, schaut der Maus nach,
// erzaehlt ab und zu einen Fakt ueber Jayraid und man kann mit ihm schreiben (bubbles-brain.js).
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
    '<span class="helper-lang" role="group" aria-label="Language"><button type="button" data-lang="en">EN</button><button type="button" data-lang="de">DE</button></span>' +
    '<button class="helper-close" type="button" aria-label="Close">×</button></div>' +
    '<div class="helper-log" aria-live="polite"></div>' +
    '<div class="helper-asks"></div>' +
    '<form class="helper-form"><input type="text" maxlength="400" placeholder="Ask Bubbles anything…" aria-label="Message to Bubbles">' +
    '<button type="submit" aria-label="Send">➤</button></form>' +
    '<button class="helper-hide" type="button">Hide Bubbles</button>';
  var log = box.querySelector(".helper-log"), asks = box.querySelector(".helper-asks");
  var form = box.querySelector(".helper-form"), input = form.querySelector("input");
  box.querySelector(".helper-mode").textContent = api ? "AI" : "";
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var tip = document.createElement("div");
  tip.className = "helper-tip panel";
  tip.hidden = true;
  root.insertBefore(tip, box);

  // Das Wissen und Verstehen steckt in assets/bubbles-brain.js.
  var brain = window.BubblesBrain;

  // ── Sprache: Englisch oder Deutsch, Standard Englisch, wird gemerkt ─
  var T = {
    en: {
      hello: "Hi, I'm Bubbles! Most divers are friendly, as long as you don't hit us first. Ask me anything about Jayraid.",
      switched: "Okay, English it is!", input: "Ask Bubbles anything…", hide: "Hide Bubbles", preview: "Open the browser preview →",
      start: ["What's new?", "How do I join?", "How do I beat the golem?", "Fun fact"],
      hints: { "#install": "Psst. Windows will warn you. Click More info, then Run anyway.", "#news": "Blood moon is out. I'm hiding.", "#controls": "Both mouse buttons block a hit. Try it on a sabre diver." }
    },
    de: {
      hello: "Hallo, ich bin Bubbles! Die meisten Taucher sind nett, solange du nicht zuerst zuschlägst. Frag mich alles über Jayraid.",
      switched: "Alles klar, ab jetzt Deutsch!", input: "Frag Bubbles etwas…", hide: "Bubbles verstecken", preview: "Browser-Vorschau öffnen →",
      start: ["Was ist neu?", "Wie mache ich mit?", "Wie besiege ich den Golem?", "Erzähl einen Fakt"],
      hints: { "#install": "Psst. Windows warnt dich. Klick auf Weitere Informationen, dann Trotzdem ausführen.", "#news": "Der Blutmond ist da. Ich versteck mich.", "#controls": "Beide Maustasten blocken einen Schlag. Probier es an einem Säbeltaucher." }
    }
  };
  var lang = store("jr-lang") === "de" ? "de" : "en";
  function setLang(l, announce) {
    lang = l;
    store("jr-lang", l);
    brain.setLang(l);
    box.querySelectorAll(".helper-lang button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-lang") === l); });
    input.placeholder = T[l].input;
    box.querySelector(".helper-hide").textContent = T[l].hide;
    showChips();
    if (announce) add("bot", T[l].switched);
  }
  box.querySelectorAll(".helper-lang button").forEach(function (b) {
    b.addEventListener("click", function () { if (b.getAttribute("data-lang") !== lang) setLang(b.getAttribute("data-lang"), true); });
  });
  function fact() { return brain.fact(lang); }
  // Die neueste Version aus der signierten Liste, damit "What's new?" immer stimmt.
  fetch("update/blockwelt-versionen.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (l) {
      var v = l && (l.versionen || []).filter(function (x) { return x.id === l.neueste; })[0];
      if (v) brain.setNews("The newest version is " + (v.nameEn || v.name) + " (" + v.datum + "). " + (v.neuEn || ""),
        "Die neueste Version ist " + v.name + " (" + v.datum + "). " + (v.neu || ""));
    })
    .catch(function () {});
  // Der Changelog ist sein Gedaechtnis fuer alles, was nicht im Wissensnetz steht.
  fetch("CHANGELOG.md", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.text() : ""; })
    .then(function (md) { if (md) brain.setChangelog(md); })
    .catch(function () {});
  var placesAsked = false;
  function places() {
    if (placesAsked || !cfg.testerApi) return;
    placesAsked = true;
    fetch(cfg.testerApi.replace(/\/$/, "") + "/stand", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (x) { if (x && typeof x.frei === "number") brain.setPlaces(x.frei, x.gesamt); })
      .catch(function () {});
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
  function goTo(go, words, names) {
    if (go === "PREVIEW") {
      if (!cfg.preview) return;
      var a = document.createElement("a");
      a.href = cfg.preview; a.rel = "noopener"; a.textContent = T[lang].preview;
      var p = document.createElement("p"); p.className = "helper-msg bot"; p.appendChild(a);
      log.appendChild(p); log.scrollTop = log.scrollHeight;
      return;
    }
    var target = go && document.querySelector(go);
    if (!target) return;
    if (!spotlight(target, words || [], names || [])) target.scrollIntoView({ behavior: "smooth" });
  }

  // ── Zur Stelle fuehren und das Wichtigste orange markieren ────────
  // Jeder Block im Abschnitt bekommt Punkte fuer die Woerter aus Frage und Antwort
  // (Namen des Themas zaehlen dreifach). Der beste wird hergeholt, leuchtet kurz auf,
  // und die passenden Woerter darin werden markiert.
  var marked = [], markTimer;
  function plain(t) { return t.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss"); }
  function unmark() {
    marked.forEach(function (m) {
      if (m.classList) { m.classList.remove("bubbles-focus"); return; }
    });
    document.querySelectorAll("mark.bubbles-mark").forEach(function (m) {
      var parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
    marked = [];
  }
  function spotlight(section, words, names) {
    unmark();
    var strong = [].concat.apply([], names), blocks = section.querySelectorAll(".feature, .steps > li, .table > div, .news-top, .version, .play-text, .playbar, .play-info, .intro, .note");
    var best = null, bestScore = 0, bestHits = [];
    Array.prototype.forEach.call(blocks, function (b) {
      if (b.offsetParent === null) return;
      var text = " " + plain(b.textContent).replace(/[^a-z0-9.#/]+/g, " ") + " ", score = 0, hits = [];
      words.forEach(function (w) {
        if (w.length < 3 || text.indexOf(" " + w) < 0) return;
        score += strong.indexOf(w) >= 0 ? 3 : 1;
        hits.push(w);
      });
      if (score > bestScore) { bestScore = score; best = b; bestHits = hits; }
    });
    if (!best) return false;
    best.scrollIntoView({ behavior: "smooth", block: "center" });
    best.classList.add("bubbles-focus");
    marked.push(best);
    var re = new RegExp("(^|[^a-zA-Z\u00c0-\u024f])(" + bestHits.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")([a-z\u00c0-\u024f]*)", "gi");
    var walker = document.createTreeWalker(best, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      return n.parentNode.closest("[data-hex], svg, mark, script") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    } }), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var text = node.textContent;
      re.lastIndex = 0;
      if (!re.test(plain(text))) return;
      var frag = document.createDocumentFragment(), last = 0, m;
      re.lastIndex = 0;
      var low = plain(text);
      while ((m = re.exec(low))) {
        var start = m.index + m[1].length, end = start + m[2].length + m[3].length;
        frag.appendChild(document.createTextNode(text.slice(last, start)));
        var mark = document.createElement("mark");
        mark.className = "bubbles-mark";
        mark.textContent = text.slice(start, end);
        frag.appendChild(mark);
        last = end;
      }
      frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
    clearTimeout(markTimer);
    markTimer = setTimeout(unmark, 14000);
    return true;
  }

  function ask(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    add("me", text);
    history.push({ role: "user", content: text });
    var typing = add("bot typing", "");
    typing.innerHTML = "<i></i><i></i><i></i>";
    function answer(reply, go, chips, words, names) {
      typing.remove();
      add("bot", reply);
      showChips(chips);
      history.push({ role: "assistant", content: reply });
      if (history.length > 12) history = history.slice(-12);
      busy = false;
      nod();
      if (go) goTo(go, words, names);
    }
    var local = brain.reply(text);
    if (!api) { setTimeout(function () { answer(local.text, local.go, local.chips, local.focus, local.names); }, 450 + Math.min(900, local.text.length * 6)); return; }
    fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }) })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) { answer(d.reply || local.text, local.go, local.chips, local.focus, local.names); })
      .catch(function () { answer(local.text, local.go, local.chips, local.focus, local.names); });
  }

  // Vorschlaege unter dem Chat: am Anfang feste, danach passend zum Thema.
  function showChips(list) {
    asks.textContent = "";
    (list && list.length ? list : T[lang].start).slice(0, 4).forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.addEventListener("click", function () { ask(q); });
      asks.appendChild(b);
    });
  }
  setLang(lang, false);
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); input.value = ""; });

  function open() {
    tip.hidden = true;
    box.hidden = false;
    root.classList.add("open");
    places();
    if (!log.children.length) add("bot", T[lang].hello);
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

  var seen = {};
  window.addEventListener("scroll", function () {
    Object.keys(T.en.hints).forEach(function (id) {
      var s = document.querySelector(id);
      if (seen[id] || !s) return;
      var r = s.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.5 && r.bottom > 0 && say(T[lang].hints[id])) seen[id] = true;
    });
  }, { passive: true });
  // Ein Fakt nach einer Weile, danach selten, hoechstens drei pro Besuch.
  var told = 0;
  (function later(ms) {
    setTimeout(function () {
      if (told < 3 && !document.hidden && say(fact())) told++;
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
