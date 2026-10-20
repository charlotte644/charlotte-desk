/* Shared helpers for the three pages. The pages talk to the Apps Script web app with a plain POST (no cookies), which works even when several Google accounts are signed in. */
(function () {
  var D = window.Desk = {};
  var cfg = window.DESK_CONFIG || {};
  D.$ = function (s, r) { return (r || document).querySelector(s); };
  D.$$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  D.h = function (s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  D.store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  D.api = function (fn) {
    var args = [].slice.call(arguments, 1);
    if (!cfg.SCRIPT_URL) return Promise.reject(new Error('This page has not been connected yet (SCRIPT_URL is empty in config.js).'));
    return fetch(cfg.SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ fn: fn, args: args }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || 'Something went wrong.'); return j.data; });
  };
  // the private key lives in the link's #key=... part, is remembered on this device, and is then removed from the address bar
  D.key = function () {
    var m = /[#&]key=([A-Za-z0-9]+)/.exec(location.hash || '');
    if (m) { D.store.set('desk_key', m[1]); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ } }
    return D.store.get('desk_key') || '';
  };
  // the add-tasks-only link carries #tk=...; it is remembered on that device and then hidden from the address bar
  D.taskKey = function () {
    var m = /[#&]tk=([A-Za-z0-9]+)/.exec(location.hash || '');
    if (m) { D.store.set('desk_tkey', m[1]); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ } }
    return D.store.get('desk_tkey') || '';
  };
  D.toast = function (msg, kind) {
    var t = document.createElement('div'); t.className = 'toast' + (kind === 'err' ? ' err' : ''); t.textContent = msg; t.setAttribute('role', 'status'); document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, kind === 'err' ? 5000 : 2600);
  };
  D.busy = function (btn, on, label) {
    if (on) { btn.dataset.l = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>' + D.h(label || 'Working…'); }
    else { btn.disabled = false; btn.innerHTML = btn.dataset.l || btn.innerHTML; }
  };
  D.fmt = function (mins) { return ('0' + Math.floor(mins / 60)).slice(-2) + ':' + ('0' + (mins % 60)).slice(-2); };
  D.fit = function (free, len, step) { var out = []; (free || []).forEach(function (f) { for (var s = Math.ceil(f[0] / step) * step; s + len <= f[1]; s += step) out.push(s); }); return out; };
  D.todayStr = function () { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  D.addDays = function (ds, n) { var p = ds.split('-').map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)); return d.toISOString().slice(0, 10); };
  D.weekday = function (ds) { var p = ds.split('-').map(Number), w = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); return w === 0 ? 7 : w; };
  D.label = function (ds) { var p = ds.split('-').map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2])); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()] + ' ' + p[2] + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p[1] - 1]; };
})();
