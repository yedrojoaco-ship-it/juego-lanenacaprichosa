/* ============================================================
 * audio-manager.js — TV/Jukebox (HTML5 Audio) + stubs SFX
 * Globales: AudioManager, GameAudio. [F1-P2]
 * ============================================================ */

/* ---------------- AudioManager ----------------
 * Gestiona la TV/Jukebox + deja stubs listos para SFX futuros.
 */
class AudioManager {
  constructor() {
    this.tracks = ['assets/music/track1.mp3', 'assets/music/track2.mp3'];
    this.index = 0;
    this.tvOn = false;
    this.audio = new window.Audio();
    this.audio.loop = false;
    this.audio.volume = 0.6;
    this.audio.preload = 'auto';
    this.audio.addEventListener('ended', () => { if (this.tvOn) this.next(); });
    this.audio.addEventListener('error', () => {
      // Sin mp3 en la carpeta: la TV sigue funcionando visualmente.
      console.warn('[AudioManager] No se pudo cargar:', this.currentTrack());
    });
    this.onChange = null; // callback UI: (state) => {}
    this.bank = {}; // SFX WebAudio registrados por BootScene (assets/sfx/*.ogg)
  }

  currentTrack() { return this.tracks[this.index]; }
  trackName() { return 'track' + (this.index + 1) + '.mp3'; }

  _notify() {
    if (typeof this.onChange === 'function') {
      this.onChange({ tvOn: this.tvOn, name: this.trackName(), index: this.index });
    }
  }

  toggleTV() {
    this.tvOn ? this.stopTV() : this.playTV();
  }

  playTV() {
    this.tvOn = true;
    try {
      this.audio.src = this.currentTrack();
      const p = this.audio.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { console.warn(e); }
    this._notify();
  }

  stopTV() {
    this.tvOn = false;
    try { this.audio.pause(); } catch (e) { /* noop */ }
    this._notify();
  }

  next() {
    this.index = (this.index + 1) % this.tracks.length;
    if (this.tvOn) this.playTV(); else this._notify();
  }

  prev() {
    this.index = (this.index - 1 + this.tracks.length) % this.tracks.length;
    if (this.tvOn) this.playTV(); else this._notify();
  }

  // ---- SFX reales (assets/sfx/*.ogg, banco WebAudio) + stubs ----
  sfx(id) {
    try { const s = this.bank[id]; if (s) s.play(); } catch (e) { /* noop */ }
  }
  // ---- Sintetizador WebAudio para SFX sin archivo (paso/grito/extintor/alarma) ----
  ctx() {
    try {
      if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this._ctx.state === 'suspended') this._ctx.resume();
      return this._ctx;
    } catch (e) { return null; }
  }
  ruido(dur, filtroFreq, tipo) {
    const ctx = this.ctx();
    if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = tipo || 'lowpass'; f.frequency.value = filtroFreq || 800;
    src.connect(f); f.connect(ctx.destination);
    src.start();
  }
  tono(f0, f1, dur, tipo) {
    const ctx = this.ctx();
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo || 'square';
    o.frequency.setValueAtTime(f0, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), ctx.currentTime + dur);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  }
  playPaso() { this.ruido(0.07, 500); }                    // pisada sorda
  playGrito() { this.tono(620, 180, 0.28); }               // grito cartoon
  playExtintor() { this.ruido(0.6, 4000, 'highpass'); }    // spray
  playAlarma() { this.tono(660, 660, 0.22); this.tono(880, 880, 0.22); } // sirena x1 (se repite por evento)
  playPuerta() { this.sfx('puerta'); }
  playVentana() { this.sfx('ventana'); }
  playDano() { this.sfx('dano'); }
  playAbejaMuerta() { this.sfx('abeja_muerta'); }
  playAgarre() { this.sfx('agarre'); }
  playSoltar() { this.sfx('soltar'); }
  playComer() { this.sfx('comer'); }
  playVictoria() { this.sfx('victoria'); }
  playDerrota() { this.sfx('derrota'); }
  playAgua() { this.sfx('agua'); }
  playResbalon() { this.sfx('resbalon'); }
  playPila() { this.sfx('pila'); }
  playSFX(key) {
    const fn = { raquetazo: this.playRaquetazo, ventana: this.playVentana,
      dano: this.playDano, abeja_muerta: this.playAbejaMuerta,
      agarre: this.playAgarre, soltar: this.playSoltar, comer: this.playComer,
      victoria: this.playVictoria, derrota: this.playDerrota,
      extintor: this.playExtintor, alarma: this.playAlarma,
      agua: this.playAgua, resbalon: this.playResbalon,
      pila: this.playPila }[key];
    if (fn) { try { fn.call(this); } catch (e) { /* noop */ } }
    if (window.__DEBUG) console.log('[SFX]:', key); // consola limpia en QA/store
  }
}

const GameAudio = new AudioManager();
