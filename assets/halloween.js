// Halloween: nur am 31. Oktober (Schweizer Zeit) wird das Logo zum Kuerbis, in der
// Seitenleiste und im Browser-Tab. Sonst aendert sich nichts. Jedes Jahr wieder, am
// 1. November ist alles von selbst wie vorher. Gesicht und Stiel sind aus Sechsecken.
//
// Zum Pruefen: ?halloween (an jedem Tag zeigen), ?halloween=0 (auch am 31. nicht zeigen).
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  function today() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", month: "numeric", day: "numeric" }).formatToParts(new Date());
      var m = 0, d = 0;
      p.forEach(function (x) { if (x.type === "month") m = +x.value; if (x.type === "day") d = +x.value; });
      return [m, d];
    } catch (e) {
      var n = new Date();
      return [n.getMonth() + 1, n.getDate()];
    }
  }

  var q = new URLSearchParams(location.search), on;
  if (q.has("halloween")) on = q.get("halloween") !== "0";
  else { var t = today(); on = t[0] === 10 && t[1] === 31; }
  if (!on) return;
  document.documentElement.classList.add("halloween");

  function hx(x, y, r, fill) {
    var w = r * 0.866;
    return '<polygon fill="' + fill + '" points="' +
      [x, y - r, x + w, y - r / 2, x + w, y + r / 2, x, y + r, x - w, y + r / 2, x - w, y - r / 2].map(function (v) { return +v.toFixed(2); }).join(",") + '"/>';
  }
  // Zwei grosse Augen, eine kleine Nase, ein Grinsen mit Luecken als Zaehne, oben der Stiel.
  var CUT = "#1a0d04", STEM = "#5f8a3a";
  var face = hx(0, -38, 4.6, STEM) + hx(4, -45.5, 3.8, STEM) +
    hx(-12, -7, 7, CUT) + hx(12, -7, 7, CUT) + hx(0, 3.5, 3.6, CUT) +
    hx(-19, 6, 4.4, CUT) + hx(19, 6, 4.4, CUT);
  [-12, -4, 4, 12].forEach(function (x) { face += hx(x, 12, 4.4, CUT); });
  [-8, 8].forEach(function (x) { face += hx(x, 18.5, 4.4, CUT); });

  // Das Tab-Symbol: derselbe Kuerbis, als kleines Bild.
  var icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">' +
    hx(0, 0, 50, "#111112") + hx(0, 0, 40, "#784416") + hx(0, 0, 33, "#f08c1e") + face + '</svg>';
  var link = document.querySelector('link[rel="icon"]');
  if (link) link.href = "data:image/svg+xml," + encodeURIComponent(icon);

  function decorate() {
    document.querySelectorAll(".mark").forEach(function (m) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "hw-face");
      g.innerHTML = face;
      m.appendChild(g);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate);
  else decorate();
})();
