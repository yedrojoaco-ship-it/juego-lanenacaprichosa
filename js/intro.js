/* ============================================================
 * intro.js — IntroScene: 3 viñetas (bici → auto → mansión).
 * Click o Espacio avanza. Luego Menu.
 * ============================================================ */

class IntroScene extends Phaser.Scene {
  constructor() { super('Intro'); }

  create() {
    this.cameras.main.setBackgroundColor('#160b2e');
    this.cameras.main.fadeIn(300);
    this.idx = 0;
    this.viñetas = [
      { emoji: '🚲💨', titulo: '¡Tarde al trabajo!', texto: 'Jazmín pedalea a toda velocidad.\nHoy cuida a Coni en la mansión.' },
      { emoji: '🚗💥', titulo: '¡Casi la atropellan!', texto: 'Un auto frena de golpe.\n"¡Mirá por dónde vas!" — grita Jazmín.' },
      { emoji: '🏠💜', titulo: 'La mansión', texto: 'Llega exhausta. Coni duerme...\npor ahora. ¡Que empiece el caos!' },
    ];
    this.emoji = this.add.text(480, 200, '', { fontSize: '110px' }).setOrigin(0.5);
    this.titulo = this.add.text(480, 330, '', {
      fontFamily: '"Kenney Future", "Trebuchet MS"', fontSize: '40px', color: '#ffd93b',
      stroke: '#3a1c00', strokeThickness: 6,
    }).setOrigin(0.5);
    this.texto = this.add.text(480, 420, '', {
      fontFamily: 'Trebuchet MS', fontSize: '22px', color: '#f2ecff', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);
    this.hint = this.add.text(480, 540, 'Click o ESPACIO para continuar · S para saltar', {
      fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#9d8cff',
    }).setOrigin(0.5);
    this.mostrar();
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.keyS = this.input.keyboard.addKey('S');
    this.input.on('pointerdown', () => this.avanzar());
  }

  mostrar() {
    const v = this.viñetas[this.idx];
    this.cameras.main.fadeIn(200);
    this.emoji.setText(v.emoji).setScale(0.5).setAlpha(0);
    this.tweens.add({ targets: this.emoji, scale: 1, alpha: 1, duration: 350, ease: 'Back.easeOut' });
    this.titulo.setText(v.titulo);
    this.texto.setText(v.texto);
  }

  avanzar() {
    GameAudio.playSFX('agarre');
    this.idx++;
    if (this.idx >= this.viñetas.length) {
      this.cameras.main.fadeOut(250);
      this.time.delayedCall(260, () => this.scene.start('Menu'));
    } else {
      this.mostrar();
    }
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keyS)) this.scene.start('Menu');
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) this.avanzar();
  }
}
