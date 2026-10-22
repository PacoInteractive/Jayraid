// Die Changelog-Seite: liest CHANGELOG.md (dieselbe Datei wie bisher) und baut
// daraus eine Zeitleiste nach Monaten, mit Filter und Suche.
(function () {
  "use strict";
  var box = document.getElementById("log");
  if (!box) return;
  var months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

  // "## Alpha 1.41.1 · 21.10.2026 · Jumping and swimming" und der Absatz darunter.
  function parse(md) {
    var out = [], parts = md.split(/^## /m).slice(1);
    parts.forEach(function (p) {
      var lines = p.split("\n"), head = lines[0].split("·").map(function (x) { return x.trim(); });
      var d = (head[1] || "").split(".");
      var text = lines.slice(1).join(" ").replace(/\s+/g, " ").trim();
      var nr = (head[0].match(/(\d+)\.(\d+)\.(\d+)/) || []);
      out.push({
        name: head[0], date: head[1] || "", title: head[2] || "",
        month: d.length === 3 ? months[+d[1] - 1] + " " + d[2] : "",
        fix: nr.length && +nr[3] > 0,
        text: text
      });
    });
    return out;
  }

  // "New: ... Fixed: ... Changed: ..." wird zu einzelnen Zeilen mit Etikett.
  function pieces(text) {
    var re = /(?:^|\s)(New|Changed|Fixed|Also):\s/g, marks = [], m;
    while ((m = re.exec(text))) marks.push({ label: m[1], at: m.index, start: re.lastIndex });
    if (!marks.length) return [{ label: "", text: text }];
    var out = [];
    if (marks[0].at > 0) out.push({ label: "", text: text.slice(0, marks[0].at).trim() });
    marks.forEach(function (k, i) {
      out.push({ label: k.label, text: text.slice(k.start, i + 1 < marks.length ? marks[i + 1].at : text.length).trim() });
    });
    return out;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function build(list) {
    box.textContent = "";
    var month = "", group;
    list.forEach(function (v, i) {
      if (v.month !== month) {
        month = v.month;
        var g = el("div", "log-month");
        g.appendChild(el("h2", "log-month-name", month));
        group = el("div", "log-entries");
        g.appendChild(group);
        box.appendChild(g);
      }
      var e = el("article", "log-entry" + (v.fix ? " fix" : "") + (i === 0 ? " latest" : ""));
      e.dataset.search = (v.name + " " + v.title + " " + v.text).toLowerCase();
      var head = el("div", "log-entry-head");
      head.appendChild(el("span", "log-name", v.name));
      if (i === 0) head.appendChild(el("span", "log-tag", "Latest"));
      else if (v.fix) head.appendChild(el("span", "log-tag dim", "Fix"));
      head.appendChild(el("span", "log-date", v.date));
      e.appendChild(head);
      if (v.title) e.appendChild(el("h3", "log-title", v.title));
      pieces(v.text).forEach(function (p) {
        var row = el("p", "log-line");
        if (p.label) row.appendChild(el("span", "log-label " + p.label.toLowerCase(), p.label));
        row.appendChild(document.createTextNode(p.label ? p.text.charAt(0).toUpperCase() + p.text.slice(1) : p.text));
        e.appendChild(row);
      });
      e.style.animationDelay = Math.min(i, 8) * 50 + "ms";
      group.appendChild(e);
    });

    // Kurz zusammengefasst ueber der Liste.
    var first = list[list.length - 1], stats = document.getElementById("log-stats");
    var content = list.filter(function (v) { return !v.fix; }).length;
    [[list.length, "versions"], [content, "content updates"], [list.length - content, "fixes"], [first ? first.date : "", "first version"]]
      .forEach(function (s) {
        var b = el("div", "log-stat");
        b.appendChild(el("b", "", String(s[0])));
        b.appendChild(el("span", "", s[1]));
        stats.appendChild(b);
      });
  }

  // Filter und Suche.
  var filter = "all", search = document.getElementById("log-search");
  function apply() {
    var q = search.value.trim().toLowerCase(), any = false;
    document.querySelectorAll(".log-month").forEach(function (g) {
      var shown = 0;
      g.querySelectorAll(".log-entry").forEach(function (e) {
        var fix = e.classList.contains("fix");
        var ok = (filter === "all" || (filter === "fix") === fix) && (!q || e.dataset.search.indexOf(q) >= 0);
        e.hidden = !ok;
        if (ok) shown++;
      });
      g.hidden = !shown;
      if (shown) any = true;
    });
    document.getElementById("log-empty").hidden = any;
  }
  document.querySelectorAll(".log-filter button").forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.dataset.filter;
      document.querySelectorAll(".log-filter button").forEach(function (x) { x.classList.toggle("on", x === b); });
      apply();
    });
  });
  search.addEventListener("input", apply);

  fetch("CHANGELOG.md", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(); return r.text(); })
    .then(function (md) { build(parse(md)); apply(); })
    .catch(function () {
      box.innerHTML = '<p class="small">The changelog could not be loaded. <a href="CHANGELOG.md">Open it as plain text</a>.</p>';
    });
})();
