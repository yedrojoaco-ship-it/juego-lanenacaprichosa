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

    this.add.text(width / 2, height / 2 - 90, 'LA NENA CAPRICHOSA', {
      fontFamily: 'Trebuchet MS', fontSize: '52px', color: '#ffd93b',
      stroke: '#3a1c00', strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 30, 'La Mansión · Top-Down 2.5D', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#cfc3ff'
    }).setOrigin(0.5);

    const btn = this.add.rectangle(width / 2, height / 2 + 60, 260, 70, 0x6c4dff)
      .setStrokeStyle(4, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height / 2 + 60, '▶  JUGAR', {
      fontFamily: 'Trebuchet MS', fontSize: '32px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x8a6fff));
    btn.on('pointerout', () => btn.setFillStyle(0x6c4dff));
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(260, () => this.scene.start('Main'));
    });

    this.add.text(width / 2, height / 2 + 130,
      'Flechas mover · X: agarrar/soltar · Espacio: usar · E: TV', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#9d8cff'
    }).setOrigin(0.5);
  }
}
