/* ============================================================
 * boot.js — BootScene: carga PNG, fallbacks y anims, luego Menu.
 * Texturas y anims son globales: Main las reutiliza. [F1-P6]
 * ============================================================ */

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Sprites opcionales en /assets/images/ (ver assets/images/LEEME.txt).
    // Si un PNG falta, el loader falla en silencio y se usa el fallback
    // dibujado por código en ensureFallbackTextures(): el juego nunca se rompe.
    this.load.spritesheet('jazmin', 'assets/images/jazmin.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('coni', 'assets/images/coni.png');
    this.load.image('raqueta', 'assets/images/raqueta.png');
    this.load.image('chocolate', 'assets/images/chocolate.png');
    this.load.image('peluche', 'assets/images/peluche.png');
    this.load.image('abeja', 'assets/images/abeja.png');
    this.load.image('extintor', 'assets/images/extintor.png');
    this.load.image('mopa', 'assets/images/mopa.png');
    this.load.image('flotador', 'assets/images/flotador.png');
    this.load.image('piso_madera', 'assets/images/piso_madera.png');
    this.load.image('piso_azulejo', 'assets/images/piso_azulejo.png');
    this.load.on('loaderror', (f) => console.warn('[Assets] falta:', f.key, '→ fallback por código'));
  }

  create() {
    this.ensureFallbackTextures();
    this.setupJazminAnims();
    makeFloorPatterns(this);
    this.scene.start('Menu');
  }

  /* Fallbacks cartoon detallados (bordes, luces y sombras). Solo los que falten. */
  ensureFallbackTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const T = (key) => !this.textures.exists(key);

    if (T('jazmin')) {
      // Jazmín 32x48: zapatos, vestido rosa, cabeza, pelo castaño con brillo
      g.fillStyle(0x3a2a20, 1); g.fillRoundedRect(9, 42, 6, 4, 2); g.fillRoundedRect(17, 42, 6, 4, 2);
      g.fillStyle(0xffd9b3, 1); g.fillRect(10, 36, 4, 7); g.fillRect(18, 36, 4, 7);
      g.fillStyle(0xd94f7a, 1); g.fillRoundedRect(7, 24, 18, 16, 5);      // vestido
      g.fillStyle(0xff5d8f, 1); g.fillRoundedRect(8, 24, 16, 13, 5);      // luz vestido
      g.fillStyle(0xffffff, 1); g.fillTriangle(16, 24, 11, 29, 21, 29);   // cuello
      g.fillStyle(0xffffff, 1); g.fillCircle(16, 32, 1.4); g.fillCircle(16, 36, 1.4);
      g.fillStyle(0xffc9a3, 1); g.fillCircle(5, 31, 4); g.fillCircle(27, 31, 4); // manos
      g.fillStyle(0xff5d8f, 1); g.fillCircle(6, 29, 4); g.fillCircle(26, 29, 4); // mangas
      g.lineStyle(2, 0x4a2c12, 1); g.strokeCircle(16, 15, 11);            // outline cabeza
      g.fillStyle(0xffd9b3, 1); g.fillCircle(16, 15, 11);
      g.fillStyle(0x6b3f1d, 1); g.fillCircle(16, 11, 12);                 // pelo
      g.fillStyle(0x8a5527, 1); g.fillCircle(16, 8, 9);
      g.fillStyle(0xa06a35, 1); g.fillEllipse(12, 5, 8, 4);               // brillo pelo
      g.fillStyle(0x6b3f1d, 1); g.fillRect(3, 11, 5, 19); g.fillRect(24, 11, 5, 19); // coletas
      g.fillStyle(0xff9eb0, 0.9); g.fillCircle(9, 19, 2.4); g.fillCircle(23, 19, 2.4); // mejillas
      g.fillStyle(0x222222, 1); g.fillCircle(12, 16, 2); g.fillCircle(20, 16, 2);
      g.fillStyle(0xffffff, 1); g.fillCircle(12.7, 15.3, 0.7); g.fillCircle(20.7, 15.3, 0.7);
      g.lineStyle(1.5, 0x7a3b2e, 1); g.lineBetween(14, 21, 18, 21);       // sonrisa
      g.generateTexture('jazmin', 32, 48);
    }
    if (T('raqueta')) {
      g.clear();
      g.lineStyle(5, 0x4a1a7a, 1); g.strokeEllipse(16, 12, 20, 24);       // aro borde
      g.lineStyle(3, 0x8a2be2, 1); g.strokeEllipse(16, 12, 18, 22);       // aro luz
      g.lineStyle(1.5, 0xffffff, 0.95);
      g.lineBetween(8, 12, 24, 12); g.lineBetween(16, 1, 16, 23);
      g.lineBetween(10, 5, 22, 19); g.lineBetween(22, 5, 10, 19);
      g.fillStyle(0x5a3a1a, 1); g.fillRoundedRect(13, 24, 6, 20, 2);      // mango
      g.fillStyle(0x9a6a3a, 1); g.fillRoundedRect(14, 24, 3, 20, 1);
      g.fillStyle(0x222222, 1); g.fillRect(13, 40, 6, 4);                // grip
      g.generateTexture('raqueta', 32, 48);
    }
    if (T('coni')) {
      g.clear();
      g.fillStyle(0x7a4ec9, 1); g.fillRoundedRect(7, 23, 16, 15, 4);      // vestido
      g.fillStyle(0xb678ff, 1); g.fillRoundedRect(8, 23, 14, 12, 4);
      g.fillStyle(0xffffff, 0.9); g.fillRoundedRect(11, 27, 8, 8, 2);    // delantal
      g.lineStyle(2, 0x8a6a1a, 1); g.strokeCircle(15, 14, 10);
      g.fillStyle(0xffd9b3, 1); g.fillCircle(15, 14, 10);
      g.fillStyle(0xffe45e, 1); g.fillCircle(15, 9, 10);                  // pelo rubio
      g.fillStyle(0xfff3a0, 1); g.fillEllipse(11, 6, 8, 4);              // brillo
      g.fillStyle(0xffc93b, 1); g.fillRect(4, 9, 4, 16); g.fillRect(22, 9, 4, 16);
      g.fillStyle(0xff9eb0, 0.9); g.fillCircle(9, 18, 2); g.fillCircle(21, 18, 2);
      g.fillStyle(0x222222, 1); g.fillCircle(11, 15, 2); g.fillCircle(19, 15, 2);
      g.fillStyle(0xffffff, 1); g.fillCircle(11.7, 14.3, 0.7); g.fillCircle(19.7, 14.3, 0.7);
      g.generateTexture('coni', 30, 42);
    }
    if (T('chocolate')) {
      g.clear();
      g.fillStyle(0xc9962e, 1); g.fillRoundedRect(1, 12, 26, 10, 3);      // papel dorado
      g.fillStyle(0x3a1c08, 1); g.fillRoundedRect(2, 3, 24, 16, 3);       // tableta borde
      g.fillStyle(0x5a2d0c, 1); g.fillRoundedRect(3, 4, 22, 14, 2);
      g.fillStyle(0x7a4520, 1); g.fillRect(4, 5, 9, 5);                   // brillo onzas
      g.lineStyle(2, 0x8a5527, 1);
      g.lineBetween(10, 4, 10, 18); g.lineBetween(18, 4, 18, 18);
      g.generateTexture('chocolate', 28, 24);
    }
    if (T('choco')) { // alias legacy
      g.clear();
      g.fillStyle(0x5a2d0c, 1); g.fillRoundedRect(2, 4, 24, 16, 3);
      g.generateTexture('choco', 28, 24);
    }
    if (T('abeja')) {
      g.clear();
      g.fillStyle(0xffffff, 0.9); g.fillCircle(5, 3, 4); g.fillCircle(12, 3, 4);
      g.lineStyle(1, 0x9ab8c4, 1); g.strokeCircle(5, 3, 4); g.strokeCircle(12, 3, 4);
      g.lineStyle(1.5, 0x4a2c12, 1); g.strokeEllipse(9, 9, 14, 10);
      g.fillStyle(0xffc93b, 1); g.fillEllipse(9, 9, 14, 10);
      g.fillStyle(0x222222, 1); g.fillRect(6, 5, 3, 9); g.fillRect(11, 5, 3, 9);
      g.fillStyle(0x222222, 1); g.fillTriangle(16, 9, 19, 9, 16, 12);     // aguijón
      g.fillStyle(0x222222, 1); g.fillCircle(4, 8, 1.4);                 // ojo
      g.generateTexture('abeja', 20, 16);
    }
    if (T('extintor')) { // matafuegos rojo con manguera
      g.clear();
      g.fillStyle(0x8a1a1a, 1); g.fillRoundedRect(9, 12, 14, 28, 5);
      g.fillStyle(0xd93b3b, 1); g.fillRoundedRect(11, 12, 8, 28, 4); // brillo
      g.fillStyle(0x333333, 1); g.fillRect(13, 6, 6, 6);            // válvula
      g.lineStyle(3, 0x222222, 1); g.lineBetween(16, 10, 26, 22);    // manguera
      g.fillStyle(0xdddddd, 1); g.fillRect(5, 22, 22, 6);           // etiqueta
      g.generateTexture('extintor', 32, 44);
    }
    if (T('mopa')) { // palo + cabezal de hilos
      g.clear();
      g.fillStyle(0x9a6a3a, 1); g.fillRect(12, 2, 4, 22);              // palo
      g.fillStyle(0xd8cfb8, 1); g.fillTriangle(14, 22, 4, 38, 24, 38); // cabezal
      g.lineStyle(1.5, 0x9a9a8a, 1);
      g.lineBetween(14, 24, 8, 38); g.lineBetween(14, 24, 20, 38); g.lineBetween(14, 24, 14, 38);
      g.generateTexture('mopa', 28, 40);
    }
    if (T('flotador')) { // anillo salvavidas rojo y blanco
      g.clear();
      g.lineStyle(9, 0xd93b3b, 1); g.strokeCircle(15, 15, 10);
      g.lineStyle(9, 0xffffff, 1);
      g.lineBetween(15, 1, 15, 8); g.lineBetween(15, 22, 15, 29);
      g.lineBetween(1, 15, 8, 15); g.lineBetween(22, 15, 29, 15);
      g.generateTexture('flotador', 30, 30);
    }
    g.destroy();
  }

  /* Anims 4 direcciones si jazmin.png es spritesheet 4x4 (32x48, 16 frames) */
  setupJazminAnims() {
    this.jazSprite = false;
    try {
      const fr = this.textures.get('jazmin');
      if (fr && fr.frameTotal >= 16 && !this.anims.exists('jaz-abajo')) {
        const mk = (k, s) => this.anims.create({ key: k,
          frames: this.anims.generateFrameNumbers('jazmin', { start: s, end: s + 3 }),
          frameRate: 9, repeat: -1 });
        mk('jaz-abajo', 0); mk('jaz-izq', 4); mk('jaz-der', 8); mk('jaz-arriba', 12);
        this.jazSprite = true;
      }
    } catch (e) { this.jazSprite = false; }
  }
}
