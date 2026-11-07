// Jayraid im Browser: die OpenAL-Aufrufe des Spiels (Shim/OpenAL.cs) auf WebAudio.
// Eine OpenAL-Quelle laesst sich beliebig oft abspielen; in WebAudio ist jede
// AudioBufferSourceNode einmalig. Deshalb merkt sich eine Quelle ihre Werte
// und baut bei jedem Abspielen einen neuen Knoten.

const ctx = new (window.AudioContext || window.webkitAudioContext)();
const master = ctx.createGain();
master.connect(ctx.destination);
const buffers = [null], sources = [null];

// Browser spielen erst nach einer Eingabe Ton ab.
export function resume() { if (ctx.state !== 'running') ctx.resume(); }

export function genBuffer() { return buffers.push(null) - 1; }
export function deleteBuffer(b) { buffers[b] = null; }
export function bufferData(b, view, rate) {
    const raw = view.slice();
    const pcm = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength >> 1);
    const buf = ctx.createBuffer(1, Math.max(1, pcm.length), rate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 32768;
    buffers[b] = buf;
}

export function genSource() {
    const gain = ctx.createGain(), pan = ctx.createStereoPanner();
    gain.connect(pan); pan.connect(master);
    return sources.push({ buffer: 0, gain, pan, pitch: 1, loop: false, node: null, end: 0 }) - 1;
}
export function deleteSource(s) {
    const src = sources[s]; if (!src) return;
    stop(s); src.pan.disconnect(); sources[s] = null;
}
export function sourceBuffer(s, b) { if (sources[s]) sources[s].buffer = b; }
export function sourceF(s, p, v) {
    const src = sources[s]; if (!src) return;
    if (p === 0x100A) src.gain.gain.setTargetAtTime(v, ctx.currentTime, .015);
    if (p === 0x1003) { src.pitch = v; if (src.node) src.node.playbackRate.value = v; }
}
export function sourceB(s, p, v) {
    const src = sources[s]; if (!src) return;
    if (p === 0x1007) { src.loop = v; if (src.node) src.node.loop = v; }
}
export function sourcePan(s, x) { if (sources[s]) sources[s].pan.pan.value = Math.max(-1, Math.min(1, x)); }
export function listenerGain(v) { master.gain.value = v; }
export function play(s) {
    const src = sources[s]; if (!src || !buffers[src.buffer]) return;
    stop(s);
    const node = ctx.createBufferSource();
    node.buffer = buffers[src.buffer];
    node.loop = src.loop;
    node.playbackRate.value = src.pitch;
    node.connect(src.gain);
    node.start();
    src.node = node;
    src.end = ctx.currentTime + node.buffer.duration / src.pitch;
}
export function stop(s) {
    const src = sources[s]; if (!src || !src.node) return;
    try { src.node.stop(); } catch { }
    src.node.disconnect(); src.node = null; src.end = 0;
}
export function playing(s) {
    const src = sources[s]; if (!src || !src.node) return false;
    return src.loop || ctx.currentTime < src.end;
}
