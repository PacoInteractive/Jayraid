// Jayraid website: the latest version from the signed version list and the tester places.
(function () {
  "use strict";

  // Bearbeitungsmodus: mit ?edit an der Adresse (assets/editor.js).
  if (/[?&]edit\b/.test(location.search)) {
    var ed = document.createElement("script");
    ed.src = "assets/editor.js";
    document.body.appendChild(ed);
  }

  // The latest version from the signed list (the same one the launcher reads).
  // The newest one goes big into NEWS, the ones before as rows like in the launcher.
  function split(v) {
    var t = v.neuEn || v.neu || "", i = t.indexOf(": ");
    return i > 0 && i < 50 ? [t.slice(0, i), t.slice(i + 2)] : ["", t];
  }
  fetch("update/blockwelt-versionen.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (list) {
      if (!list) return;
      var all = (list.versionen || []).slice().reverse();
      var v = all.filter(function (x) { return x.id === list.neueste; })[0];
      if (v && document.getElementById("news-name")) {
        var t = split(v);
        document.getElementById("news-name").textContent = v.nameEn || v.name;
        document.getElementById("news-date").textContent = v.datum + (t[0] ? ", " + t[0] : "");
        document.getElementById("news-text").textContent = t[1];
        document.getElementById("version").textContent = v.nameEn || v.name;
      }
      var rows = document.getElementById("versions");
      all.filter(function (x) { return x !== v; }).slice(0, 3).forEach(function (x) {
        if (!rows) return;
        var t = split(x), row = document.createElement("li");
        row.innerHTML = "<b></b> <span class=\"small\"></span><br>";
        row.children[0].textContent = x.nameEn || x.name;
        row.children[1].textContent = x.datum;
        row.appendChild(document.createTextNode((t[0] ? t[0] + ". " : "") + t[1]));
        rows.appendChild(row);
      });
    })
    .catch(function () { /* without the list the default text stays */ });

  // Discord link from config.js (empty: tab, banner and footer link disappear).
  var cfgLinks = window.JAYRAID || {};
  document.querySelectorAll("[data-discord]").forEach(function (a) {
    if (cfgLinks.discord) a.href = cfgLinks.discord;
    else a.hidden = true;
  });
  var band = document.getElementById("discord");
  if (band && !cfgLinks.discord) band.hidden = true;

  // ── The closed alpha: 50 tester places (Cloudflare Worker, see config.js) ──
  var cfg = window.JAYRAID || {};
  var api = (cfg.testerApi || "").replace(/\/$/, "");
  // Nur beim Testen auf diesem PC: ?api=http://localhost:8787 statt des echten Zaehlers.
  if (location.hostname === "localhost" && new URLSearchParams(location.search).get("api")) api = new URLSearchParams(location.search).get("api");
  var claim = document.getElementById("claim");
  if (!claim) return;
  // Kein Windows (Mac, Linux, Handy): den Hinweis beim Knopf hervorheben, damit niemand aus Versehen einen Platz nimmt.
  var osNote = document.getElementById("tester-os");
  if (osNote && !/Win/i.test(navigator.userAgent)) osNote.classList.add("warn");
  var countEl = document.getElementById("tester-count"), textEl = document.getElementById("tester-text");
  if (cfg.preview) document.getElementById("preview-link").href = cfg.preview;

  function showCells(total, free) {
    countEl.textContent = "So far " + (total - free) + " of " + total + " tester places are taken.";
  }

  function full(total) {
    showCells(total, 0);
    claim.disabled = true;
    textEl.textContent = "All " + total + " places are taken. Thanks to everyone who joined!";
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
    showCells(50, 50);
    countEl.textContent = "";
    claim.disabled = true;
    textEl.textContent = "The tester places open soon.";
  } else {
    fetch(api + "/stand", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (s) { if (s.frei <= 0) full(s.gesamt); else showCells(s.gesamt, s.frei); })
      .catch(function () { countEl.textContent = ""; });
    claim.addEventListener("click", function () {
      claim.disabled = true;
      fetch(api + "/platz", { method: "POST" })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (r.code) done(r);
          else if (r.fehler === "voll") full(r.gesamt || 50);
          else { claim.disabled = false; textEl.textContent = "Something went wrong. Please try again."; }
        })
        .catch(function () { claim.disabled = false; textEl.textContent = "No connection. Please try again in a moment."; });
    });
  }
})();
