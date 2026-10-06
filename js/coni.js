/* Mixin: se registra en window.__mixins y game.js lo aplica a MainScene. */
window.__mixins = window.__mixins || [];
window.__mixins.push(function (MainScene) {
/* ============================================================
 * coni.js — NPC Coni: spawn, barra de Insoportable, IA errática
 * y chocolate. Métodos de MainScene. [F1-P5]
 * ============================================================ */

MainScene.prototype.spawnConi = function () {
  // ---- Coni NPC (dormida en su cama, barra 0-100) ----
  this.coni = this.physics.add.sprite(...MANSION.spawn.coni, 'coni').setDepth(301);
  this.coni.body.setSize(18, 10);
  this.coni.body.setOffset(6, 32);
  this.coniShadow = this.add.ellipse(MANSION.spawn.coni[0], MANSION.spawn.coni[1] + 22, 24, 9, 0x000000, 0.3).setDepth(300);
  this.physics.add.collider(this.coni, this.walls);
  this.coniBar = 0;
  this.coniTarget = null;
  this.coniIdle = 0;
  // Barra sutil sobre Coni
  this.coniBarBg = this.add.rectangle(0, 0, 52, 7, 0x000000, 0.55).setDepth(850);
  this.coniBarFill = this.add.rectangle(0, 0, 50, 5, 0x63c78a).setDepth(851);
  this.coniState = this.add.text(0, 0, '💤', { fontSize: '18px' }).setOrigin(0.5).setDepth(852);
};

MainScene.prototype.updateConi = function (dt) {
  // Amenaza: la aporta el ThreatSystem (abejas hoy, fuego/agua mañana)
  const amenaza = this.threats.nivelAmenaza() > 0 || this.ventana.abierta || GameAudio.tvOn;
  this.coniBar = coniTick(this.coniBar, dt, { amenaza });
  const bar = this.coniBar;

  // Velocidad según barra
  const speed = bar <= 30 ? 0 : bar <= 70 ? 95 : 175;
  if (speed === 0) {
    this.coni.setVelocity(0, 0);
    this.coniState.setText(this.hands && this.hands.id === 'chocolate' && this.nearConi() ? '🍫' : '💤');
  } else {
    this.coniIdle -= dt;
    const arrived = this.coniTarget &&
      Phaser.Math.Distance.Between(this.coni.x, this.coni.y, this.coniTarget.x, this.coniTarget.y) < 14;
    if (!this.coniTarget || arrived || this.coniIdle <= 0) {
      this.coniTarget = Phaser.Utils.Array.GetRandom(MANSION.wander);
      this.coniTarget = { x: this.coniTarget[0], y: this.coniTarget[1] };
      this.coniIdle = 6;
    }
    this.physics.moveTo(this.coni, this.coniTarget.x, this.coniTarget.y, speed);
    this.coniState.setText(bar > 70 ? '🤪' : '😠');
    if (bar > 70 && Math.random() < dt * 3) { // rastro caótico
      const s = this.add.circle(this.coni.x, this.coni.y - 20, 3, 0xffe45e, 0.9).setDepth(849);
      this.tweens.add({ targets: s, alpha: 0, y: s.y - 18, duration: 400, onComplete: () => s.destroy() });
    }
  }

  // Visuales barra
  const col = bar > 70 ? 0xff4d4d : bar > 30 ? 0xffb93b : 0x63c78a;
  this.coniBarBg.setPosition(this.coni.x, this.coni.y - 38);
  this.coniBarFill.setPosition(this.coni.x - (50 - 50 * bar / 100) / 2, this.coni.y - 38)
    .setDisplaySize(50 * bar / 100, 5).setFillStyle(col);
  this.coniState.setPosition(this.coni.x + 30, this.coni.y - 40);
  this.coni.setDepth(this.coni.y);
  this.coniShadow.setPosition(this.coni.x, this.coni.y + 20);
  this.hudBarFill.setDisplaySize(216 * bar / 100, 12).setFillStyle(col);
  this.hudBarFill.x = 150 - (216 - 216 * bar / 100) / 2;
};

/* ---- Coni: calmar ---- */
MainScene.prototype.nearConi = function () {
  return Phaser.Math.Distance.Between(this.player.x, this.player.y, this.coni.x, this.coni.y) < 95;
};

MainScene.prototype.feedChocolate = function () {
  const it = this.hands;
  if (!it || it.id !== 'chocolate') return;
  it.view.destroy(); // Coni se lo come
  this.pickups.splice(this.pickups.indexOf(it), 1);
  this.hands = null;
  this.coniBar = calmarConi(this.coniBar); // -40 de golpe
  this.coniState.setText('😋');
  GameAudio.playSFX('comer');
};

});
