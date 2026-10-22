// Der kleine Taucher unten rechts: schwimmt, blinzelt, schaut der Maus nach und
// beantwortet die haeufigsten Fragen. Feste Antworten, keine KI.
(function () {
  "use strict";
  var root = document.getElementById("helper");
  if (!root) return;
  var bot = root.querySelector(".helper-bot");
  var box = root.querySelector(".helper-box");
  var say = root.querySelector(".helper-say");
  var asks = root.querySelector(".helper-asks");
  var pupils = root.querySelectorAll(".pupil");

  // Was er weiss. "go" scrollt zum Abschnitt.
  var answers = {
    join: { q: "How do I join?", a: "Hit CLAIM A PLACE at the top. You get a code file and the launcher. There are only 20 places, so be quick.", go: "#play" },
    install: { q: "Windows warns me", a: "That's normal for a small game. Click More info, then Run anyway. The launcher checks every file before the game starts.", go: "#install" },
    mac: { q: "I'm on Mac / Linux", a: "The launcher is Windows only for now. The browser preview runs everywhere, one island, no download.", link: "preview" },
    news: { q: "What's new?", a: "The blood moon! Some nights the divers raid your base, with field cannons. Build walls before dark.", go: "#news" },
    keys: { q: "Controls?", a: "WASD to swim, um, walk. Both mouse buttons block a hit. J turns the story goals on or off. The rest is down here.", go: "#controls" }
  };
  // Ein Satz pro Abschnitt, jeweils nur einmal, und nur wenn das Fenster zu ist.
  var hints = {
    "#install": "Psst. Windows will warn you. Click More info, then Run anyway.",
    "#news": "Blood moon is out. I'm hiding.",
    "#controls": "Both mouse buttons block a hit. Try it on a sabre diver."
  };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  function show(text) {
    say.textContent = text;
    box.hidden = false;
    root.classList.add("open");
  }
  function close() {
    box.hidden = true;
    root.classList.remove("open");
    asks.hidden = true;
  }

  function menu() {
    show("Hi! I'm a friendly diver. Most of us are, as long as you don't hit us first. What do you need?");
    asks.hidden = false;
  }

  Object.keys(answers).forEach(function (key) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = answers[key].q;
    b.addEventListener("click", function () {
      var x = answers[key];
      say.textContent = x.a;
      if (x.go) document.querySelector(x.go).scrollIntoView({ behavior: "smooth" });
      if (x.link === "preview" && window.JAYRAID && window.JAYRAID.preview) {
        var a = document.createElement("a");
        a.href = window.JAYRAID.preview;
        a.rel = "noopener";
        a.textContent = " Open the preview →";
        say.appendChild(a);
      }
      bot.classList.remove("nod");
      void bot.offsetWidth;
      bot.classList.add("nod");
    });
    asks.appendChild(b);
  });

  bot.addEventListener("click", function () {
    if (root.classList.contains("hidden")) { root.classList.remove("hidden"); store("jr-helper", "on"); return; }
    if (!box.hidden && !asks.hidden) close(); else menu();
  });
  root.querySelector(".helper-close").addEventListener("click", close);
  root.querySelector(".helper-hide").addEventListener("click", function () {
    close();
    root.classList.add("hidden");
    store("jr-helper", "off");
  });
  if (store("jr-helper") === "off") root.classList.add("hidden");

  // Kurze Hinweise beim Scrollen.
  var seen = {}, timer;
  window.addEventListener("scroll", function () {
    if (!box.hidden || root.classList.contains("hidden")) return;
    Object.keys(hints).forEach(function (id) {
      var s = document.querySelector(id);
      if (seen[id] || !s) return;
      var r = s.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.5 && r.bottom > 0) {
        seen[id] = true;
        show(hints[id]);
        clearTimeout(timer);
        timer = setTimeout(function () { if (asks.hidden) close(); }, 6000);
      }
    });
  }, { passive: true });

  // Die Augen folgen der Maus.
  window.addEventListener("mousemove", function (e) {
    var r = bot.getBoundingClientRect();
    var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.4);
    var d = Math.max(1, Math.hypot(dx, dy));
    var x = dx / d * 2.4, y = dy / d * 2.4;
    pupils.forEach(function (p) { p.setAttribute("transform", "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ")"); });
  }, { passive: true });
})();
