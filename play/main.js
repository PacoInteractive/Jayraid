// Jayraid im Browser: Seite, Eingabe und Bildschleife. Das Spiel selbst ist
// C# (WebAssembly); hier wird es geladen, jedes Bild angestossen und mit
// Tasten und Maus versorgt.

import * as gl from './gl.js';
import * as al from './al.js';

const canvas = document.getElementById('spiel');
let api = null, running = false, wantLock = false;

// Die Leinwand rechnet in echten Pixeln, hoechstens 1,5-fach (sonst wird es auf
// hochaufloesenden Bildschirmen zaeh); die Maus wird in diese Pixel umgerechnet.
const scale = () => Math.min(window.devicePixelRatio || 1, 1.5);
function fit() {
    const w = Math.max(1, Math.round(canvas.clientWidth * scale()));
    const h = Math.max(1, Math.round(canvas.clientHeight * scale()));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
}

// ── Fuer das Spiel (WebProgram, Shim/Windowing.cs) ──────────────────────
export function width() { fit(); return canvas.width; }
export function height() { fit(); return canvas.height; }
export function setTitle(t) { document.title = t; }
export function setPointerLock(on) {
    wantLock = on;
    if (on && document.pointerLockElement !== canvas) {
        // Die gewoehnliche Sperre, mit der Mausgeschwindigkeit von Windows. (unadjustedMovement
        // lieferte rohe Zaehlwerte: bei Maeusen mit hoher DPI war das Umsehen viel zu schnell.)
        try { canvas.requestPointerLock()?.catch?.(() => { }); } catch { }
    }
    if (!on && document.pointerLockElement === canvas) document.exitPointerLock();
}
export function setFullscreen(on) {
    const root = document.documentElement;
    if (on && !document.fullscreenElement) root.requestFullscreen?.().catch(() => api?.FullscreenChanged(false));
    if (!on && document.fullscreenElement) document.exitFullscreen?.();
}
// Die Seite mit dem Launcher; index.html kann sie mit window.JAYRAID_TESTER_URL ersetzen.
export function testerUrl() { return window.JAYRAID_TESTER_URL || ''; }
export function openUrl(url) {
    if (document.pointerLockElement) document.exitPointerLock();
    window.open(url, '_blank', 'noopener');
}
let readyResolve;
const readyPromise = new Promise(r => readyResolve = r);
export function ready() { readyResolve(); }

// ── Tasten: KeyboardEvent.code -> GLFW-Nummern (wie Keys in OpenTK) ─────
const named = {
    Space: 32, Quote: 39, Comma: 44, Minus: 45, Period: 46, Slash: 47, Semicolon: 59, Equal: 61,
    BracketLeft: 91, Backslash: 92, BracketRight: 93, Backquote: 96,
    Escape: 256, Enter: 257, Tab: 258, Backspace: 259, Insert: 260, Delete: 261,
    ArrowRight: 262, ArrowLeft: 263, ArrowDown: 264, ArrowUp: 265, PageUp: 266, PageDown: 267, Home: 268, End: 269,
    NumpadEnter: 335, ShiftLeft: 340, ControlLeft: 341, AltLeft: 342, ShiftRight: 344, ControlRight: 345, AltRight: 346,
    IntlBackslash: 92
};
function glfw(code) {
    if (code in named) return named[code];
    if (code.startsWith('Key')) return code.charCodeAt(3);
    if (code.startsWith('Digit')) return 48 + +code[5];
    if (code.startsWith('Numpad') && code.length === 7) return 48 + +code[6];
    const f = /^F(\d+)$/.exec(code); if (f) return 289 + +f[1];
    return -1;
}
function moveTo(e, dx = 0, dy = 0) {
    const r = canvas.getBoundingClientRect(), s = canvas.width / Math.max(1, r.width);
    api.Move((e.clientX - r.left) * s, (e.clientY - r.top) * s, dx, dy);
}
// Tasten, die der Browser sonst selbst nimmt (Fokus, Rollen, Seitensuche).
const keep = new Set([9, 32, 47, 262, 263, 264, 265, 39, 290 + 10]);

