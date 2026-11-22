// Die Grossansicht der Galerie: ein Klick auf ein Vorschaubild zeigt es gross, Pfeiltasten blaettern, Esc schliesst.
// Ohne Skript fuehren die Vorschaubilder einfach zum grossen Bild.
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.gallery a'));
  if (!links.length) return;
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lb-close" type="button" aria-label="Close">×</button>' +
    '<button class="lb-prev" type="button" aria-label="Previous picture">‹</button>' +
    '<button class="lb-next" type="button" aria-label="Next picture">›</button>';
  document.body.appendChild(box);
  var img = box.querySelector('img'), cap = box.querySelector('figcaption'), at = 0, back = null;

  function show(i) {
    at = (i + links.length) % links.length;
    var thumb = links[at].querySelector('img');
    img.src = links[at].href;
    img.alt = thumb.alt;
    cap.textContent = thumb.alt + '  (' + (at + 1) + ' / ' + links.length + ')';
    // Das naechste Bild schon laden, damit das Blaettern sofort geht.
    new Image().src = links[(at + 1) % links.length].href;
  }
  function open(i) { back = document.activeElement; show(i); box.hidden = false; box.querySelector('.lb-close').focus(); }
  function close() { box.hidden = true; img.removeAttribute('src'); if (back) back.focus(); }

  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
  });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(at - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(at + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(at - 1);
    else if (e.key === 'ArrowRight') show(at + 1);
  });
})();
