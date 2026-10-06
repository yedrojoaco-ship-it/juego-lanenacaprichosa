/* ============================================================
 * sdk.js — Wrapper CrazyGames SDK v3 con guards.
 * Sin SDK (local/offline) todo es noop: el juego funciona igual.
 * Progreso en localStorage. [F6]
 * ============================================================ */

const SDK = {
  maxNivel: 1,

  get craz() {
    try { return window.CrazyGames && window.CrazyGames.SDK; } catch (e) { return null; }
  },

  init() {
    try {
      const stored = window.localStorage && window.localStorage.getItem('jna_max');
      if (stored) this.maxNivel = Math.max(1, Math.min(5, parseInt(stored, 10) || 1));
    } catch (e) { /* noop */ }
    try {
      const sdk = this.craz;
      if (sdk && sdk.init) sdk.init();
    } catch (e) { /* noop */ }
  },

  gameplayStart() {
    try { const g = this.craz && this.craz.game; if (g && g.gameplayStart) g.gameplayStart(); } catch (e) { /* noop */ }
  },

  gameplayStop() {
    try { const g = this.craz && this.craz.game; if (g && g.gameplayStop) g.gameplayStop(); } catch (e) { /* noop */ }
  },

  nivelCompletado(nivel) {
    try {
      this.maxNivel = Math.max(this.maxNivel, Math.min(5, nivel + 1));
      if (window.localStorage) window.localStorage.setItem('jna_max', '' + this.maxNivel);
    } catch (e) { /* noop */ }
    try { const g = this.craz && this.craz.game; if (g && g.happytime) g.happytime(); } catch (e) { /* noop */ }
    try { const g = this.craz && this.craz.game; if (g && g.gameplayStop) g.gameplayStop(); } catch (e) { /* noop */ }
  },
};

SDK.init();
