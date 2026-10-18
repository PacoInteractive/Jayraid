// Jayraid website. Draws headings in the launcher's hexagon font (exactly like
// Look.HexText) and shows the latest version from the signed version list.
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  // Like Look.HexText, laid out by hexfont.js: small text snaps to whole pixels,
  // large text is drawn as hexagons (odd columns half a cell higher).
  function hexText(text, cap, shadow) {
    var m = window.hexFontMetrics(cap), cells = [], top = 0, bottom = m.cap;
    var pen = window.hexFontLayout(text, 0, 0, cap, function (x, y, w, h, snap) {
      cells.push([x, y, w, h, snap]);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y + h);
    });
    var off = shadow ? Math.max(1, Math.round(cap * 0.08)) : 0;
    var w = Math.max(1, pen - m.gap + off), h = bottom - top + off;
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
        var c = cells[k], x = c[0] + dx, y = c[1] + dx;
        if (c[4]) { d += "M" + x + " " + y + "h" + c[2] + "v" + c[3] + "h" + (-c[2]) + "Z"; continue; }
        var r = c[2] / 2 * 1.02, mx = x + c[2] / 2, my = y + c[3] / 2;
        for (var s = 0; s < 6; s++) {
          var a = s * Math.PI / 3;
          d += (s ? "L" : "M") + (mx + r * Math.cos(a)).toFixed(2) + " " + (my + r * Math.sin(a)).toFixed(2);
        }
        d += "Z";
      }
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", fill);
      if (m.snap) p.setAttribute("shape-rendering", "crispEdges");
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
  // Kein Windows (Mac, Linux, Handy): den Hinweis beim Knopf hervorheben, damit niemand aus Versehen einen Platz nimmt.
  var osNote = document.getElementById("tester-os");
  if (osNote && !/Win/i.test(navigator.userAgent)) osNote.classList.add("warn");
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
