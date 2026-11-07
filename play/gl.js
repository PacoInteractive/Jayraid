// Jayraid im Browser: die OpenGL-Aufrufe des Spiels (Shim/GL.cs) auf WebGL2.
// Jedes WebGL-Objekt bekommt eine Nummer, wie in OpenGL; 0 heisst "keins".

let gl = null;
const O = [null];          // Nummer -> WebGL-Objekt
const free = [];
let aniso = null, debugInfo = null, drawFbo = 0;
const uniforms = new Map(); // Programmnummer -> Map(Name -> Nummer)
const U = [null];          // Nummer -> WebGLUniformLocation

export function init(canvas) {
    gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: true, stencil: true, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    if (!gl) return false;
    gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('EXT_color_buffer_half_float');
    gl.getExtension('OES_texture_float_linear');
    aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return true;
}
export const context = () => gl;

function put(o) { const id = free.length ? free.pop() : O.length; O[id] = o; return id; }
const at = id => id ? O[id] : null;
// Ein Blick in den Speicher von .NET ohne Kopie; gilt nur waehrend des Aufrufs.
const bytes = v => v._unsafe_create_view ? v._unsafe_create_view() : v.slice();

export function create(kind) {
    switch (kind) {
        case 1: return put(gl.createBuffer());
        case 2: return put(gl.createVertexArray());
        case 3: return put(gl.createTexture());
        case 4: return put(gl.createFramebuffer());
        case 5: return put(gl.createRenderbuffer());
        case 6: return put(gl.createProgram());
    }
    return 0;
}
export function createShader(type) { return put(gl.createShader(type)); }
export function del(kind, id) {
    const o = O[id]; if (!o) return;
    switch (kind) {
        case 1: gl.deleteBuffer(o); break;
        case 2: gl.deleteVertexArray(o); break;
        case 3: gl.deleteTexture(o); break;
        case 4: gl.deleteFramebuffer(o); break;
        case 5: gl.deleteRenderbuffer(o); break;
        case 6: gl.deleteProgram(o); uniforms.delete(id); break;
        case 7: gl.deleteShader(o); break;
    }
    O[id] = null; free.push(id);
}

export function bindBuffer(t, id) { gl.bindBuffer(t, at(id)); }
export function bindVertexArray(id) { gl.bindVertexArray(at(id)); }
export function bufferData(t, view, size, usage) {
    const b = bytes(view);
    gl.bufferData(t, b, usage, 0, Math.min(size, b.byteLength));
}
export function bufferSubData(t, offset, view, size) {
    const b = bytes(view);
    gl.bufferSubData(t, offset, b, 0, Math.min(size, b.byteLength));
}
export function enableVertexAttribArray(i) { if (i >= 0) gl.enableVertexAttribArray(i); }
export function vertexAttribPointer(i, size, type, norm, stride, offset) { if (i >= 0) gl.vertexAttribPointer(i, size, type, norm, stride, offset); }
export function vertexAttribDivisor(i, d) { if (i >= 0) gl.vertexAttribDivisor(i, d); }

export function activeTexture(u) { gl.activeTexture(u); }
export function bindTexture(t, id) { gl.bindTexture(t, at(id)); }
export function texParameteri(t, n, v) { if (n === 0x84FE) return texParameterf(t, n, v); gl.texParameteri(t, n, v); }
export function texParameterf(t, n, v) {
    if (n === 0x84FE) { if (aniso) gl.texParameterf(t, aniso.TEXTURE_MAX_ANISOTROPY_EXT, v); return; }
    gl.texParameterf(t, n, v);
}
// WebGL2 verlangt fuer Tiefentexturen ganze Zahlen statt Gleitkomma, und
// fuer RGBA ohne Groesse den Typ UNSIGNED_BYTE.
function fixType(internal, type) { return internal === 0x81A6 ? 0x1405 : type; }
export function texImage2DEmpty(t, level, internal, w, h, format, type) {
    gl.texImage2D(t, level, internal, w, h, 0, format, fixType(internal, type), null);
}
export function texImage2D(t, level, internal, w, h, format, type, view) {
    gl.texImage2D(t, level, internal, w, h, 0, format, fixType(internal, type), bytes(view));
}
export function texSubImage2D(t, level, x, y, w, h, format, type, view) {
    gl.texSubImage2D(t, level, x, y, w, h, format, type, bytes(view));
}

