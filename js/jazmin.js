/* Mixin: se registra en window.__mixins y game.js lo aplica a MainScene. */
window.__mixins = window.__mixins || [];
window.__mixins.push(function (MainScene) {
/* ============================================================
 * jazmin.js — Protagonista: spawn, movimiento 8-dir, manos,
 * raquetazo y daño. Métodos de MainScene. [F1-P5]
 * ============================================================ */

MainScene.prototype.spawnJazmin = function () {
  // ---- Protagonista: Jazmín (hitbox en los pies → camina por detrás) ----
  this.player = this.physics.add.sprite(...MANSION.spawn.jugador, 'jazmin');
  this.player.setCollideWorldBounds(true).setDepth(600);
  this.player.body.setSize(20, 12);   // bounding box pequeño abajo
  this.player.body.setOffset(6, 36);
  // Sombra blanda bajo los pies (sigue al jugador)
  this.shadow = softShadow(this, ...MANSION.spawn.jugador, 26);
  this.shadow.setDepth(599);
  this.physics.add.collider(this.player, this.walls);

  this.facing = { x: 0, y: 1 }; // última dirección (para el raquetazo)
  this.hands = null;            // 1 solo objeto: {id,label,view,carried}
  this.PICK_R = 70;

  // Prompt [X] reutilizable (objeto cercano o manos)
  this.pickPrompt = this.add.text(0, 0, '[X]', {
    fontFamily: 'Trebuchet MS', fontSize: '18px', fontStyle: 'bold',
    backgroundColor: '#000000cc', color: '#ffe45e', padding: { x: 6, y: 2 }
  }).setOrigin(0.5).setDepth(800).setVisible(false);
  this.handTag = this.add.text(0, 0, '', {
    fontFamily: 'Trebuchet MS', fontSize: '13px',
    backgroundColor: '#000000aa', color: '#ffffff', padding: { x: 6, y: 2 }
  }).setOrigin(0.5).setDepth(800).setVisible(false);
};

MainScene.prototype.updateJazminMove = function (vx, vy) {
  const p = this.player;
  const speed = 230;
  // 8 direcciones normalizadas (vx, vy ya vienen -1/0/1)
  if (vx !== 0 && vy !== 0) { vx *= Math.SQRT1_2; vy *= Math.SQRT1_2; }
  p.setVelocity(vx * speed, vy * speed);

  // Animación: spritesheet 4 dirs si hay PNG, si no flip + bote cartoon
  if (vx !== 0 || vy !== 0) {
    this.facing = { x: vx !== 0 ? Math.sign(vx) : 0, y: vy !== 0 ? Math.sign(vy) : 0 };
  }
  if (this.jazSprite) {
    if (vx !== 0 || vy !== 0) {
      const ax = Math.abs(vx), ay = Math.abs(vy);
      const k = ax > ay ? (vx < 0 ? 'jaz-izq' : 'jaz-der')
        : (vy < 0 ? 'jaz-arriba' : 'jaz-abajo');
      if (p.anims.getName() !== k || !p.anims.isPlaying) p.anims.play(k, true);
      p.setFlipX(false); p.setScale(1);
    } else {
      p.anims.stop(); p.setTexture('jazmin', 0);
    }
    if ((vx !== 0 || vy !== 0) && Math.floor(this.time.now / 280) % 2 === 0) GameAudio.playPaso();
  } else {
    if (vx < 0) p.setFlipX(true);
    if (vx > 0) p.setFlipX(false);
    if (vx !== 0 || vy !== 0) {
      p.setScale(1 + Math.sin(this.time.now / 120) * 0.03);
      if (Math.floor(this.time.now / 280) % 2 === 0) GameAudio.playPaso();
    } else {
      p.setScale(1);
    }
  }
  // Orden Y para sensación de volumen 2.5D
  p.setDepth(p.y);
  this.shadow.setPosition(p.x, p.y + 22);
  if ((vx !== 0 || vy !== 0) && Math.random() < 0.06) { // polvillo al correr
    const s = this.add.circle(p.x - this.facing.x * 10, p.y + 18, 3, 0xffffff, 0.35).setDepth(p.y - 1);
    this.tweens.add({ targets: s, alpha: 0, scale: 1.8, duration: 350, onComplete: () => s.destroy() });
  }
};

/* Devuelve el pickup cercano (para handleX). */
MainScene.prototype.updateHandsCarry = function () {
  const p = this.player;
  // Objeto en manos sigue a Jazmín
  if (this.hands) {
    const icon = ICONS[this.hands.id] || '🎾';
    this.hands.view.setPosition(p.x + 14, p.y - 6).setDepth(p.y + 1);
    this.handTag.setVisible(true)
      .setPosition(p.x, p.y - 42)
      .setText(icon + ' ' + this.hands.label);
  } else {
    this.handTag.setVisible(false);
  }

  // Prompt [X] sobre el objeto cercano (o [X] cambiar si ya lleva algo)
  const near = this.nearestPickup();
  if (near) {
    this.pickPrompt.setVisible(true).setPosition(near.view.x, near.view.y - 38);
    this.pickPrompt.setText(this.hands ? '[X] cambiar' : '[X] agarrar');
  } else if (this.hands) {
    this.pickPrompt.setVisible(true).setPosition(p.x, p.y - 58).setText('[X] soltar');
  } else {
    this.pickPrompt.setVisible(false);
  }
  return near;
};

/* ---- Inventario / manos (1 objeto) ---- */
MainScene.prototype.nearestPickup = function () {
  let best = null, bd = this.PICK_R;
  for (const it of this.pickups) {
    if (it.carried) continue;
    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, it.view.x, it.view.y);
    if (d < bd) { bd = d; best = it; }
  }
  return best;
};

MainScene.prototype.pickup = function (it) {
  it.carried = true;
  this.hands = it;
  if (it.view.body) it.view.body.enable = false; // no estorba mientras se lleva
  this.tweens.add({ targets: it.view, scale: 1.35, duration: 110, yoyo: true }); // pop
  GameAudio.playSFX('agarre');
};

MainScene.prototype.dropAt = function (x, y) {
  const it = this.hands;
  if (!it) return;
  it.carried = false;
  it.view.setPosition(x, y + 12).setDepth(y);
  if (it.view.body) { it.view.body.enable = true; it.view.body.reset(x, y + 12); }
  this.hands = null;
  GameAudio.playSFX('soltar');
};

MainScene.prototype.handleX = function (near) {
  if (!this.hands) {
    if (near) this.pickup(near); // agarrar
  } else if (near) {
    this.dropAt(this.player.x, this.player.y); // swap: soltar actual…
    this.pickup(near);                          // …y agarrar el nuevo
  } else {
    this.dropAt(this.player.x, this.player.y); // soltar en el suelo
  }
};

/* ---- Raquetazo ---- */
MainScene.prototype.swing = function () {
  const p = this.player;
  const hx = p.x + this.facing.x * 42, hy = p.y + this.facing.y * 42;
  // Hitbox temporal al frente (lista para enemigos futuros)
  this.hitbox = this.add.rectangle(hx, hy, 62, 62, 0xffffff, 0.35).setDepth(p.y + 2);
  this.tweens.add({ targets: this.hitbox, alpha: 0, scale: 1.4, duration: 160,
    onComplete: () => this.hitbox && this.hitbox.destroy() });
  // Sacudida cartoon de Jazmín
  this.tweens.add({ targets: p, scale: 1.18, duration: 80, yoyo: true });
  GameAudio.playSFX('raquetazo');
  this.threats.recibirImpacto(hx, hy, 62);
};

/* ---- Daño a Jazmín (n puntos, parpadeo) ---- */
MainScene.prototype.hurtJazmin = function (now, n) {
  if (this.fin) return;
  this.danoCD = now + 900;
  this.vida = Math.max(0, this.vida - (n || 15));
  this.player.setTintFill(0xff4d4d);
  this.tweens.add({ targets: this.player, alpha: 0.25, duration: 80, yoyo: true, repeat: 3,
    onComplete: () => { this.player.setAlpha(1); this.player.clearTint(); } });
  this.cameras.main.shake(130, 0.004); // sacudida de cámara
  GameAudio.playSFX('dano');
  this.refreshHUD();
};

});
