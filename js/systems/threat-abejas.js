/* ============================================================
 * threat-abejas.js — Amenaza Nivel 1: enjambre que entra por la
 * ventana de Coni. Vive en ThreatSystem; MainScene no la conoce
 * en detalle (Fase 2). [F2-P2]
 * ============================================================ */

class ThreatAbejas extends Threat {
  constructor(scene) {
    super(scene, 'abejas');
    this.group = scene.physics.add.group();
    this.acc = 0;
    this.max = 8;
  }

  vivas() { return this.group.getLength(); }

  congelar() {
    for (const b of this.group.getChildren()) b.setVelocity(0, 0);
  }

  spawnBee() {
    if (this.vivas() >= this.max) return;
    const v = this.scene.ventana;
    const b = this.group.create(v.x, v.y + 30, 'abeja');
    b.setDepth(400).setCircle(7);
    b.t = Math.random() * 6;
    b.setVelocity(Phaser.Math.Between(-40, 40), 60);
  }

  recibirImpacto(x, y, r) {
    const scene = this.scene;
    let mato = false;
    for (const b of [...this.group.getChildren()]) {
      if (Phaser.Math.Distance.Between(x, y, b.x, b.y) < r) {
        // Chispas/estrellitas
        for (let i = 0; i < 4; i++) {
          const s = scene.add.circle(b.x, b.y, 3, [0xffe45e, 0xffffff, 0xff9ecb][i % 3]).setDepth(950);
          scene.tweens.add({ targets: s, x: b.x + Phaser.Math.Between(-26, 26),
            y: b.y + Phaser.Math.Between(-26, 26), alpha: 0, duration: 280,
            onComplete: () => s.destroy() });
        }
        b.destroy();
        mato = true;
      }
    }
    if (mato) GameAudio.playSFX('abeja_muerta');
  }

  amenazaParaConi() {
    const c = this.scene.coni;
    for (const b of this.group.getChildren()) {
      if (Phaser.Math.Distance.Between(b.x, b.y, c.x, c.y) < 260) return 1;
    }
    return 0;
  }

  estaResuelta() {
    return !this.scene.ventana.abierta && this.vivas() === 0;
  }

  actualizar(dt, now) {
    const scene = this.scene;
    // Spawner: ventana abierta → 1 abeja cada 4s
    if (scene.ventana.abierta) {
      this.acc += dt;
      if (this.acc >= 4) { this.acc = 0; this.spawnBee(); }
    } else {
      this.acc = 0;
    }
    // Persiguen a Coni con oscilación + dañan a Jazmín al tacto
    for (const b of this.group.getChildren()) {
      b.t += dt;
      const dx = scene.coni.x - b.x, dy = scene.coni.y - b.y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = 75;
      const px = -dy / d, py = dx / d; // perpendicular (revoloteo)
      const wob = Math.sin(b.t * 7) * 45;
      b.setVelocity(dx / d * sp + px * wob, dy / d * sp + py * wob);
      b.setDepth(b.y);
      b.setScale(1 + Math.sin(b.t * 20) * 0.12); // aleteo
      if (Phaser.Math.Distance.Between(b.x, b.y, scene.player.x, scene.player.y) < 26 && now > scene.danoCD) {
        scene.hurtJazmin(now);
      }
    }
  }
}
