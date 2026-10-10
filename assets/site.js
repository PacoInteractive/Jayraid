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
})();
