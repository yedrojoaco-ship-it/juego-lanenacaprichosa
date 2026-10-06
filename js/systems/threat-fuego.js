/* ============================================================
 * threat-fuego.js — Amenaza Nivel 2: olla en llamas + alarma.
 * Subclase de Threat: MainScene no la conoce en detalle. [F4]
 * ============================================================ */

class ThreatFuego extends Threat {
  constructor(scene) {
    super(scene, 'fuego');
    const O = this.olla = { x: 140, y: 388 }; // sobre mesada norte
    this.intensidad = 30; // arranca prendido suave
    this.alarma = false;
    this.alarmaAviso = false;
    this.puntoAlarma = { x: 650, y: 335 }; // pasillo este
    // Olla + llamas + barra
    scene.add.rectangle(O.x, O.y, 44, 22, 0x3a3a3a).setDepth(O.y);
    this.llama1 = scene.add.triangle(O.x, O.y - 16, 0, 18, 18, 18, 9, 0, 0xff6a00).setDepth(O.y + 1);
    this.llama2 = scene.add.triangle(O.x, O.y - 12, 0, 12, 12, 12, 6, 0, 0xffd93b).setDepth(O.y + 1.1);
    this.barBg = scene.add.rectangle(O.x, O.y - 44, 52, 7, 0x000000, 0.55).setDepth(850);
    this.barFill = scene.add.rectangle(O.x, O.y - 44, 50, 5, 0xff6a00).setDepth(851);
    // Alarma en el pasillo
    this.alCaja = scene.add.rectangle(this.puntoAlarma.x, this.puntoAlarma.y - 20, 26, 18, 0x8a1a1a).setDepth(60);
    this.alLuz = scene.add.circle(this.puntoAlarma.x, this.puntoAlarma.y - 20, 6, 0x550000).setDepth(61);
  }

  vivas() { return 0; }
  congelar() {}

  amenazaParaConi() {
    return (this.intensidad > 20 || this.alarma) ? 1 : 0;
  }

  estaResuelta() {
    return this.intensidad <= 0 && !this.alarma;
  }

  cercaOlla() {
    const p = this.scene.player;
    return Phaser.Math.Distance.Between(p.x, p.y, this.olla.x, this.olla.y + 30) < 95;
  }

  cercaAlarma() {
    const p = this.scene.player;
    return Phaser.Math.Distance.Between(p.x, p.y, this.puntoAlarma.x, this.puntoAlarma.y) < 80;
  }

  usarExtintor() {
    if (!this.cercaOlla() || this.intensidad <= 0) return false;
    this.intensidad = fuegoTick(this.intensidad, 0, { uso: true });
    const o = this.olla;
    for (let i = 0; i < 5; i++) { // nube blanca del extintor
      const s = this.scene.add.circle(o.x + Phaser.Math.Between(-16, 16), o.y - 10, 5, 0xffffff, 0.9).setDepth(900);
      this.scene.tweens.add({ targets: s, alpha: 0, y: s.y - 26, duration: 500, onComplete: () => s.destroy() });
    }
    GameAudio.playSFX('extintor');
    return true;
  }

  silenciarAlarma() {
    if (!this.alarma || !this.cercaAlarma()) return false;
    this.alarma = false;
    this.alLuz.setFillStyle(0x550000);
    GameAudio.playSFX('puerta');
    return true;
  }

  actualizar(dt, now) {
    if (this.intensidad > 0) this.intensidad = fuegoTick(this.intensidad, dt, {});
    // Quemadura si Jazmín toca la olla con fuego fuerte
    const p = this.scene.player;
    if (this.intensidad > 50 && now > this.scene.danoCD &&
        Phaser.Math.Distance.Between(p.x, p.y, this.olla.x, this.olla.y + 20) < 34) {
      this.scene.hurtJazmin(now, 10);
    }
    if (!this.alarma && this.intensidad > 40) {
      this.alarma = true;
      if (!this.alarmaAviso) { this.alarmaAviso = true; this.scene.notify('¡Apaga la alarma! 🚨'); }
      GameAudio.playSFX('alarma');
    }
    // Llamas parpadeantes + humo
    const f = this.intensidad / 100;
    this.llama1.setDisplaySize(18 * (0.4 + f), 18 * (0.4 + f) * (0.9 + Math.random() * 0.3));
    this.llama2.setDisplaySize(12 * (0.4 + f), 12 * (0.4 + f) * (0.9 + Math.random() * 0.3));
    this.llama1.setVisible(f > 0); this.llama2.setVisible(f > 0);
    this.alLuz.setFillStyle(this.alarma ? (Math.floor(Date.now() / 300) % 2 ? 0xff2222 : 0x550000) : 0x550000);
    if (f > 0.15 && Math.random() < dt * 6) { // humo
      const s = this.scene.add.circle(this.olla.x + Phaser.Math.Between(-10, 10), this.olla.y - 24, 6, 0x555555, 0.5).setDepth(849);
      this.scene.tweens.add({ targets: s, alpha: 0, y: s.y - 46, duration: 1200, onComplete: () => s.destroy() });
    }
    this.barBg.setPosition(this.olla.x, this.olla.y - 44);
    this.barFill.setPosition(this.olla.x - (50 - 50 * f) / 2, this.olla.y - 44)
      .setDisplaySize(Math.max(50 * f, 0.1), 5).setFillStyle(f > 0.6 ? 0xff2222 : 0xff9a3b);
  }
}
