// Liste der unbeantworteten Fragen (fragen.html). Das Passwort bleibt nur in diesem Tab.
(function () {
  "use strict";
  var url = ((window.JAYRAID || {}).bubblesLog || "").replace(/\/$/, "");
  var status = document.getElementById("status"), list = document.getElementById("list"), input = document.getElementById("token");
  function token() { try { return sessionStorage.getItem("jr-admin") || ""; } catch (e) { return ""; } }
  function remember(t) { try { sessionStorage.setItem("jr-admin", t); } catch (e) { /* nur fuer diesen Aufruf */ } }
  if (!url) { status.textContent = "In assets/config.js ist noch kein bubblesLog eingetragen."; return; }

  function load(t) {
    status.textContent = "Lade…";
    fetch(url + "/misses", { headers: { Authorization: "Bearer " + t }, cache: "no-store" })
      .then(function (r) { if (r.status === 401) throw new Error("Falsches Passwort."); if (!r.ok) throw new Error("Fehler " + r.status); return r.json(); })
      .then(function (d) {
        remember(t);
        show(d.misses || [], t);
      })
      .catch(function (e) { status.textContent = e.message; list.hidden = true; });
  }
  function show(items, t) {
    status.textContent = items.length ? items.length + " Fragen" : "Keine offenen Fragen. Bubbles weiss gerade alles.";
    list.textContent = "";
    list.hidden = !items.length;
    items.forEach(function (m) {
      var row = document.createElement("div");
      row.className = "admin-row";
      var n = document.createElement("b"); n.textContent = m.count + "×";
      var q = document.createElement("span"); q.textContent = m.q;
      var meta = document.createElement("span"); meta.className = "small";
      meta.textContent = m.lang.toUpperCase() + " · " + m.page + " · " + new Date(m.last).toLocaleDateString("de-DE");
      var done = document.createElement("button"); done.type = "button"; done.className = "button"; done.textContent = "Erledigt";
      done.addEventListener("click", function () {
        fetch(url + "/misses/" + m.id, { method: "DELETE", headers: { Authorization: "Bearer " + t } })
          .then(function (r) { if (r.ok) row.remove(); });
      });
      row.append(n, q, meta, done);
      list.appendChild(row);
    });
  }
  document.getElementById("login").addEventListener("submit", function (e) { e.preventDefault(); load(input.value.trim()); input.value = ""; });
  if (token()) load(token());
})();
