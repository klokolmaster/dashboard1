/* ================================================================
   CONFIG.JS — LocalStorage Config Manager
   Stores and retrieves all user settings from localStorage.
   ================================================================ */

const CONFIG_KEY = 'dashboard_config';

const DEFAULT_CONFIG = {
  wallpaper: {
    type: 'none',  // 'none' | 'image' | 'gif' | 'video'
    url: ''
  },
  crypto: {
    coins: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP']
  },
  shortcuts: [
    { label: 'YouTube',  url: 'https://www.youtube.com' },
    { label: 'Gmail',    url: 'https://mail.google.com' },
    { label: 'GitHub',   url: 'https://github.com' }
  ],
  theme: 'dark'
};

class ConfigManager {
  constructor() {
    this._data = this._load();
  }

  /** Load config from localStorage, merging with defaults */
  _load() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (!raw) return this._deepClone(DEFAULT_CONFIG);
      const saved = JSON.parse(raw);
      // Deep merge: saved overrides defaults
      return this._deepMerge(this._deepClone(DEFAULT_CONFIG), saved);
    } catch (e) {
      console.warn('[Config] Failed to load, using defaults:', e);
      return this._deepClone(DEFAULT_CONFIG);
    }
  }

  /** Save full config to localStorage */
  _persist() {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this._data));
    } catch (e) {
      console.error('[Config] Failed to persist:', e);
    }
  }

  /** Get all config or a specific top-level key */
  get(key) {
    if (key === undefined) return this._data;
    return this._data[key];
  }

  /** Set a top-level key and persist */
  set(key, value) {
    this._data[key] = value;
    this._persist();
  }

  /** Merge a partial object into config and persist */
  update(partial) {
    this._data = this._deepMerge(this._data, partial);
    this._persist();
  }

  /** Reset to defaults */
  reset() {
    this._data = this._deepClone(DEFAULT_CONFIG);
    this._persist();
  }

  // ---- Helpers ----
  _deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  _deepMerge(target, source) {
    const out = { ...target };
    for (const key of Object.keys(source)) {
      if (
        source[key] !== null &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        out[key] = this._deepMerge(target[key] || {}, source[key]);
      } else {
        out[key] = source[key];
      }
    }
    return out;
  }
}

// Global singleton
const Config = new ConfigManager();
