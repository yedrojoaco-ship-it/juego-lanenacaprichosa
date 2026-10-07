/* ============================================================
 * threat-juguetes.js — Amenaza Nivel 4: juguetes con pilas
 * haciendo ruido. Espacio cerca les quita las pilas. [F6]
 * ============================================================ */

class ThreatJuguetes extends Threat {
  constructor(scene) {
    super(scene, 'juguetes');
    this.lista = []; // {x, y, view, onda, on}
    const skins = ['jug1', 'jug2', 'jug3', 'jug4'];
    const pts = [[240, 120], [700, 120], [620, 450], [120, 600]];
    pts.forEach((pt, i) => {
      const key = skins[i % skins.length];
      const v = scene.textures.exists(key)
        ? scene.add.image(pt[0], pt[1], key).setDisplaySize(36, 36).setDepth(pt[1])
        : scene.add.rectangle(pt[0], pt[1], 22, 22, 0xd94fc9).setDepth(pt[1]); // fallback
      const onda = scene.add.circle(pt[0], pt[1], 10, 0xffffff, 0).setDepth(pt[1] + 1);
      scene.tweens.add({ targets: onda, radius: 30, alpha: 0.5, duration: 800, repeat: -1 });
      this.lista.push({ x: pt[0], y: pt[1], view: v, onda, on: true });
    });
  }

  vivas() { return 0; }
  congelar() {
    for (const j of this.lista) this.scene.tweens.killTweensOf(j.onda);
  }

  activos() { return this.lista.filter((j) => j.on).length; }

  amenazaParaConi() {
    return this.activos() > 0 ? 1 : 0;
  }

  estaResuelta() {
    return this.activos() === 0;
  }

  quitarPilaSiCerca() {
    const p = this.scene.player;
    for (const j of this.lista) {
      if (!j.on) continue;
      if (Phaser.Math.Distance.Between(p.x, p.y, j.x, j.y) < 70) {
        j.on = false;
        j.view.setTint(0x555555);
        this.scene.tweens.killTweensOf(j.onda);
        j.onda.setVisible(false);
        GameAudio.playSFX('pila');
        return true;
      }
    }
    return false;
  }

  actualizar() {}
}