function listen() {
    window.addEventListener('keydown', e => {
        if (!api) return;
        al.resume();
        const k = glfw(e.code);
        if (k === 300) { e.preventDefault(); setFullscreen(!document.fullscreenElement); return; } // F11
        if (keep.has(k) || e.ctrlKey && k === 83) e.preventDefault();
        if (!e.repeat) api.Key(k, true);
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) api.Text(e.key.codePointAt(0));
        if (wantLock && document.pointerLockElement !== canvas) setPointerLock(true);
    });
    window.addEventListener('keyup', e => { if (api) api.Key(glfw(e.code), false); });
    canvas.addEventListener('mousedown', e => {
        if (!api) return;
        al.resume();
        e.preventDefault();
        canvas.focus();
        if (document.pointerLockElement !== canvas) moveTo(e);
        if (wantLock && document.pointerLockElement !== canvas) setPointerLock(true);
        api.Button(e.button === 2 ? 1 : e.button === 1 ? 2 : 0, true);
    });
    window.addEventListener('mouseup', e => { if (api) api.Button(e.button === 2 ? 1 : e.button === 1 ? 2 : 0, false); });
    // Die Bewegung: Browser buendeln Mausbewegungen zu einem Ereignis je Bild. Firefox gibt
    // dann nur die letzte Teilbewegung weiter, und bei 30 FPS ging so der Grossteil verloren
    // (das Umsehen hing an der Bildrate). Deshalb pointermove und alle Teilbewegungen addiert.
    window.addEventListener('pointermove', e => {
        if (!api || e.pointerType === 'touch') return;
        let dx = e.movementX || 0, dy = e.movementY || 0;
        const parts = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
        if (parts && parts.length > 1) { dx = 0; dy = 0; for (const p of parts) { dx += p.movementX || 0; dy += p.movementY || 0; } }
        moveTo(e, dx, dy);
    });
    canvas.addEventListener('wheel', e => { e.preventDefault(); if (api) api.Wheel(e.deltaY); }, { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement !== canvas && wantLock && api) { wantLock = false; api.LockLost(); }
    });
    document.addEventListener('fullscreenchange', () => api?.FullscreenChanged(!!document.fullscreenElement));
    window.addEventListener('blur', () => api?.Focus(false));
    window.addEventListener('focus', () => api?.Focus(true));
    document.addEventListener('visibilitychange', () => api?.Focus(!document.hidden));
}

// ── Start ───────────────────────────────────────────────────────────────
export async function boot(progress) {
    fit();
    if (!gl.init(canvas)) throw new Error('WebGL2 fehlt');
    const { dotnet } = await import('./_framework/dotnet.js');
    const rt = await dotnet
        .withModuleConfig({ onDownloadResourceProgress: (done, total) => progress?.(done, total) })
        .create();
    const exports = await rt.getAssemblyExports('Jayraid');
    const web = exports.Jayraid.Web.WebProgram;
    // Das Suchen der Insel und das erste Laden der Welt halten die Seite kurz an:
    // vorher noch einmal zeichnen lassen, damit der Splash sagt, was geschieht.
    window.splashReport?.(.9, 'Generating an island');
    // (Ein Tab im Hintergrund zeichnet nicht: dann nach kurzer Zeit trotzdem weiter.)
    await new Promise(r => { let go = false; const next = () => { if (!go) { go = true; setTimeout(r, 30); } }; requestAnimationFrame(next); setTimeout(next, 150); });
    rt.runMain();
    await readyPromise;
    api = web;
    listen();
    return web;
}

// Zum Pruefen: n Bilder sofort rechnen (auch wenn der Tab im Hintergrund liegt und
// der Browser requestAnimationFrame anhaelt).
window.jayraid = {
    step(n = 1, dt = 1 / 60) { for (let i = 0; i < n; i++) api?.Frame(dt); },
    info() { return api?.Info(); },
    cmd(text) { api?.Command(text); },
    key(code, down) { api?.Key(code, down); },
    click(x, y, button = 0) { api?.Move(x, y, 0, 0); api?.Button(button, true); api?.Frame(1 / 60); api?.Button(button, false); api?.Frame(1 / 60); }
};

export function start() {
    if (running) return;
    running = true;
    let last = performance.now();
    const step = now => {
        const dt = Math.min(.1, Math.max(0, (now - last) / 1000));
        last = now;
        try { api.Frame(dt); }
        catch (e) { console.error(e); }
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}
