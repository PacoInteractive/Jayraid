// Jayraid – website. Draws headings in the launcher's hexagon font (exactly like
// Look.HexText) and shows the latest version from the signed version list.
(function () {
  "use strict";
  var SQRT3 = Math.sqrt(3), NS = "http://www.w3.org/2000/svg";

  function glyph(ch) {
    var f = window.HEXFONT || {};
    return f[ch] || f[ch.toUpperCase()] || null;
  }

  // Like Look.HexText: every set cell is a hexagon, odd columns sit half a cell higher.
  function hexText(text, cap, shadow) {
    var r = cap / (7 * SQRT3), colStep = 1.5 * r, rowStep = SQRT3 * r, gap = r * 0.9;
    var cells = [], pen = 0, top = 0, bottom = 7 * rowStep;
    for (var n = 0; n < text.length; n++) {
      var g = glyph(text[n]);
      if (!g || text[n] === " ") { pen += (g ? g[1] : 3) * colStep + gap; continue; }
      var rows = g[2];
      for (var i = 0; i < rows.length; i++)
        for (var c = 0; c < rows[i].length; c++) {
          if (rows[i][c] !== "#") continue;
          var cx = pen + c * colStep + r;
          var cy = (i + g[0]) * rowStep + rowStep / 2 - (c & 1) * (rowStep / 2);
          cells.push([cx, cy]);
          top = Math.min(top, cy - rowStep / 2);
          bottom = Math.max(bottom, cy + rowStep / 2);
        }
      pen += g[1] * colStep + gap;
    }
    var off = shadow ? Math.max(1, cap * 0.08) : 0;
    var w = Math.max(1, pen - gap + off), h = bottom - top + off;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 " + top.toFixed(2) + " " + w.toFixed(2) + " " + h.toFixed(2));
    svg.setAttribute("width", w.toFixed(1));
    svg.setAttribute("height", h.toFixed(1));
    svg.setAttribute("aria-hidden", "true");
    svg.style.maxWidth = "100%";
    svg.style.height = "auto";
    function layer(dx, fill) {
      var d = "";
      for (var k = 0; k < cells.length; k++) {
        var x = cells[k][0] + dx, y = cells[k][1] + dx;
        for (var s = 0; s < 6; s++) {
          var a = s * Math.PI / 3;
          d += (s ? "L" : "M") + (x + r * 1.02 * Math.cos(a)).toFixed(2) + " " + (y + r * 1.02 * Math.sin(a)).toFixed(2);
        }
        d += "Z";
      }
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", fill);
      svg.appendChild(p);
    }
    if (shadow) layer(off, "rgba(8,8,8,.75)");
    layer(0, "currentColor");
    return svg;
  }

  function render(el) {
    var text = el.getAttribute("data-hex");
    el.textContent = "";
    el.appendChild(hexText(text, parseFloat(el.getAttribute("data-cap")) || 16, el.hasAttribute("data-shadow")));
    if (!el.closest("[aria-label]")) el.setAttribute("aria-label", text);
    el.setAttribute("role", "img");
  }

  document.querySelectorAll("[data-hex]").forEach(render);

  // The latest version from the signed list (the same one the launcher reads).
  function mb(b) { return (b / 1024 / 1024).toFixed(1) + " MB"; }
  fetch("update/blockwelt-versionen.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (list) {
      if (!list) return;
      var v = (list.versionen || []).filter(function (x) { return x.id === list.neueste; })[0];
      var l = list.launcher;
      if (v) {
        document.getElementById("news-name").textContent = v.nameEn || v.name;
        document.getElementById("news-date").textContent = v.datum;
        document.getElementById("news-text").textContent = v.neuEn || v.neu;
      }
      var parts = [];
      if (v) parts.push("Game " + (v.nameEn || v.name));
      if (l) parts.push("Launcher " + l.version + " · " + mb(l.groesse));
      parts.push("Windows 10/11");
      document.getElementById("version").textContent = parts.join(" · ");
    })
    .catch(function () { /* without the list the default text stays */ });

  // ── The closed alpha: 20 tester places (Cloudflare Worker, see config.js) ──
  var cfg = window.JAYRAID || {};
  var api = (cfg.testerApi || "").replace(/\/$/, "");
  // Nur beim Testen auf diesem PC: ?api=http://localhost:8787 statt des echten Zaehlers.
  if (location.hostname === "localhost" && new URLSearchParams(location.search).get("api")) api = new URLSearchParams(location.search).get("api");
  var claim = document.getElementById("claim"), cells = document.getElementById("tester-cells");
  var countEl = document.getElementById("tester-count"), textEl = document.getElementById("tester-text");
  if (cfg.preview) {
    document.getElementById("preview-link").href = cfg.preview;
    document.getElementById("preview").hidden = false;
  }

  function showCells(total, free) {
    cells.textContent = "";
    for (var i = 0; i < total; i++) {
      var c = document.createElement("i");
      if (i < total - free) c.className = "taken";
      cells.appendChild(c);
    }
    countEl.textContent = free + " of " + total + " tester places left";
  }

  function full(total) {
    showCells(total, 0);
    claim.disabled = true;
    claim.classList.add("off");
    textEl.textContent = "All " + total + " tester places are taken. Thank you! The browser preview is open for everyone.";
    document.getElementById("preview").hidden = !cfg.preview;
  }

  function done(r) {
    showCells(r.gesamt, Math.max(0, r.gesamt - r.nr));
    document.getElementById("done-nr").textContent = "#" + r.nr;
    document.getElementById("done-code").textContent = r.code;
    var file = document.getElementById("done-file");
    file.href = URL.createObjectURL(new Blob([r.datei], { type: "text/plain" }));
    claim.hidden = true;
    textEl.hidden = true;
    document.getElementById("tester-done").hidden = false;
    // Gleich beides: erst die Code-Datei, dann den Launcher.
    file.click();
    setTimeout(function () { document.getElementById("done-launcher").click(); }, 700);
  }

  if (!api) {
    // Noch kein Zaehler eingerichtet: die Plaetze sind noch nicht offen.
    showCells(20, 20);
    countEl.textContent = "20 tester places";
    claim.disabled = true;
    claim.classList.add("off");
    textEl.textContent = "The tester places open soon. Follow the project to be among the first 20.";
  } else {
    fetch(api + "/stand", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (s) { if (s.frei <= 0) full(s.gesamt); else showCells(s.gesamt, s.frei); })
      .catch(function () { countEl.textContent = "Tester places: no connection right now"; });
    claim.addEventListener("click", function () {
      claim.disabled = true;
      fetch(api + "/platz", { method: "POST" })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (r.code) done(r);
          else if (r.fehler === "voll") full(r.gesamt || 20);
          else { claim.disabled = false; textEl.textContent = "Something went wrong. Please try again."; }
        })
        .catch(function () { claim.disabled = false; textEl.textContent = "No connection. Please try again in a moment."; });
    });
  }
})();
