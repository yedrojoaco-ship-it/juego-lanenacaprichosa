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

  // ---- Stubs SFX: enlazar .mp3 aquí más adelante ----
  playPaso() {}      // TODO: assets/sfx/paso.mp3
  playRaquetazo() {} // TODO: assets/sfx/raquetazo.mp3
  playGrito() {}     // TODO: assets/sfx/grito.mp3
  playPuerta() {}    // TODO: assets/sfx/puerta.mp3
  playVentana() {}   // TODO: assets/sfx/ventana.mp3
  playDano() {}      // TODO: assets/sfx/dano.mp3
  playAbejaMuerta() {} // TODO: assets/sfx/abeja_muerta.mp3
  playAgarre() {}    // TODO: assets/sfx/agarre.mp3
  playSoltar() {}    // TODO: assets/sfx/soltar.mp3
  playComer() {}     // TODO: assets/sfx/comer.mp3
  playVictoria() {}  // TODO: assets/sfx/victoria.mp3
  playDerrota() {}   // TODO: assets/sfx/derrota.mp3
  playExtintor() {}  // TODO: assets/sfx/extintor.mp3
  playAlarma() {}    // TODO: assets/sfx/alarma.mp3
  playAgua() {}      // TODO: assets/sfx/agua.mp3
  playResbalon() {}  // TODO: assets/sfx/resbalon.mp3
  playPila() {}      // TODO: assets/sfx/pila.mp3
  playSFX(key) {
    const fn = { raquetazo: this.playRaquetazo, ventana: this.playVentana,
      dano: this.playDano, abeja_muerta: this.playAbejaMuerta,
      agarre: this.playAgarre, soltar: this.playSoltar, comer: this.playComer,
      victoria: this.playVictoria, derrota: this.playDerrota,
      extintor: this.playExtintor, alarma: this.playAlarma,
      agua: this.playAgua, resbalon: this.playResbalon,
      pila: this.playPila }[key];
    if (fn) { try { fn.call(this); } catch (e) { /* noop */ } }
    console.log('[SFX]:', key);
  }
}

const GameAudio = new AudioManager();
