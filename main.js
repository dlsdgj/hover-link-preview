const { Plugin } = require("obsidian");
const fs = require("fs");
const os = require("os");
const path = require("path");

const HOVER_FILE = path.join(os.tmpdir(), "hover_link.json");
const RE_LINK = /\[([^\]\n]*)\]\((((?:[A-Za-z]:[\\/]|\\\\)[^)\n]*))\)/g;
const RE_LOCAL = /^(?:[A-Za-z]:[\\/]|\\\\)/;

function isLocalPath(s) { return typeof s === "string" && RE_LOCAL.test(s); }

function writeHover(p, editing, l, t, r, b) {
  const ts = Date.now();
  const pj = p == null ? "null" : '"' + p.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  try { fs.writeFileSync(HOVER_FILE, `{"path":${pj},"editing":${editing},"l":${l|0},"t":${t|0},"r":${r|0},"b":${b|0},"ts":${ts}}`); } catch (_) {}
}
function clearHover() { writeHover(null, false, 0, 0, 0, 0); }

function rectToScreen(el) {
  const r = el.getBoundingClientRect();
  const sc = window.devicePixelRatio || 1;
  return {
    l: Math.round(window.screenX + r.left * sc),
    t: Math.round(window.screenY + r.top * sc),
    r: Math.round(window.screenX + r.right * sc),
    b: Math.round(window.screenY + r.bottom * sc),
  };
}
function coordsToScreen(c) {
  const sc = window.devicePixelRatio || 1;
  return {
    l: Math.round(window.screenX + c.left * sc),
    t: Math.round(window.screenY + c.top * sc),
    r: Math.round(window.screenX + (c.right || c.left) * sc),
    b: Math.round(window.screenY + (c.bottom || c.top) * sc),
  };
}

// live preview：光标所在行显示源码，悬停该行时 Obsidian 临时渲染链接为 <a>。
// 此时光标在该行=编辑态临时渲染，不应弹窗。返回 true 表示是这种临时渲染。
function isLivePreviewEditing(a, e) {
  const cm = a.closest && a.closest(".cm-editor");
  if (!cm) return false;
  const ed = window.app?.workspace?.activeEditor?.editor;
  const v = ed?.cm;
  if (!v || !v.posAtCoords || !v.state) return false;
  try {
    const pos = v.posAtCoords({ x: e.clientX, y: e.clientY }, false);
    const head = v.state.selection.main.head;
    return v.state.doc.lineAt(pos).number === v.state.doc.lineAt(head).number;
  } catch (_) { return false; }
}

class HoverLinkPreviewPlugin extends Plugin {
  onload() {
    this._cur = null;
    this._timer = window.setInterval(() => { if (this._cur) this._emit(this._cur); }, 400);
    this.registerDomEvent(document, "mouseover", (e) => this._onOver(e));
    this.registerDomEvent(document, "mouseout", (e) => this._onOut(e));
    this.registerDomEvent(document, "mouseleave", () => { this._cur = null; clearHover(); });
    this.app.workspace.on("layout-change", () => { this._cur = null; clearHover(); });
  }
  onunload() { window.clearInterval(this._timer); clearHover(); }

  _onOver(e) {
    const hit = this._hitAt(e);
    if (!hit) return;
    if (this._cur && this._cur.path === hit.path && this._cur.l === hit.l) return;
    this._cur = hit;
    this._emit(hit);
  }
  _onOut(e) {
    const hit = this._hitAt(e);
    if (!hit && this._cur) { this._cur = null; clearHover(); }
  }

  _emit(hit) {
    if (!hit || !hit.path) return;
    writeHover(hit.path, false, hit.l, hit.t, hit.r, hit.b);
  }

  _hitAt(e) {
    // 阅读视图 / live preview 渲染态：<a href> / <a data-href> 本地路径
    const a = e.target.closest && e.target.closest("a[href], a[data-href]");
    if (a) {
      const p = a.getAttribute("data-href") || a.getAttribute("href") || "";
      const dec = decodeURIComponent(p).replace(/^file:\/\/\//, "");
      if (isLocalPath(dec)) {
        // live preview 编辑态临时渲染：光标在该行，不弹窗
        if (isLivePreviewEditing(a, e)) return null;
        const s = rectToScreen(a);
        return { path: dec, l: s.l, t: s.t, r: s.r, b: s.b };
      }
    }
    // CodeMirror 源码态：[text](本地路径)，用 posAtCoords 定位鼠标所在行
    const cm = e.target.closest && e.target.closest(".cm-editor");
    if (cm) {
      const ed = this.app.workspace.activeEditor?.editor;
      const v = ed?.cm;
      if (v && v.posAtCoords) {
        try {
          const pos = v.posAtCoords({ x: e.clientX, y: e.clientY }, false);
          const line = v.state.doc.lineAt(pos);
          RE_LINK.lastIndex = 0;
          let m;
          while ((m = RE_LINK.exec(line.text))) {
            const ls = line.from + m.index;
            const le = ls + m[0].length;
            if (pos >= ls && pos <= le) {
              const c1 = v.coordsAtPos(ls, 1);
              const c2 = v.coordsAtPos(le, -1);
              if (c1 && c2) {
                const s = coordsToScreen({ left: c1.left, top: c1.top, right: c2.right, bottom: c2.bottom });
                return { path: m[2], l: s.l, t: s.t, r: s.r, b: s.b };
              }
            }
          }
        } catch (_) {}
      }
    }
    return null;
  }
}

module.exports = HoverLinkPreviewPlugin;