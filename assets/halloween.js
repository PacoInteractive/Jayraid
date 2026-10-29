// Halloween: nur am 31. Oktober (Schweizer Zeit) zieht sich die Seite um. Jedes Jahr wieder,
// am 1. November ist alles von selbst wie vorher, es muss nichts zurueckgebaut werden.
// Laeuft schon im <head>, damit die Farben ab dem ersten Bild stimmen (Klasse "halloween"
// in site.css). Die Deko (Kuerbis-Logo, Spinne, Fledermaeuse, Hexenhut fuer Bubbles) kommt
// dazu, sobald die Seite da ist.
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

  window.JAYRAID_HALLOWEEN = true;
  document.documentElement.classList.add("halloween");

  function svg(cls, box, inner) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("class", cls);
    s.setAttribute("viewBox", box);
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = inner;
    return s;
  }

  // Eine Fledermaus, die Fluegel als eigene Gruppen, damit sie schlagen koennen.
  var BAT =
    '<g class="hw-wing hw-wing-l"><path d="M0 0 C-6 -10 -16 -12 -26 -8 C-22 -4 -21 1 -23 5 C-17 2 -12 4 -10 8 C-7 4 -3 3 0 4Z"/></g>' +
    '<g class="hw-wing hw-wing-r"><path d="M0 0 C6 -10 16 -12 26 -8 C22 -4 21 1 23 5 C17 2 12 4 10 8 C7 4 3 3 0 4Z"/></g>' +
    '<polygon points="0,-6 4,-3.5 4,3.5 0,6 -4,3.5 -4,-3.5"/><polygon points="-3.5,-5 -2,-9 -0.5,-5.5"/><polygon points="3.5,-5 2,-9 0.5,-5.5"/>';

  function decorate() {
    // Das Logo wird zum Kuerbis, auch Gesicht und Stiel ganz aus Sechsecken:
    // zwei grosse Augen, eine kleine Nase, der Mund als Grinsen mit Luecken als Zaehne.
    function hx(x, y, r, cls) {
      var w = r * 0.866;
      return '<polygon' + (cls ? ' class="' + cls + '"' : "") + ' points="' +
        [x, y - r, x + w, y - r / 2, x + w, y + r / 2, x, y + r, x - w, y + r / 2, x - w, y - r / 2].map(function (v) { return +v.toFixed(2); }).join(",") + '"/>';
    }
    var face = hx(0, -38, 4.6, "hw-stem") + hx(4, -45.5, 3.8, "hw-stem") +
      hx(-12, -7, 7) + hx(12, -7, 7) + hx(0, 3.5, 3.6) +
      hx(-19, 6, 4.4) + hx(19, 6, 4.4);
    [-12, -4, 4, 12].forEach(function (x) { face += hx(x, 12, 4.4); });
    [-8, 8].forEach(function (x) { face += hx(x, 18.5, 4.4); });
    document.querySelectorAll(".mark, .about-mark").forEach(function (m) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "hw-face");
      g.innerHTML = face;
      m.appendChild(g);
    });

    // Im Startbild: eine Spinne am Faden und drei Fledermaeuse vor dem Himmel.
    var hero = document.querySelector(".play, .log-hero");
    if (hero) {
      var spider = document.createElement("div");
      spider.className = "hw-spider";
      spider.setAttribute("aria-hidden", "true");
      spider.appendChild(svg("hw-spider-body", "-30 -24 60 48",
        '<g class="hw-legs"><path d="M-8 -4 L-18 -14 L-26 -6 M-8 0 L-20 -4 L-28 4 M-8 4 L-20 6 L-26 16 M-6 7 L-14 14 L-18 22' +
        ' M8 -4 L18 -14 L26 -6 M8 0 L20 -4 L28 4 M8 4 L20 6 L26 16 M6 7 L14 14 L18 22"/></g>' +
        '<polygon class="hw-body" points="0,-14 11,-7.5 11,7.5 0,14 -11,7.5 -11,-7.5"/>' +
        '<circle class="hw-eye" cx="-4" cy="-4" r="2.2"/><circle class="hw-eye" cx="4" cy="-4" r="2.2"/>'));
      hero.appendChild(spider);

      var bats = document.createElement("div");
      bats.className = "hw-bats";
      bats.setAttribute("aria-hidden", "true");
      for (var i = 0; i < 3; i++) bats.appendChild(svg("hw-bat", "-28 -14 56 28", BAT));
      hero.appendChild(bats);

      var text = hero.querySelector(".play-text, .log-hero-text"), h1 = text && text.querySelector("h1");
      if (h1) {
        var label = document.createElement("span");
        label.className = "hw-label";
        label.setAttribute("data-hex", "HAPPY HALLOWEEN");
        label.setAttribute("data-cap", "13");
        text.insertBefore(label, h1);
        if (window.jayraidHex) window.jayraidHex(label);
      }
    }

    // Ein Spinnennetz oben in der Ecke der Seitenleiste.
    var side = document.querySelector(".side");
    if (side) side.appendChild(svg("hw-web", "0 0 100 100",
      '<path d="M100 0 L0 0 M100 0 L18 52 M100 0 L52 82 M100 0 L100 100' +
      ' M78 0 Q82 10 86 14 Q92 18 100 22 M56 0 Q63 19 72 28 Q83 37 100 44 M34 0 Q44 28 58 42 Q74 56 100 66 M14 0 Q26 37 44 56 Q66 74 100 88"/>'));

    // Bubbles setzt sich einen Hexenhut auf (die Lampe darf so lange Pause machen).
    var diver = document.querySelector(".helper-bot .diver");
    if (diver) {
      var hat = document.createElementNS(NS, "g");
      hat.setAttribute("class", "hw-hat");
      hat.innerHTML =
        '<path class="hw-hat-cone" d="M36 24 C44 6 56 -18 74 -34 C72 -26 70 -20 72 -14 C76 0 82 12 86 24Z"/>' +
        '<path class="hw-hat-band" d="M38.5 18 C52 14 70 14 83.5 18 L85.5 23.5 C70 19.5 52 19.5 36.5 23.5Z"/>' +
        '<ellipse class="hw-hat-brim" cx="61" cy="25" rx="42" ry="7"/>';
      diver.appendChild(hat);
    }

    var foot = document.querySelector("footer .small");
    if (foot) {
      var p = document.createElement("p");
      p.className = "small hw-foot";
      p.textContent = "Happy Halloween from Switzerland.";
      foot.parentNode.insertBefore(p, foot.nextSibling);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate);
  else decorate();
})();
