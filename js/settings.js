/**
 * App-wide preferences, persisted in localStorage and surfaced by the
 * settings modal (⚙ in the home header and in the game topbar).
 */

const LS_KEY = 'settings_v1';

const DEFAULTS = {
  fastWin: true,   // AI takes the shortest win / the longest resistance
  theme:   'dark',
  debug:   false,  // reserved — the debug overlay is not implemented yet
};

let current = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    return saved ? { ...DEFAULTS, ...saved } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function save() {
  // Private-browsing mode can throw here; settings then stay session-only.
  try { localStorage.setItem(LS_KEY, JSON.stringify(current)); } catch { /* ignore */ }
}

/** @returns {{fastWin:boolean, theme:'dark'|'light', debug:boolean}} live settings object */
export function getSettings() { return current; }

export function setSetting(key, value) {
  current[key] = value;
  save();
  applySettings();
}

/** Mirrors settings onto <html> so CSS — and, later, the debug overlay — can react. */
export function applySettings() {
  const root = document.documentElement;
  root.dataset.theme = current.theme;
  if (current.debug) root.dataset.debug = 'on';
  else delete root.dataset.debug;
}

// Run at import time so the theme is in place before the first paint.
applySettings();

/** Wires the settings modal. Call once, after DOMContentLoaded. */
export function initSettings() {
  const overlay    = document.getElementById('modal-settings');
  const cbFastWin  = document.getElementById('set-fastwin');
  const cbDebug    = document.getElementById('set-debug');
  const themeBtns  = document.querySelectorAll('[data-theme-opt]');

  function syncUI() {
    cbFastWin.checked = current.fastWin;
    cbDebug.checked   = current.debug;
    themeBtns.forEach(b => b.classList.toggle('active', b.dataset.themeOpt === current.theme));
  }

  const open  = () => { syncUI(); overlay.classList.add('visible'); };
  const close = () => overlay.classList.remove('visible');

  document.querySelectorAll('[data-open-settings]').forEach(b => b.addEventListener('click', open));

  cbFastWin.addEventListener('change', () => setSetting('fastWin', cbFastWin.checked));
  cbDebug.addEventListener('change',   () => setSetting('debug',   cbDebug.checked));

  themeBtns.forEach(btn => btn.addEventListener('click', () => {
    setSetting('theme', btn.dataset.themeOpt);
    syncUI();
  }));

  document.getElementById('btn-settings-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) close();
  });

  syncUI();
}
