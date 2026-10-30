// Die Changelog-Seite: liest CHANGELOG.md und zeigt jede Version mit ihrem Absatz.
(function () {
  "use strict";
  var box = document.getElementById("log");
  if (!box) return;

  // "## Beta 1.0.1 · 29.10.2026 · Starts on every graphics card" und der Absatz darunter.
  function build(md) {
    box.textContent = "";
    md.split(/^## /m).slice(1).forEach(function (p) {
      var lines = p.split("\n");
      var h = document.createElement("h3"), name = document.createElement("span");
      name.setAttribute("data-hex", "13");
      name.textContent = lines[0].trim();
      h.appendChild(name);
      if (window.jayraidHex) window.jayraidHex(name);
      var t = document.createElement("p");
      t.textContent = lines.slice(1).join(" ").replace(/\s+/g, " ").trim();
      box.appendChild(h);
      box.appendChild(t);
    });
  }

  fetch("CHANGELOG.md", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(); return r.text(); })
    .then(build)
    .catch(function () {
      box.innerHTML = '<p class="small">The changelog could not be loaded. <a href="CHANGELOG.md">Open it as plain text</a>.</p>';
    });
})();
