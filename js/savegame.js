// Stage 28 — single-slot persistence with backward-compatible Stage 22/23/27 loading. The generated seed is stored first so a
// saved world is reconstructed with the same terrain before mutable state is applied.
class SaveGameSystem {
  static KEY = 'last-county-stage22-slot1';

  static storage() {
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (_) { return null; }
  }

  static SUPPORTED = [22, 23, 27, 28, 31, 32, 39, 40, 41];

  static isSupported(version) {
    return this.SUPPORTED.includes(version);
  }

  static peek() {
    const store = this.storage();
    if (!store) return null;
    try {
      const raw = store.getItem(this.KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data && this.isSupported(data.version) ? data : null;
    } catch (_) { return null; }
  }

  static save(data) {
    const store = this.storage();
    if (!store) return { ok:false, reason:'Armazenamento local indisponível' };
    try {
      store.setItem(this.KEY, JSON.stringify(data));
      return { ok:true };
    } catch (e) {
      return { ok:false, reason:e?.message || 'Falha ao salvar' };
    }
  }

  static clear() {
    const store = this.storage();
    if (!store) return false;
    try { store.removeItem(this.KEY); return true; } catch (_) { return false; }
  }

  static encodeBytes(arr) {
    if (typeof btoa !== 'function') return Array.from(arr);
    let out = '';
    const chunk = 0x6000;
    for (let i = 0; i < arr.length; i += chunk) out += String.fromCharCode(...arr.subarray(i, Math.min(arr.length, i + chunk)));
    return btoa(out);
  }

  static decodeBytes(value, length) {
    if (Array.isArray(value)) return Uint8Array.from(value.slice(0, length));
    if (typeof atob !== 'function' || typeof value !== 'string') return null;
    const raw = atob(value);
    const arr = new Uint8Array(Math.min(length, raw.length));
    for (let i = 0; i < arr.length; i++) arr[i] = raw.charCodeAt(i) & 255;
    return arr;
  }
}