export function bindFramebuffer(t, id) {
    gl.bindFramebuffer(t, at(id));
    if (t === 0x8D40 || t === 0x8CA9) drawFbo = id;
}
export function bindRenderbuffer(t, id) { gl.bindRenderbuffer(t, at(id)); }
export function renderbufferStorage(t, samples, format, w, h) {
    if (samples > 0) gl.renderbufferStorageMultisample(t, Math.min(samples, gl.getParameter(gl.MAX_SAMPLES)), format, w, h);
    else gl.renderbufferStorage(t, format, w, h);
}
export function framebufferTexture2D(t, a, tt, tex, level) { gl.framebufferTexture2D(t, a, tt, at(tex), level); }
export function framebufferRenderbuffer(t, a, rt, rb) { gl.framebufferRenderbuffer(t, a, rt, at(rb)); }
export function checkFramebufferStatus(t) { return gl.checkFramebufferStatus(t); }
export function blitFramebuffer(a, b, c, d, e, f, g, h, mask, filter) { gl.blitFramebuffer(a, b, c, d, e, f, g, h, mask, filter); }
export function drawBuffer(mode) { gl.drawBuffers([mode === 0 ? gl.NONE : (drawFbo ? gl.COLOR_ATTACHMENT0 : gl.BACK)]); }
export function readBuffer(mode) { gl.readBuffer(mode === 0 ? gl.NONE : (drawFbo ? gl.COLOR_ATTACHMENT0 : gl.BACK)); }
export function readPixels(x, y, w, h, format, type, view) {
    const out = new Uint8Array(w * h * 4);
    gl.readPixels(x, y, w, h, format, type, out);
    view.set(out);
}

export function enable(c) { gl.enable(c); }
export function disable(c) { gl.disable(c); }
export function blendFunc(s, d) { gl.blendFunc(s, d); }
export function depthMask(on) { gl.depthMask(on); }
export function colorMask(r, g, b, a) { gl.colorMask(r, g, b, a); }
export function cullFace(m) { gl.cullFace(m); }
export function viewport(x, y, w, h) { gl.viewport(x, y, w, h); }
export function clearColor(r, g, b, a) { gl.clearColor(r, g, b, a); }
export function clearDepth(d) { gl.clearDepth(d); }
export function clear(m) { gl.clear(m); }
export function getError() { return gl.getError(); }
export function getString(n) {
    if (n === 0x1F01 && debugInfo) return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'WebGL2';
    return gl.getParameter(n) || 'WebGL2';
}
export function getInteger(n) {
    if (n === 0x8CA6) return drawFbo;
    const v = gl.getParameter(n);
    return typeof v === 'number' ? v : 0;
}
export function getViewport(view) { view.set(new Uint8Array(new Int32Array(gl.getParameter(gl.VIEWPORT)).buffer)); }
export function getFloat(n) {
    if (n === 0x84FF) return aniso ? gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;
    const v = gl.getParameter(n);
    return typeof v === 'number' ? v : 0;
}

export function drawArrays(m, first, count) { gl.drawArrays(m, first, count); }
export function drawArraysInstanced(m, first, count, n) { gl.drawArraysInstanced(m, first, count, n); }

export function shaderSource(s, src) { gl.shaderSource(O[s], src); }
export function compileShader(s) {
    gl.compileShader(O[s]);
    if (!gl.getShaderParameter(O[s], gl.COMPILE_STATUS)) console.error('Shader:', gl.getShaderInfoLog(O[s]), '\n', gl.getShaderSource(O[s]));
}
export function getShaderParameter(s, p) { const v = gl.getShaderParameter(O[s], p); return v === true ? 1 : v === false ? 0 : v | 0; }
export function getShaderInfoLog(s) { return gl.getShaderInfoLog(O[s]) || ''; }
export function attachShader(p, s) { gl.attachShader(O[p], O[s]); }
export function linkProgram(p) {
    gl.linkProgram(O[p]);
    if (!gl.getProgramParameter(O[p], gl.LINK_STATUS)) console.error('Programm:', gl.getProgramInfoLog(O[p]));
}
export function getProgramParameter(p, n) { const v = gl.getProgramParameter(O[p], n); return v === true ? 1 : v === false ? 0 : v | 0; }
export function getProgramInfoLog(p) { return gl.getProgramInfoLog(O[p]) || ''; }
export function useProgram(p) { gl.useProgram(at(p)); }
export function getUniformLocation(p, name) {
    let m = uniforms.get(p);
    if (!m) uniforms.set(p, m = new Map());
    let id = m.get(name);
    if (id === undefined) {
        const loc = gl.getUniformLocation(O[p], name);
        id = loc ? U.push(loc) - 1 : -1;
        m.set(name, id);
    }
    return id;
}
export function getAttribLocation(p, name) { return gl.getAttribLocation(O[p], name); }
export function uniform1i(l, v) { if (l > 0) gl.uniform1i(U[l], v); }
export function uniform1f(l, v) { if (l > 0) gl.uniform1f(U[l], v); }
export function uniform2f(l, a, b) { if (l > 0) gl.uniform2f(U[l], a, b); }
export function uniform3f(l, a, b, c) { if (l > 0) gl.uniform3f(U[l], a, b, c); }
export function uniform4f(l, a, b, c, d) { if (l > 0) gl.uniform4f(U[l], a, b, c, d); }
export function uniformMatrix4(l, tr, view) {
    if (l <= 0) return;
    const b = bytes(view);
    gl.uniformMatrix4fv(U[l], tr, new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4));
}
