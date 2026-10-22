// Bearbeitungsmodus der Website (index.html?edit oder changelog.html?edit).
// Texte anklicken und tippen, Bausteine verschieben, kopieren oder loeschen,
// Sechseck-Schriften, Links und Bilder per Doppelklick aendern. Gespeichert wird
// die Original-HTML-Datei (nicht das, was die Skripte daraus gemacht haben):
// als Download oder direkt auf GitHub (eigener Zugangsschluessel, nur im Browser).
(function () {
  "use strict";
  var REPO = "PacoInteractive/Jayraid", BRANCH = "main";
  var file = (location.pathname.split("/").pop() || "index.html");
  if (!/\.html$/.test(file)) file = "index.html";

  // Was Skripte zur Laufzeit fuellen: nicht bearbeitbar (kaeme sonst falsch in die Datei).
  var DYNAMIC = "#log, #versions, #tester-cells, #log-stats, .helper, [data-hex], script, svg";
  var FILLED = ["news-name", "news-date", "news-text", "version", "side-version", "tester-count", "tester-text", "log-empty"];
  // Bausteine, die sich verschieben, kopieren und loeschen lassen.
  var MOVABLE = [".content > section", "nav > a", ".features > .feature", ".steps > li", ".table > div",
    ".playbar > div", ".tester-buttons > a", ".log-filter > button", ".content > .play > *:not(.play-image):not(.hexes)"].join(", ");
  var INLINE = /^(B|I|EM|STRONG|CODE|KBD|A|BR|SPAN|SMALL)$/;

  var live2src = new Map(), changes = 0, original = "", srcDoc;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }

  // ── Leiste oben ───────────────────────────────────────────────────
  var bar = document.createElement("div");
  bar.className = "ed-bar";
  bar.innerHTML =
    '<b>EDIT MODE</b><span class="ed-file"></span><span class="ed-count">No changes</span>' +
    '<span class="ed-help">Click text to type · double click headings, links and pictures · hover a block to move it</span>' +
    '<span class="ed-space"></span>' +
    '<button type="button" data-a="download">Download file</button>' +
    '<button type="button" data-a="publish" class="ed-main">Publish to GitHub</button>' +
    '<button type="button" data-a="exit">Exit</button>';
  bar.querySelector(".ed-file").textContent = file;
  document.body.appendChild(bar);
  document.documentElement.classList.remove("anim");
  document.documentElement.classList.add("edit-mode");

  var tools = document.createElement("div");
  tools.className = "ed-tools";
  tools.innerHTML = '<button type="button" data-t="up" title="Move up / left">↑</button>' +
    '<button type="button" data-t="down" title="Move down / right">↓</button>' +
    '<button type="button" data-t="copy" title="Duplicate">⧉</button>' +
    '<button type="button" data-t="del" title="Delete">✕</button>';
  document.body.appendChild(tools);

  function changed() {
    changes++;
    bar.querySelector(".ed-count").textContent = changes + (changes === 1 ? " change" : " changes") + " · not saved";
    bar.classList.add("dirty");
  }
  function saved(text) {
    changes = 0;
    bar.querySelector(".ed-count").textContent = text;
    bar.classList.remove("dirty");
  }
  window.addEventListener("beforeunload", function (e) { if (changes) { e.preventDefault(); e.returnValue = ""; } });

  // ── Original laden und mit der Seite verknuepfen ─────────────────
  function path(el, root) {
    var p = [];
    while (el && el !== root) {
      p.unshift(Array.prototype.indexOf.call(el.parentNode.children, el));
      el = el.parentNode;
    }
    return p;
  }
  function follow(root, p) {
    var el = root;
    for (var i = 0; i < p.length && el; i++) el = el.children[p[i]];
    return el;
  }
  // Ordnet jedem Element der Originaldatei sein Gegenstueck auf der Seite zu.
  function bind(srcRoot, liveRoot) {
    live2src.set(liveRoot, srcRoot);
    srcRoot.querySelectorAll("*").forEach(function (s) {
      if (s.parentElement && s.parentElement.closest(DYNAMIC)) return;
      var l = follow(liveRoot, path(s, srcRoot));
      if (l && l.tagName === s.tagName) live2src.set(l, s);
    });
    makeEditable(liveRoot);
  }

  function isText(el) {
    if (FILLED.indexOf(el.id) >= 0 || el.closest(DYNAMIC) || !live2src.has(el)) return false;
    var direct = false;
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && n.textContent.trim()) direct = true;
      if (n.nodeType === 1 && (!INLINE.test(n.tagName) || n.matches("[data-hex]"))) return false;
    }
    return direct;
  }
  function makeEditable(root) {
    var list = [root].concat(Array.prototype.slice.call(root.querySelectorAll("p, h1, h2, h3, li, span, a, button, b, label, div, kbd")));
    list.forEach(function (el) {
      if (!el.closest || el.closest(".ed-bar, .ed-tools") || el.parentElement && el.parentElement.closest("[contenteditable]")) return;
      if (!isText(el)) return;
      el.setAttribute("contenteditable", "true");
      el.spellcheck = true;
    });
  }

  // ── Texte tippen ──────────────────────────────────────────────────
  document.addEventListener("input", function (e) {
    var el = e.target.closest && e.target.closest("[contenteditable]");
    if (!el || !live2src.has(el)) return;
    live2src.get(el).innerHTML = el.innerHTML;
    changed();
  });
  document.addEventListener("keydown", function (e) {
    if (e.target.isContentEditable && e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) document.execCommand("insertLineBreak");
    }
  });
  // Eingefuegt wird nur reiner Text, sonst landen fremde Formate in der Datei.
  document.addEventListener("paste", function (e) {
    if (!e.target.isContentEditable) return;
    e.preventDefault();
    document.execCommand("insertText", false, (e.clipboardData || window.clipboardData).getData("text/plain").replace(/\s*\n\s*/g, " "));
  });
  // Links und Knoepfe loesen im Bearbeitungsmodus nichts aus.
  document.addEventListener("click", function (e) {
    if (e.target.closest(".ed-bar, .ed-tools, .ed-dl")) return;
    var a = e.target.closest("a, button");
    if (a) e.preventDefault();
  }, true);

  // ── Doppelklick: Sechseck-Schrift, Link-Adresse, Bild ────────────
  document.addEventListener("dblclick", function (e) {
    if (e.target.closest(".ed-bar, .ed-tools")) return;
    var hex = e.target.closest("[data-hex]");
    if (hex && live2src.has(hex)) {
      var t = prompt("Text in the hexagon font:", hex.getAttribute("data-hex"));
      if (t === null || !t.trim()) return;
      t = t.toUpperCase();
      hex.setAttribute("data-hex", t);
      live2src.get(hex).setAttribute("data-hex", t);
      var lbl = hex.closest("[aria-label]");
      if (lbl && lbl !== hex && live2src.has(lbl) && lbl.matches("h1, h2")) { lbl.setAttribute("aria-label", t); live2src.get(lbl).setAttribute("aria-label", t); }
      hex.removeAttribute("aria-label");
      window.jayraidHex(hex);
      changed();
      return;
    }
    var link = e.target.closest("a[href]");
    if (link && live2src.has(link)) {
      var h = prompt("Link address:", live2src.get(link).getAttribute("href"));
      if (h === null) return;
      link.setAttribute("href", h);
      live2src.get(link).setAttribute("href", h);
      changed();
      return;
    }
    var pic = e.target.closest("[style*='background-image'], img");
    if (pic && live2src.has(pic)) {
      var s = live2src.get(pic), img = pic.tagName === "IMG";
      var cur = img ? s.getAttribute("src") : (s.getAttribute("style").match(/url\(['"]?([^'")]+)/) || [])[1];
      var u = prompt("Picture (path in the repository, e.g. images/bloodmoon.jpg):", cur || "");
      if (u === null || !u.trim()) return;
      if (img) { pic.src = u; s.setAttribute("src", u); }
      else {
        var st = s.getAttribute("style").replace(/url\([^)]*\)/, "url('" + u + "')");
        s.setAttribute("style", st);
        pic.style.backgroundImage = "url('" + u + "')";
      }
      changed();
    }
  });

  // ── Bausteine verschieben, kopieren, loeschen ────────────────────
  var current = null;
  document.addEventListener("mouseover", function (e) {
    if (e.target.closest(".ed-tools, .ed-bar")) return;
    var m = e.target.closest(MOVABLE);
    if (!m || !live2src.has(m)) return;
    if (current) current.classList.remove("ed-current");
    current = m;
    m.classList.add("ed-current");
    var r = m.getBoundingClientRect();
    tools.style.display = "flex";
    tools.style.top = Math.max(r.top + window.scrollY, window.scrollY + 52) + "px";
    tools.style.left = (r.right + window.scrollX - tools.offsetWidth) + "px";
  });
  // Nach dem Verschieben: jedes Element wieder auf eine eigene, eingerueckte Zeile.
  function tidy(parent) {
    var kids = Array.prototype.slice.call(parent.childNodes), ind = null, end = null;
    kids.forEach(function (n) {
      if (n.nodeType === 3 && !n.textContent.trim()) {
        var m = /\n[ \t]*$/.exec(n.textContent);
        if (m && n.nextSibling && ind === null) ind = m[0];
        if (m && !n.nextSibling) end = m[0];
        parent.removeChild(n);
      }
    });
    if (ind === null) return;
    Array.prototype.slice.call(parent.children).forEach(function (c) { parent.insertBefore(parent.ownerDocument.createTextNode(ind), c); });
    parent.appendChild(parent.ownerDocument.createTextNode(end || "\n"));
  }
  function sibling(el, dir) {
    var s = dir < 0 ? el.previousElementSibling : el.nextElementSibling;
    while (s && !(s.matches(MOVABLE) && live2src.has(s))) s = dir < 0 ? s.previousElementSibling : s.nextElementSibling;
    return s;
  }
  tools.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || !current) return;
    var el = current, src = live2src.get(el), t = b.getAttribute("data-t");
    if (t === "up" || t === "down") {
      var other = sibling(el, t === "up" ? -1 : 1);
      if (!other) return;
      var os = live2src.get(other);
      if (t === "up") { other.before(el); os.before(src); } else { other.after(el); os.after(src); }
      tidy(src.parentNode);
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else if (t === "copy") {
      var lc = el.cloneNode(true), sc = src.cloneNode(true);
      lc.classList.remove("ed-current");
      el.after(lc);
      src.after(sc);
      bind(sc, lc);
      tidy(src.parentNode);
    } else if (t === "del") {
      if (!confirm("Delete this block?")) return;
      el.remove();
      var parent = src.parentNode;
      src.remove();
      tidy(parent);
      tools.style.display = "none";
      current = null;
    }
    changed();
  });

  // ── Speichern ─────────────────────────────────────────────────────
  function html() {
    // Kleine Aufraeumarbeit, damit die Datei so bleibt, wie sie geschrieben ist.
    var doc = srcDoc.documentElement.outerHTML
      .replace(/ (hidden|download|data-shadow|disabled)=""/g, " $1")
      .replace(/><\/(polygon|circle|rect|ellipse|path)>/g, "/>")
      .replace(/^(<html[^>]*>)<head>/, "$1\n<head>")
      .replace(/\s*<\/body>\s*<\/html>\s*$/, "\n</body>\n</html>");
    var head = /^\s*<!doctype[^>]*>/i.exec(original);
    return (head ? head[0] : "<!doctype html>") + "\n" + doc + "\n";
  }
  function b64(text) { return btoa(unescape(encodeURIComponent(text))); }
  function unb64(text) { return decodeURIComponent(escape(atob(text.replace(/\s/g, "")))); }

  function download() {
    var a = document.createElement("a");
    a.className = "ed-dl";
    a.href = URL.createObjectURL(new Blob([html()], { type: "text/html" }));
    a.download = file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    saved("Downloaded " + file + ": upload it on GitHub to make it live");
  }

  function publish() {
    if (!changes && !confirm("There are no changes. Publish anyway?")) return;
    var token = store("jr-gh-token");
    if (!token) {
      token = prompt("GitHub access key (fine-grained token with Contents: Read and write, only for " + REPO + ").\n" +
        "Create one at github.com → Settings → Developer settings → Fine-grained tokens.\nIt is stored only in this browser.");
      if (!token) return;
      token = token.trim();
      store("jr-gh-token", token);
    }
    var msg = prompt("Short note for this change:", "Website: edited " + file + " in the browser");
    if (msg === null) return;
    var api = "https://api.github.com/repos/" + REPO + "/contents/" + file;
    var hdr = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" };
    bar.querySelector(".ed-count").textContent = "Publishing…";
    fetch(api + "?ref=" + BRANCH, { headers: hdr, cache: "no-store" })
      .then(function (r) {
        if (r.status === 401 || r.status === 403) { store("jr-gh-token", null); throw new Error("The access key was refused. Try again with a new key."); }
        if (!r.ok) throw new Error("GitHub answered " + r.status + ".");
        return r.json();
      })
      .then(function (cur) {
        // Wurde die Datei inzwischen anders geaendert? Dann nicht einfach ueberschreiben.
        if (unb64(cur.content) !== original &&
          !confirm(file + " was changed on GitHub after this page was loaded. Overwrite those changes?")) throw new Error("Not published.");
        return fetch(api, {
          method: "PUT", headers: hdr,
          body: JSON.stringify({ message: msg, content: b64(html()), sha: cur.sha, branch: BRANCH })
        });
      })
      .then(function (r) {
        if (r.status === 401 || r.status === 403) { store("jr-gh-token", null); throw new Error("The access key may not write to " + REPO + "."); }
        if (!r.ok) throw new Error("GitHub answered " + r.status + ".");
        original = html();
        saved("Published. The site updates in one or two minutes.");
      })
      .catch(function (err) {
        bar.querySelector(".ed-count").textContent = err.message;
        bar.classList.add("dirty");
      });
  }

  bar.addEventListener("click", function (e) {
    var a = e.target.getAttribute("data-a");
    if (a === "download") download();
    if (a === "publish") publish();
    if (a === "exit" && (!changes || confirm("Leave without saving?"))) { changes = 0; location.href = file; }
  });

  fetch(file, { cache: "no-store" })
    .then(function (r) { return r.text(); })
    .then(function (text) {
      original = text;
      srcDoc = new DOMParser().parseFromString(text, "text/html");
      bind(srcDoc.body, document.body);
    })
    .catch(function () { bar.querySelector(".ed-count").textContent = "Could not load " + file + ", editing is off."; });
})();
