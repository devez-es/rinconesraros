(function () {
  'use strict';
  var KEY = 'rr_cookie_consent_v1', MESES = 12;
  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!v || !v.ts) return null;
      if (Date.now() - v.ts > MESES * 30 * 24 * 3600 * 1000) return null;
      return v;
    } catch (e) { return null; }
  }
  function save(yt) { try { localStorage.setItem(KEY, JSON.stringify({ yt: !!yt, ts: Date.now() })); } catch (e) {} }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }

  function apply() {
    var c = read(), on = !!(c && c.yt);
    document.querySelectorAll('[data-yt]').forEach(function (box) {
      var ifr = box.querySelector('iframe'), ph = box.querySelector('.yt-ph');
      if (on) {
        if (!ifr) {
          ifr = document.createElement('iframe');
          ifr.src = 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-yt');
          ifr.title = box.getAttribute('data-title') || 'Vídeo de YouTube';
          ifr.loading = 'lazy'; ifr.allowFullscreen = true;
          ifr.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture';
          ifr.referrerPolicy = 'strict-origin-when-cross-origin';
          box.appendChild(ifr);
        }
        if (ph) ph.style.display = 'none';
      } else {
        if (ifr) ifr.remove();
        if (ph) ph.style.display = '';
      }
    });
  }

  function css() {
    var s = document.createElement('style');
    s.textContent = '.ck-ov{position:fixed;inset:0;background:rgba(3,8,16,.72);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.ck{background:#111f38;color:#f3ead8;max-width:560px;width:100%;border:1px solid #2b4470;border-radius:16px;padding:24px;font:16px/1.55 system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.6);max-height:92vh;overflow:auto}' +
      '.ck h2{margin:0 0 8px;font-size:1.25rem}.ck p{margin:0 0 12px;color:#d9d2c3}.ck a{color:#ffb347}' +
      '.ck-b{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}' +
      '.ck-b button{flex:1 1 140px;font:700 .95rem system-ui,sans-serif;padding:.75rem 1rem;border-radius:10px;cursor:pointer;border:2px solid #ffb347;background:transparent;color:#ffb347}' +
      '.ck-b button:hover,.ck-b button:focus-visible{background:#ffb347;color:#1a1206;outline:none}' +
      '.ck-opt{display:flex;gap:12px;align-items:flex-start;background:#0b1730;border:1px solid #1f3558;border-radius:10px;padding:12px;margin:8px 0}' +
      '.ck-opt input{width:22px;height:22px;margin-top:3px;accent-color:#ffb347}.ck-opt small{display:block;color:#a3b3cc}' +
      '.yt-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px;height:100%;background:#0b1730;color:#d9d2c3;font:15px/1.5 system-ui,sans-serif}' +
      '.yt-ph button{font:700 .9rem system-ui,sans-serif;padding:.6rem 1.1rem;border-radius:999px;border:2px solid #ffb347;background:transparent;color:#ffb347;cursor:pointer}' +
      '.yt-ph button:hover{background:#ffb347;color:#1a1206}';
    document.head.appendChild(s);
  }

  var overlay = null, lastFocus = null;
  function close() { if (overlay) { overlay.remove(); overlay = null; if (lastFocus && lastFocus.focus) lastFocus.focus(); } }
  function choose(yt) { save(yt); apply(); close(); }

  function open(config) {
    if (overlay) return;
    lastFocus = document.activeElement;
    var cur = read();
    overlay = document.createElement('div'); overlay.className = 'ck-ov';
    var box = document.createElement('div'); box.className = 'ck';
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'ck-t');
    box.innerHTML = '<h2 id="ck-t">Tu privacidad en Rincones Raros</h2>' +
      '<p>Este sitio usa solo almacenamiento técnico imprescindible (para recordar esta elección). Los vídeos de YouTube incrustados usan cookies de Google y <b>solo se cargan si lo aceptas</b>. Puedes cambiar de opinión en cualquier momento desde «Configurar cookies» en el pie. Más información en la <a href="legal.html#cookies">política de cookies</a>.</p>' +
      '<div class="ck-cfg" hidden>' +
      '<div class="ck-opt"><input type="checkbox" checked disabled id="ck-n"><label for="ck-n"><b>Técnicas (necesarias)</b><small>Guardan tu elección sobre cookies durante 12 meses. No se pueden desactivar.</small></label></div>' +
      '<div class="ck-opt"><input type="checkbox" id="ck-yt"><label for="ck-yt"><b>YouTube (terceros)</b><small>Permite reproducir los vídeos incrustados. Google puede guardar cookies y tratar datos de navegación.</small></label></div>' +
      '</div>' +
      '<div class="ck-b"><button type="button" data-a="no">Rechazar</button><button type="button" data-a="cfg">Configurar</button><button type="button" data-a="yes">Aceptar</button></div>';
    overlay.appendChild(box); document.body.appendChild(overlay);
    var cfg = box.querySelector('.ck-cfg'), yt = box.querySelector('#ck-yt'); yt.checked = !!(cur && cur.yt);
    var cfgBtn = box.querySelector('[data-a=cfg]');
    box.addEventListener('click', function (e) {
      var a = e.target && e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'yes') choose(true);
      else if (a === 'no') choose(false);
      else if (a === 'cfg') {
        if (cfg.hidden) { cfg.hidden = false; cfgBtn.textContent = 'Guardar selección'; }
        else choose(yt.checked);
      }
    });
    box.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = box.querySelectorAll('button,input:not([disabled]),a[href]'); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    box.querySelector('[data-a=no]').focus();
  }

  window.rrCookies = { open: open, reset: function () { clear(); apply(); open(); } };

  function init() {
    css(); apply();
    document.querySelectorAll('[data-ck-open]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
    document.querySelectorAll('.yt-ph button').forEach(function (b) { b.addEventListener('click', function () { open(); }); });
    if (!read()) open();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
