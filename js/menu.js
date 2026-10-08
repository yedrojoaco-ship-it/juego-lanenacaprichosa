/* ============================================================
 * menu.js — MenuScene: título + botón JUGAR → Main. [F1-P6]
 * ============================================================ */

class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#160b2e');
    this.cameras.main.fadeIn(400);

    // Fondo cartoon simple
    for (let i = 0; i < 60; i++) {
      this.add.circle(
        Phaser.Math.Between(0, width), Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3), 0x6c4dff, 0.35
      );
    }

    const titulo = this.add.text(width / 2, height / 2 - 220, 'LA NENA CAPRICHOSA', {
      fontFamily: '"Kenney Future", "Trebuchet MS"', fontSize: '44px', color: '#ffd93b',
      stroke: '#3a1c00', strokeThickness: 8
    }).setOrigin(0.5);
    this.tweens.add({ targets: titulo, y: height / 2 - 212, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(width / 2, height / 2 - 168, 'La Mansión · Top-Down 2.5D', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#cfc3ff'
    }).setOrigin(0.5);

    const mkBtn = (dy, label, nivel) => {
      const abierto = nivel <= SDK.maxNivel;
      const b = this.add.image(width / 2, height / 2 + dy, 'ui-btn').setDisplaySize(230, 62).setInteractive({ useHandCursor: true });
      if (!abierto) b.setTint(0x555566);
      this.add.text(width / 2, height / 2 + dy, (abierto ? label : '🔒  NIVEL ' + nivel), {
        fontFamily: '"Kenney Future", "Trebuchet MS"', fontSize: '19px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);
      b.on('pointerover', () => { if (abierto) b.setTint(0xddccff); });
      b.on('pointerout', () => { b.clearTint(); if (!abierto) b.setTint(0x555566); });
      b.on('pointerdown', () => {
        if (!abierto) { GameAudio.playSFX('dano'); return; }
        this.cameras.main.fadeOut(250);
        this.time.delayedCall(260, () => this.scene.start('Main', { nivel }));
      });
    };
    mkBtn(-96, '▶  NIVEL 1 · ABEJAS', 1);
    mkBtn(-24, '🔥  NIVEL 2 · COCINA', 2);
    mkBtn(48, '💧  NIVEL 3 · BAÑO', 3);
    mkBtn(120, '🔋  NIVEL 4 · JUGUETES', 4);
    mkBtn(192, '🏊  NIVEL 5 · PATIO', 5);

    this.add.text(width / 2, height - 22,
      'Flechas mover · X: agarrar/soltar · Espacio: usar · E: TV', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#9d8cff'
    }).setOrigin(0.5);
  }
}
