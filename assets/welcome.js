// Der Start der Beta: ein Countdown im Startbild, der zur Startzeit nahtlos in
// die Begruessung uebergeht, dieselbe wie im Launcher (Welcome.cs, Zeile fuer
// Zeile uebertragen). Wer spaeter kommt (am Abend oder Tage danach), sieht sie
// beim ersten Besuch auch; danach gibt es einen Knopf zum Wiederansehen.
//
// Nach der Begruessung leuchtet die Seite einige Sekunden in Regenbogenfarben
// (Klasse "rainbow" in site.css) und kehrt dann zu ihren eigenen Farben zurueck.
//
// Zum Pruefen: ?countdown=10 (Start in 10 Sekunden), ?begruessung (sofort zeigen),
// ?regenbogen (nur den Regenbogen).
(function () {
  "use strict";

  // 28.10.2026, 21:00 in der Schweiz. Am 28. Oktober gilt schon die Winterzeit (MEZ, UTC+1).
  var LAUNCH = Date.UTC(2026, 9, 28, 20, 0, 0);
  var LAUNCH_TEXT = "28.10.2026  ·  21:00";
  var SEEN = "jayraid-beta-begruessung";

  var q = new URLSearchParams(location.search);
  if (q.get("countdown")) LAUNCH = Date.now() + parseFloat(q.get("countdown")) * 1000;

  // ── Das Bild (wie Welcome.Render) ─────────────────────────────────────

  var Suit = [17, 17, 18], Orange = [240, 140, 30], Ink = [237, 244, 232], Dim = [170, 176, 170],
      Edge = [70, 70, 74], Flash = [255, 236, 200], EmberC = [255, 196, 92];
  var Presents = 2.4, TitleIn = 5.8, TitleUp = 9.6, Speech = 10.8, SlideLength = 5.6;

  function slides(evening) {
    return [
      [evening ? "Tonight, Jayraid leaves the alpha." : "Jayraid has left the alpha.", "Before you play, one thing has to be said."],
      ["To everyone who claimed a tester place:", "you found the crashes, the stutter", "and everything that was simply boring."],
      ["You were there for the blood moon, the bell,", "the golem and the deep.", "Every version got better because of you."],
      ["Thank you. Really.", "This beta belongs to you as much as to me."],
      ["The islands are waiting.", "– Paco Interactive"]
    ];
  }
  var ENDING = Speech + 5 * SlideLength + 0.4, LENGTH = ENDING + 9;

  function c01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smooth(v) { v = c01(v); return v * v * (3 - 2 * v); }
  function easeOutBack(v) { v = c01(v) - 1; return 1 + v * v * (2.7 * v + 1.7); }
  function span(t, a, b, fi, fo) { return Math.min(smooth((t - a) / fi), 1 - smooth((t - b) / fo)); }
  function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k | 0, a[1] + (b[1] - a[1]) * k | 0, a[2] + (b[2] - a[2]) * k | 0]; }
  function css(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a === undefined ? 1 : c01(a)) + ")"; }
  function hash(i, salt) {
    var h = (Math.imul(i, 374761393) + Math.imul(salt, 668265263)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) & 0xFFFFFF) / 16777216;
  }
  function width(text, cap) { return window.hexFontLayout(text, 0, 0, cap, null); }

  function fillHex(g, colour, cx, cy, r, pointy) {
    g.fillStyle = colour;
    g.beginPath();
    for (var k = 0; k < 6; k++) {
      var a = (k * 60 + (pointy ? 30 : 0)) * Math.PI / 180;
      if (k) g.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); else g.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    g.closePath();
    g.fill();
  }

  // Eine Zeile, die sich Zelle fuer Zelle von links aufbaut (wie Welcome.Build).
  function build(g, text, cx, y, cap, colour, t, start, duration, alpha, maxW) {
    if (alpha <= 0 || t < start) return;
    var w = width(text, cap);
    if (maxW && w > maxW) { cap *= maxW / w; w = maxW; }
    var left = cx - w / 2;
    window.hexFontLayout(text, left, y, cap, function (x, yy, cw, ch, snap) {
      var k = c01((t - start - (x - left) / w * duration * 0.75) / (duration * 0.25));
      if (k <= 0) return;
      var c = css(mix(Flash, colour, smooth(k * 1.4 - 0.4)), alpha * Math.min(1, k * 2));
      if (snap) { g.fillStyle = c; g.fillRect(x, yy, cw, ch); }
      else fillHex(g, c, x + cw / 2, yy + ch / 2, cw / 2 * 1.02 * easeOutBack(k), false);
    });
  }

  // Das Zeichen, wie Look.LogoMark: Taucherhelm als Sechseck.
  function logoMark(g, cx, cy, r) {
    function hx(rr, from, count, centre, fill) {
      g.beginPath();
      var first = true;
      function pt(x, y) { if (first) g.moveTo(x, y); else g.lineTo(x, y); first = false; }
      if (centre) pt(cx, cy);
      for (var k = from; k < from + count; k++) {
        var a = ((k % 6) * 60 + 30) * Math.PI / 180;
        pt(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
      }
      g.closePath();
      g.fillStyle = css(fill);
      g.fill();
    }
    hx(r, 0, 6, false, [17, 17, 18]);
    hx(r * 0.8, 0, 6, false, [120, 68, 22]);
    hx(r * 0.66, 0, 6, false, Orange);
    hx(r * 0.66, 3, 3, true, [255, 176, 74]);
    hx(r * 0.3, 0, 6, false, [232, 128, 22]);
  }

  function render(g, W, H, t, evening) {
    g.fillStyle = css(Suit);
    g.fillRect(0, 0, W, H);
    // Auf dem Handy (hochkant) richtet sich die Groesse nach der Breite.
    var s = Math.min(H / 720, W / 760), cx = W / 2, cy = H / 2, end = ENDING, list = slides(evening);

    var R = 30 * s, dx = Math.sqrt(3) * R, dy = 1.5 * R, reach = Math.sqrt(cx * cx + cy * cy);
    var front1 = (t - 0.2) * 0.5, front2 = (t - end) * 0.6;
    for (var row = -1; row * dy < H + R; row++)
      for (var col = -1; col * dx < W + dx; col++) {
        var x = col * dx + (row & 1) * dx / 2, y = row * dy, d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / reach;
        var shown = c01((front1 - d) * 5);
        if (shown <= 0) continue;
        var id = row * 1000 + col;
        var glow = Math.exp(-Math.pow((d - front1) * 9, 2)) + (t > end ? 0.8 * Math.exp(-Math.pow((d - front2) * 7, 2)) : 0);
        var twinkle = Math.pow(Math.max(0, Math.sin(t * (0.4 + hash(id, 3) * 0.5) + hash(id, 4) * 40)), 40) * 0.22 * smooth(d * 2.4 - 0.3);
        var base = mix(Suit, [34, 34, 37], (1 - 0.75 * d) * shown);
        fillHex(g, css(mix(base, Orange, c01((glow * 0.85 + twinkle) * (1 - 0.55 * d) * shown))), x, y, R * 0.9, true);
      }

    var embers = smooth((t - 1.5) / 2) * (t > end ? 1.6 : 1);
    if (embers > 0)
      for (var i = 0; i < 70; i++) {
        var period = 7 + hash(i, 1) * 7, phase = (t / period + hash(i, 2)) % 1;
        fillHex(g, css(mix(Orange, EmberC, hash(i, 6)), Math.sin(phase * Math.PI) * 0.55 * Math.min(1, embers)),
          hash(i, 5) * W + Math.sin(t * 0.7 + i) * 18 * s, H * (1.05 - phase * 1.15), (1.6 + hash(i, 7) * 3) * s, false);
      }

    var intro = span(t, 0.8, 5.0, 0.01, 0.6);
    if (intro > 0) {
      var r = 62 * s * easeOutBack((t - 0.8) / 1.4);
      if (r > 0) logoMark(g, cx, cy - 40 * s, r);
      if (intro < 1 && t > 4) fillHex(g, css(Suit, 1 - intro), cx, cy - 40 * s, 64 * s, true);
      build(g, "PACO INTERACTIVE", cx, cy + 50 * s, 18 * s, Ink, t, Presents, 1.0, intro);
      build(g, "PRESENTS", cx, cy + 82 * s, 12 * s, Dim, t, Presents + 0.7, 0.7, intro);
    }

    var up = smooth((t - TitleUp) / 0.8), ta = 1 - smooth((t - end) / 0.6);
    if (t > TitleIn && ta > 0) {
      var cap = (84 + (34 - 84) * up) * s, ty = (cy - 70 * s) + (60 * s - (cy - 70 * s)) * up, half = width("JAYRAID", cap) / 2;
      build(g, "JAY", cx - half + width("JAY", cap) / 2, ty, cap, Ink, t, TitleIn, 0.75, ta);
      build(g, "RAID", cx + half - width("RAID", cap) / 2, ty, cap, Orange, t, TitleIn + 0.6, 0.9, ta);
      var subCap = (22 + (12 - 22) * up) * s, subY = ty + cap + (26 + (14 - 26) * up) * s;
      build(g, "CLOSED BETA", cx, subY, subCap, Orange, t, TitleIn + 1.5, 0.9, ta);
      build(g, LAUNCH_TEXT, cx, subY + 38 * s, 13 * s, Dim, t, TitleIn + 2.1, 0.8, Math.min(ta, 1 - up));
      if (up > 0) {
        var lw = 160 * s * up;
        g.fillStyle = css(Edge, up * ta);
        g.fillRect(cx - lw, subY + subCap + 18 * s, 2 * lw, Math.max(1, s));
      }
    }

    for (var n = 0; n < list.length; n++) {
      var s0 = Speech + n * SlideLength;
      if (t < s0 || t > s0 + SlideLength) continue;
      var alpha = 1 - smooth((t - (s0 + SlideLength - 0.6)) / 0.6), lines = list[n];
      var lc = 25 * s, gap = 54 * s, top = cy + 40 * s - (lines.length - 1) * gap / 2 - lc / 2;
      for (var j = 0; j < lines.length; j++) {
        var sig = lines[j].charAt(0) === "–";
        build(g, lines[j], cx, top + j * gap, sig ? lc * 0.8 : lc, sig ? Orange : Ink, t, s0 + 0.2 + j * 0.55, 1.1, alpha, W * 0.88);
      }
    }

    if (t > end) {
      build(g, "WELCOME TO THE BETA", cx, cy - 46 * s, 44 * s, Ink, t, end + 0.4, 1.3, 1, W * 0.9);
      build(g, "HAVE FUN.", cx, cy + 26 * s, 20 * s, Orange, t, end + 1.9, 0.9, 1, W * 0.8);
      var blink = smooth((t - end - 3.6) / 0.5) * (0.75 + 0.25 * Math.sin((t - end) * 3));
      if (blink > 0) build(g, "CLICK TO CONTINUE", cx, H - 70 * s, 13 * s, Dim, t, end + 3.6, 0.01, blink);
    }
  }

  // ── Der Regenbogen danach ─────────────────────────────────────────────

  var RAINBOW = 11000, rainbowTimer = 0;
  function rainbow() {
    var root = document.documentElement;
    root.classList.remove("rainbow");
    void root.offsetWidth;   // neu anstossen, falls er noch laeuft
    root.classList.add("rainbow");
    clearTimeout(rainbowTimer);
    rainbowTimer = setTimeout(function () { root.classList.remove("rainbow"); }, RAINBOW);
  }

  // ── Die Begruessung als Vollbild ──────────────────────────────────────

  var playing = false;
  function play(evening) {
    if (playing) return;
    playing = true;
    try { localStorage.setItem(SEEN, "1"); } catch (e) { /* privates Fenster: dann eben beim naechsten Mal wieder */ }
    var box = document.createElement("div");
    box.className = "welcome";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Welcome to the Jayraid beta");
    var canvas = document.createElement("canvas");
    var skip = document.createElement("button");
    skip.type = "button";
    skip.className = "welcome-skip";
    skip.setAttribute("aria-label", "Skip");
    var skipText = document.createElement("span");
    // Auf dem Handy gibt es kein Esc.
    skipText.setAttribute("data-hex", matchMedia("(pointer: coarse)").matches ? "SKIP" : "ESC  SKIP");
    skipText.setAttribute("data-cap", "10");
    skip.appendChild(skipText);
    // Die Piano-Musik zur Rede (dieselbe wie im Launcher). Blockiert der Browser den Ton,
    // weil noch niemand auf die Seite geklickt hat, gibt es oben rechts SOUND ON.
    var music = new Audio("assets/begruessung.mp3"), sound = document.createElement("button");
    sound.type = "button";
    sound.className = "welcome-sound";
    sound.hidden = true;
    var soundText = document.createElement("span");
    soundText.setAttribute("data-hex", "SOUND ON");
    soundText.setAttribute("data-cap", "10");
    sound.appendChild(soundText);
    box.appendChild(canvas);
    box.appendChild(skip);
    box.appendChild(sound);
    document.body.appendChild(box);
    window.jayraidHex(skipText);
    window.jayraidHex(soundText);
    document.documentElement.classList.add("welcome-on");
    var g = canvas.getContext("2d"), start = performance.now(), done = false, raf = 0;

    function size() {
      // Schmale Fenster ohne Retina (unter ~800 Pixel) zeichnen feiner, sonst ist die
      // kleinste Schrift breiter als das Bild und die langen Zeilen werden abgeschnitten.
      var ratio = Math.max(Math.min(2, window.devicePixelRatio || 1), Math.min(2, 800 / innerWidth));
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
    }
    function close() {
      if (done) return;
      done = true;
      box.classList.add("out");
      fadeMusic();
      document.removeEventListener("keydown", key);
      removeEventListener("resize", size);
      setTimeout(function () {
        cancelAnimationFrame(raf);
        box.remove();
        document.documentElement.classList.remove("welcome-on");
        playing = false;
        rainbow();
      }, 700);
    }
    function key(e) {
      var t = (performance.now() - start) / 1000;
      if (e.key === "Escape" || (t > ENDING + 1.5 && (e.key === "Enter" || e.key === " "))) { e.preventDefault(); close(); }
    }
    function frame(now) {
      var t = (now - start) / 1000;
      render(g, canvas.width, canvas.height, t, evening);
      skip.hidden = t > ENDING;
      if (t > LENGTH) close();
      if (!done) raf = requestAnimationFrame(frame);
    }
    function fadeMusic() {
      var v = music.volume, step = setInterval(function () {
        v = Math.max(0, v - 0.08);
        music.volume = v;
        if (v <= 0) { clearInterval(step); music.pause(); }
      }, 50);
    }
    music.play().catch(function () { sound.hidden = false; });
    sound.addEventListener("click", function (e) {
      e.stopPropagation();
      // Spaet eingeschaltet: dort weitermachen, wo das Bild gerade ist.
      music.currentTime = Math.min(music.duration || 1e9, (performance.now() - start) / 1000);
      music.play().then(function () { sound.hidden = true; }).catch(function () {});
    });
    size();
    addEventListener("resize", size);
    document.addEventListener("keydown", key);
    skip.addEventListener("click", function (e) { e.stopPropagation(); close(); });
    // Mitten in der Rede nicht aus Versehen wegklicken; dafuer gibt es SKIP und Esc.
    box.addEventListener("click", function () { if ((performance.now() - start) / 1000 > ENDING + 1.5) close(); });
    raf = requestAnimationFrame(frame);
    skip.focus();
  }

  // ── Der Countdown ─────────────────────────────────────────────────────

  var el = document.getElementById("launch");
  if (!el) return;
  var digits = el.querySelector(".launch-digits"), units = el.querySelector(".launch-units");
  var label = document.getElementById("tester-label");
  var offset = 0, last = "", timer = 0;

  function now() { return Date.now() + offset; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  // Noch der Abend des Starts? Dann heisst es "tonight" (Schweizer Zeit bis 24:00, also 3 Stunden).
  function evening() { return now() < LAUNCH + 3 * 3600 * 1000; }
  function seen() { try { return localStorage.getItem(SEEN) === "1"; } catch (e) { return false; } }

  function opened(greet) {
    el.hidden = false;
    el.classList.add("open");
    var head = el.querySelector(".launch-label");
    head.setAttribute("data-hex", "THE BETA IS OPEN");
    window.jayraidHex(head);
    if (label) { label.setAttribute("data-hex", "CLOSED BETA"); window.jayraidHex(label); }
    if (greet) play(evening());
  }

  function tick() {
    var left = Math.max(0, Math.ceil((LAUNCH - now()) / 1000));
    if (left <= 0) {
      clearInterval(timer);
      opened(!seen());
      return;
    }
    var d = Math.floor(left / 86400), h = Math.floor(left / 3600) % 24, m = Math.floor(left / 60) % 60, sec = left % 60;
    var text = (d ? pad(d) + ":" : "") + pad(h) + ":" + pad(m) + ":" + pad(sec);
    if (text === last) return;
    last = text;
    digits.setAttribute("data-hex", text);
    window.jayraidHex(digits);
    digits.setAttribute("aria-label", (d ? d + " days " : "") + h + " hours " + m + " minutes " + sec + " seconds");
    units.textContent = d ? "days · hours · minutes · seconds" : "hours · minutes · seconds";
  }

  el.querySelector(".launch-replay").addEventListener("click", function () { play(evening()); });
  if (q.has("begruessung")) play(evening());
  if (q.has("regenbogen")) rainbow();

  if (now() >= LAUNCH) opened(!seen());
  else {
    el.hidden = false;
    tick();
    timer = setInterval(tick, 250);
    // Die Uhr des Besuchers kann falsch gehen: die Zeit des Servers (Kopfzeile Date) gilt.
    fetch(location.pathname, { method: "HEAD", cache: "no-store" })
      .then(function (r) {
        var server = Date.parse(r.headers.get("Date") || "");
        if (!isNaN(server) && Math.abs(server - Date.now()) > 2000) { offset = server - Date.now(); tick(); }
      })
      .catch(function () { /* dann eben die eigene Uhr */ });
  }
})();
