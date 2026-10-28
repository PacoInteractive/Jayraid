// Die Testseite (test.html): setzt den "schon gesehen"-Merker der Begruessung und oeffnet die Startseite.
(function () {
  "use strict";
  var SEEN = "jayraid-beta-begruessung";   // wie in welcome.js
  function set(v) { try { if (v) localStorage.setItem(SEEN, "1"); else localStorage.removeItem(SEEN); } catch (e) { /* privates Fenster */ } }
  function show() {
    var seen = false;
    try { seen = localStorage.getItem(SEEN) === "1"; } catch (e) { /* privates Fenster */ }
    document.getElementById("state").textContent = seen ? "schon gesehen" : "noch nicht gesehen";
  }
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.hasAttribute("data-reset")) set(false);
      if (b.hasAttribute("data-seen")) set(true);
      location.href = "index.html" + b.getAttribute("data-go");
    });
  });
  document.getElementById("reset").addEventListener("click", function () { set(false); show(); });
  show();
})();
