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

    const titulo = this.add.text(width / 2, height / 2 - 90, 'LA NENA CAPRICHOSA', {
      fontFamily: 'Trebuchet MS', fontSize: '52px', color: '#ffd93b',
      stroke: '#3a1c00', strokeThickness: 8
    }).setOrigin(0.5);
    this.tweens.add({ targets: titulo, y: height / 2 - 82, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(width / 2, height / 2 - 30, 'La Mansión · Top-Down 2.5D', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#cfc3ff'
    }).setOrigin(0.5);

    const mkBtn = (dy, color, hover, label, size, nivel) => {
      const b = this.add.rectangle(width / 2, height / 2 + dy, 300, 46, color)
        .setStrokeStyle(3, 0xffffff).setInteractive({ useHandCursor: true });
      this.add.text(width / 2, height / 2 + dy, label, {
        fontFamily: 'Trebuchet MS', fontSize: size + 'px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);
      b.on('pointerover', () => b.setFillStyle(hover));
      b.on('pointerout', () => b.setFillStyle(color));
      b.on('pointerdown', () => {
        this.cameras.main.fadeOut(250);
        this.time.delayedCall(260, () => this.scene.start('Main', { nivel }));
      });
    };
    mkBtn(-30, 0x6c4dff, 0x8a6fff, '▶  NIVEL 1 · ABEJAS', 22, 1);
    mkBtn(24, 0xd94f2e, 0xf06a3e, '🔥  NIVEL 2 · COCINA', 22, 2);
    mkBtn(78, 0x2e9ac9, 0x4ebae9, '💧  NIVEL 3 · BAÑO', 22, 3);
    mkBtn(132, 0x8a4ec9, 0xa56ee9, '🔋  NIVEL 4 · JUGUETES', 22, 4);
    mkBtn(186, 0x3f9d4e, 0x55bb62, '🏊  NIVEL 5 · PATIO', 22, 5);

    this.add.text(width / 2, height - 22,
      'Flechas mover · X: agarrar/soltar · Espacio: usar · E: TV', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#9d8cff'
    }).setOrigin(0.5);
  }
}
