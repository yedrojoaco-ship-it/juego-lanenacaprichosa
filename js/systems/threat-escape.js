/* ============================================================
 * threat-escape.js — Amenaza Nivel 5: Coni corre a la piscina.
 * Atraparla con flotador + cerrar el ventanal. [F6]
 * ============================================================ */

class ThreatEscape extends Threat {
  constructor(scene) {
    super(scene, 'escape');
    this.puertaPatio = { x: 530, y: 640 }; // vano sur del living
    this.piscina = { x: 480, y: 730 };
    this.atrapada = false;
    this.cerrojo = false;
    this.aviso = false;
    // Candado del ventanal (🔓 abierto / 🔒 cerrado)
    this.candado = scene.add.text(this.puertaPatio.x, this.puertaPatio.y - 24, '🔓', { fontSize: '22px' })
      .setOrigin(0.5).setDepth(60);
  }

  vivas() { return 0; }
  congelar() {}

  amenazaParaConi() {
    if (this.atrapada && this.cerrojo) return 0;
    return this.atrapada ? 0.3 : 1;
  }

  estaResuelta() {
    return this.atrapada && this.cerrojo;
  }

  cercaPuerta() {
    const p = this.scene.player;
    return Phaser.Math.Distance.Between(p.x, p.y, this.puertaPatio.x, this.puertaPatio.y) < 80;
  }

  atrapar() {
    const scene = this.scene;
    if (this.atrapada || !scene.hands || scene.hands.id !== 'flotador') return false;
    if (!scene.nearConi()) return false;
    this.atrapada = true;
    const s = MANSION.spawn.coni;
    scene.coni.setPosition(s[0], s[1]); // de vuelta a la cama
    scene.coniBar = 20;
    scene.notify('¡A salvo! Cierra el ventanal 🔒');
    GameAudio.playSFX('comer');
    return true;
  }

  cerrarVentanal() {
    if (this.cerrojo || !this.cercaPuerta()) return false;
    this.cerrojo = true;
    this.candado.setText('🔒');
    GameAudio.playSFX('puerta');
    return true;
  }

  actualizar() {
    const scene = this.scene;
    if (!this.aviso) {
      this.aviso = true;
      scene.notify('¡Coni corre a la piscina! 🏊');
    }
    if (!this.atrapada) {
      // Fuga: Coni solo quiere la piscina (se reimpone cada frame)
      scene.coniTarget = { x: this.piscina.x, y: this.piscina.y - 120 };
      // ¡Al agua! barra al máximo (derrota por Coni incontrolable)
      if (Phaser.Math.Distance.Between(scene.coni.x, scene.coni.y, this.piscina.x, this.piscina.y) < 80) {
        scene.coniBar = 100;
      }
    }
  }
}
