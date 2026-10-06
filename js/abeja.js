/* Mixin: se registra en window.__mixins y game.js lo aplica a MainScene. */
window.__mixins = window.__mixins || [];
window.__mixins.push(function (MainScene) {
/* ============================================================
 * abeja.js — Enjambre: spawn por ventana, persecución con
 * revoloteo y raquetazo. Métodos de MainScene. [F1-P5]
 * ============================================================ */

MainScene.prototype.spawnEnjambre = function () {
  // ---- Abejas ----
  this.bees = this.physics.add.group();
  this.beeAcc = 0;
  this.BEE_MAX = 8;
};

MainScene.prototype.spawnBee = function () {
  if (this.bees.getLength() >= this.BEE_MAX) return;
  const b = this.bees.create(MANSION.ventana.x, MANSION.ventana.y + 30, 'abeja');
  b.setDepth(400).setCircle(7);
  b.t = Math.random() * 6;
  b.setVelocity(Phaser.Math.Between(-40, 40), 60);
};

MainScene.prototype.killBeesAt = function (x, y, r) {
  let mato = false;
  for (const b of [...this.bees.getChildren()]) {
    if (Phaser.Math.Distance.Between(x, y, b.x, b.y) < r) {
      // Chispas/estrellitas
      for (let i = 0; i < 4; i++) {
        const s = this.add.circle(b.x, b.y, 3, [0xffe45e, 0xffffff, 0xff9ecb][i % 3]).setDepth(950);
        this.tweens.add({ targets: s, x: b.x + Phaser.Math.Between(-26, 26),
          y: b.y + Phaser.Math.Between(-26, 26), alpha: 0, duration: 280,
          onComplete: () => s.destroy() });
      }
      b.destroy();
      mato = true;
    }
  }
  if (mato) GameAudio.playSFX('abeja_muerta');
};

MainScene.prototype.updateBees = function (dt, now) {
  // Spawner: ventana abierta → 1 abeja cada 4s
  if (this.ventana.abierta) {
    this.beeAcc += dt;
    if (this.beeAcc >= 4) { this.beeAcc = 0; this.spawnBee(); }
  } else {
    this.beeAcc = 0;
  }
  // Persiguen a Coni con oscilación + dañan a Jazmín al tacto
  for (const b of this.bees.getChildren()) {
    b.t += dt;
    const dx = this.coni.x - b.x, dy = this.coni.y - b.y;
    const d = Math.hypot(dx, dy) || 1;
    const sp = 75;
    const px = -dy / d, py = dx / d; // perpendicular (revoloteo)
    const wob = Math.sin(b.t * 7) * 45;
    b.setVelocity(dx / d * sp + px * wob, dy / d * sp + py * wob);
    b.setDepth(b.y);
    if (Phaser.Math.Distance.Between(b.x, b.y, this.player.x, this.player.y) < 26 && now > this.danoCD) {
      this.hurtJazmin(now);
    }
  }
};

});
