/* ============================================================
 * LA NENA CAPRICHOSA — base modular top-down 2.5D (Phaser 3)
 * Archivos: index.html + style.css + game.js
 * Música: /assets/music/track1.mp3, track2.mp3 (HTML5 Audio)
 * Abrir directamente en navegador (sin build, sin módulos).
 * ============================================================ */

/* ---------------- Helpers 2.5D ---------------- */
function dropShadow(scene, x, y, w, depth) {
  // Doble elipse = sombra caída suave hacia el sur
  const s1 = scene.add.ellipse(x, y + 8, w + 14, 20, 0x000000, 0.18);
  const s2 = scene.add.ellipse(x, y + 5, w + 6, 13, 0x000000, 0.22);
  s1.setDepth(depth); s2.setDepth(depth + 0.05);
  return [s1, s2];
}

function box25D(scene, x, y, w, h, base, top) {
  dropShadow(scene, x, y + h / 2, w, y - 1);
  // Cuerpo (frente) con borde oscuro + tapa clara (volumen) + filete de luz
  const front = scene.add.rectangle(x, y + 8, w, h, base).setStrokeStyle(2, 0x2b1c10, 0.45);
  const tapa = scene.add.rectangle(x, y - h / 2 + 8, w, 14, top).setStrokeStyle(2, 0x2b1c10, 0.35);
  const luz = scene.add.rectangle(x, y - h / 2 + 3, w - 6, 3, 0xffffff, 0.5);
  front.setDepth(y); tapa.setDepth(y + 0.1); luz.setDepth(y + 0.15);
  return { front, tapa };
}

function wall3D(scene, x, y, w, h, base, luzC) {
  // Pared top-down 3/4: sombra al sur + cara con luz cenital en el borde norte
  dropShadow(scene, x, y + h / 2, w, -0.5);
  const body = scene.add.rectangle(x, y, w, h, base).setStrokeStyle(2, 0x2b1c10, 0.5);
  const filo = (w >= h)
    ? scene.add.rectangle(x, y - h / 2 + 3, w - 4, 5, luzC, 1)
    : scene.add.rectangle(x - w / 2 + 3, y, 5, h - 4, luzC, 1);
  body.setDepth(50); filo.setDepth(50.1);
  return body;
}

function puerta(scene, x, y, w) {
  // Marco de puerta visible (sin colisión = paso libre): umbral + 2 jambas
  scene.add.rectangle(x, y, w, 18, 0xe8d0a0).setDepth(0.5);
  scene.add.rectangle(x, y, w, 18).setFillStyle(0xffffff, 0).setStrokeStyle(2, 0x6a4a2a, 0.9).setDepth(0.6);
  const j1 = scene.add.rectangle(x - w / 2 + 5, y, 11, 24, 0x6a4a2a).setStrokeStyle(1.5, 0x2b1c10, 0.6);
  const j2 = scene.add.rectangle(x + w / 2 - 5, y, 11, 24, 0x6a4a2a).setStrokeStyle(1.5, 0x2b1c10, 0.6);
  j1.setDepth(55); j2.setDepth(55);
}

/* Patrones de piso generados (fallback visual; se tapan si hay PNG) */
function tilePattern(scene, key, painter, sw, sh) {
  if (scene.textures.exists(key)) return key;
  sw = sw || 64; sh = sh || 64;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  painter(g, sw, sh);
  g.generateTexture(key, sw, sh);
  g.destroy();
  return key;
}

function makeFloorPatterns(scene) {
  tilePattern(scene, 'pat-madera', (g, w, h) => {
    g.fillStyle(0xb9834f, 1); g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) {
      g.fillStyle(0x9a683c, 1); g.fillRect(0, y, w, 2);          // junta tablón
      g.fillStyle(0xd09a5e, 1); g.fillRect(0, y + 2, w, 1);       // luz
      const off = (y / 16 % 2) * 32;
      g.fillStyle(0x9a683c, 1); g.fillRect((off + 10) % w, y, 2, 16); // veta vertical
    }
  });
  tilePattern(scene, 'pat-azulejo', (g, w, h) => {
    g.fillStyle(0xe6f0f4, 1); g.fillRect(0, 0, w, h);
    g.lineStyle(2, 0xb4c9d4, 1);
    for (let i = 0; i <= w; i += 16) { g.lineBetween(i, 0, i, h); g.lineBetween(0, i, w, i); }
    g.fillStyle(0xffffff, 0.55); g.fillTriangle(0, 0, 22, 0, 0, 22); // brillo
  });
  tilePattern(scene, 'pat-pasto', (g, w, h) => {
    g.fillStyle(0x55a75e, 1); g.fillRect(0, 0, w, h);
    g.fillStyle(0x48924f, 1);
    for (let i = 0; i < 26; i++) g.fillCircle((i * 37) % w, (i * 53) % h, 2);
    g.fillStyle(0x6cc478, 1);
    for (let i = 0; i < 14; i++) g.fillCircle((i * 41 + 9) % w, (i * 29 + 7) % h, 1.5);
  });
  tilePattern(scene, 'pat-ceramica', (g, w, h) => {
    g.fillStyle(0x7fd4e8, 1); g.fillRect(0, 0, w, h);
    g.lineStyle(2, 0xffffff, 0.8);
    for (let i = 0; i <= w; i += 21) { g.lineBetween(i, 0, i, h); g.lineBetween(0, i, w, i); }
  });
}

function floorTextured(scene, x, y, w, h, tex, borde) {
  scene.add.tileSprite(x, y, w, h, tex).setDepth(-2);
  scene.add.rectangle(x, y, w, h).setFillStyle(0xffffff, 0)
    .setStrokeStyle(4, borde, 0.8).setDepth(-1.5);
}

function solid(scene, group, x, y, w, h) {
  const z = scene.add.zone(x, y, w, h);
  group.add(z);
  scene.physics.add.existing(z, true); // estático
  return z;
}

function roomLabel(scene, x, y, text) {
  return scene.add.text(x, y, text, {
    fontFamily: 'Trebuchet MS', fontSize: '22px',
    color: '#ffffff', stroke: '#000000', strokeThickness: 4
  }).setOrigin(0.5).setDepth(2).setAlpha(0.9);
}

/* ---------------- MenuScene ---------------- */
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

/* ---------------- MainScene ---------------- */
class MainScene extends Phaser.Scene {
  constructor() { super('Main'); }

  preload() {
    // Sprites opcionales en /assets/images/ (ver assets/images/LEEME.txt).
    // Si un PNG falta, el loader falla en silencio y se usa el fallback
    // dibujado por código en ensureFallbackTextures(): el juego nunca se rompe.
    this.load.spritesheet('jazmin', 'assets/images/jazmin.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('coni', 'assets/images/coni.png');
    this.load.image('raqueta', 'assets/images/raqueta.png');
    this.load.image('chocolate', 'assets/images/chocolate.png');
    this.load.image('abeja', 'assets/images/abeja.png');
    this.load.image('piso_madera', 'assets/images/piso_madera.png');
    this.load.image('piso_azulejo', 'assets/images/piso_azulejo.png');
    this.load.on('loaderror', (f) => console.warn('[Assets] falta:', f.key, '→ fallback por código'));
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

  create() {
    this.ensureFallbackTextures();
    this.setupJazminAnims();
    makeFloorPatterns(this);
    const texMadera = this.textures.exists('piso_madera') ? 'piso_madera' : 'pat-madera';
    const texAzulejo = this.textures.exists('piso_azulejo') ? 'piso_azulejo' : 'pat-azulejo';
    // Mansión compacta 960x860 (pasillos estrechos, escala acogedora)
    const WORLD_W = 960, WORLD_H = 860;
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    // Pasto exterior texturizado
    this.add.tileSprite(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 'pat-pasto');

    // Losa de la mansión (x40..920, y40..640)
    this.add.rectangle(480, 340, 900, 620, 0xd9b48f).setStrokeStyle(6, 0x7a5a3a).setDepth(-1.8);

    this.walls = this.physics.add.staticGroup();
    const W = this.walls;
    // Muros horizontales [cx, y, w] grosor 16, con vanos de puerta ya descontados
    const murosH = [
      [480, 40, 880],            // norte exterior
      [91, 300, 102], [249, 300, 102],     // Hab1 | vano x142..198
      [366, 300, 132], [554, 300, 132],    // Coni | vano x432..488
      [681, 300, 122], [859, 300, 122],    // Hab3 | vano x742..798
      [96, 370, 112], [269, 370, 122],     // Cocina | vano x152..208
      [401, 370, 142], [604, 370, 152],    // Living | vano x472..528
      [726, 370, 92], [874, 370, 92],      // Lavadero | vano x772..828
      [256, 640, 432], [754, 640, 332],    // sur (puerta patio x472..588)
      [480, 810, 880],                     // cerco patio
    ];
    for (const [x, y, w] of murosH) { solid(this, W, x, y, w, 16); wall3D(this, x, y, w, 16, 0x8a6a4a, 0xc09a6a); }
    // Muros verticales [x, cy, h] grosor 16
    const murosV = [
      [40, 425, 770], [920, 425, 770],     // exteriores (llegan al cerco)
      [300, 170, 260], [620, 170, 260],    // tabiques cuartos
      [330, 505, 270], [680, 505, 270],    // tabiques abajo
    ];
    for (const [x, y, h] of murosV) { solid(this, W, x, y, 16, h); wall3D(this, x, y, 16, h, 0x9a7650, 0xc09a6a); }
    // Marcos de puerta visibles (paso libre por el vano)
    puerta(this, 170, 300, 56); puerta(this, 460, 300, 56); puerta(this, 770, 300, 56);
    puerta(this, 180, 370, 56); puerta(this, 500, 370, 56); puerta(this, 800, 370, 56);
    puerta(this, 530, 640, 116);

    // ---- Pisos texturizados con bordes ----
    floorTextured(this, 170, 172, 244, 240, texMadera, 0x7a5a3a);   // Hab 1 parquet
    floorTextured(this, 460, 172, 312, 240, texMadera, 0x6a4a8a);   // Coni parquet
    floorTextured(this, 770, 172, 284, 240, texMadera, 0x4a6a8a);   // Hab 3 parquet
    floorTextured(this, 480, 335, 864, 54, texMadera, 0x8a7a5a);    // pasillo estrecho
    floorTextured(this, 185, 505, 274, 254, texAzulejo, 0x6a8a9a);  // Cocina azulejos
    floorTextured(this, 505, 505, 334, 254, texMadera, 0x9a5a3a);   // Living parquet
    floorTextured(this, 800, 505, 224, 254, texAzulejo, 0x5a9aaa);  // Lavadero azulejos
    floorTextured(this, 480, 725, 864, 154, 'pat-pasto', 0x3f7a46); // Patio pasto
    // Alfombra ovalada cuarto de Coni (calidez cartoon)
    this.add.ellipse(460, 220, 200, 100, 0xff9ecb, 0.85).setDepth(-1)
      .setStrokeStyle(5, 0xd94f7a, 0.9);
    // Alfombra living
    this.add.ellipse(505, 520, 230, 120, 0xc9a06a, 0.9).setDepth(-1)
      .setStrokeStyle(5, 0x8a5a2a, 0.9);

    roomLabel(this, 170, 80, 'Habitación 1');
    roomLabel(this, 460, 80, 'Cuarto de Coni 💜');
    roomLabel(this, 770, 80, 'Habitación 3');
    roomLabel(this, 260, 612, 'Cocina');
    roomLabel(this, 620, 600, 'Living 📺');
    roomLabel(this, 800, 450, 'Lavadero');
    roomLabel(this, 480, 668, 'Patio · Piscina');

    // ---- Muebles (visual 2.5D + colisión) ----
    const furn = (x, y, w, h, base, top) => {
      box25D(this, x, y, w, h, base, top);
      solid(this, W, x, y, w, h);
    };

    // Cuarto de Coni: cama con respaldo, armario, caja y juguetes
    furn(400, 190, 90, 130, 0xb678ff, 0xd3aaff);       // cama Coni
    this.add.rectangle(400, 128, 90, 14, 0x7a4ec9).setDepth(129); // respaldo
    this.add.rectangle(400, 200, 70, 44, 0xff9ecb).setDepth(191); // manta
    this.add.rectangle(400, 150, 60, 20, 0xffffff).setDepth(192); // almohada
    furn(560, 82, 70, 36, 0x9a6a3a, 0xc08a4e);         // armario
    furn(585, 258, 44, 36, 0x4aa3df, 0x8ac8ef);        // caja de juguetes
    this.add.circle(500, 250, 7, 0xff4d4d).setDepth(3); // juguetes (sin colisión)
    this.add.rectangle(540, 180, 12, 12, 0x63c78a).setDepth(3);
    this.add.circle(348, 262, 6, 0xffe45e).setDepth(3).setStrokeStyle(2, 0x8a6a1a);

    // Hab 1: cama + estante (aquí la Raqueta)
    furn(160, 190, 90, 120, 0x5aa9ff, 0x9cc8ff);
    this.add.rectangle(160, 150, 60, 20, 0xffffff).setDepth(191);
    furn(110, 96, 80, 30, 0x9a6a3a, 0xc08a4e);         // estante
    // Hab 3: cama + caja
    furn(770, 190, 90, 120, 0x63c78a, 0xa5e6bd);
    this.add.rectangle(770, 150, 60, 20, 0xffffff).setDepth(191);
    furn(855, 100, 44, 40, 0xc08a4e, 0xe0aa6e);

    // Cocina: mesadas en L + heladera + comedor con 4 sillas
    furn(140, 402, 190, 40, 0xb9c2cc, 0xe6ecf2);       // mesada norte
    furn(70, 500, 44, 170, 0xb9c2cc, 0xe6ecf2);        // mesada oeste
    furn(285, 402, 50, 70, 0xdff3ff, 0xffffff);        // heladera
    furn(185, 545, 95, 60, 0x9a6a3a, 0xc08a4e);        // mesa comedor
    furn(185, 498, 28, 26, 0x7a5a3a, 0xa87c4e);        // sillas
    furn(185, 592, 28, 26, 0x7a5a3a, 0xa87c4e);
    furn(122, 545, 28, 26, 0x7a5a3a, 0xa87c4e);
    furn(248, 545, 28, 26, 0x7a5a3a, 0xa87c4e);

    // Living: mueble TV + sofás en L + mesa ratona + plantas
    const planta = (x, y) => {
      furn(x, y, 30, 30, 0xa8542e, 0xc07a4e);         // maceta
      this.add.circle(x - 8, y - 18, 12, 0x3f9d4e).setDepth(y + 1);
      this.add.circle(x + 8, y - 20, 14, 0x55b75e).setDepth(y + 1.1);
      this.add.circle(x, y - 28, 10, 0x6cc478).setDepth(y + 1.2);
    };
    furn(450, 548, 140, 45, 0xd94f4f, 0xff8a8a);       // sofá horizontal
    furn(562, 508, 45, 110, 0xc04444, 0xff8a8a);       // sofá vertical (L)
    furn(488, 488, 70, 40, 0x9a6a3a, 0xc08a4e);        // mesa ratona
    planta(352, 394); planta(658, 616);
    // TV (objeto especial, guardamos referencia)
    box25D(this, 505, 402, 110, 30, 0x222233, 0x44445e);
    solid(this, W, 505, 402, 110, 34);
    this.tvScreen = this.add.rectangle(505, 390, 88, 24, 0x111111).setDepth(410);
    this.tvLight = this.add.circle(505, 402, 70, 0x66ccff, 0).setDepth(409);
    this.tvZone = this.add.zone(505, 448, 200, 140);
    this.physics.add.existing(this.tvZone);

    // Lavadero: lavarropas + pileta
    furn(725, 420, 50, 50, 0xe6ecf2, 0xffffff);
    furn(725, 490, 50, 50, 0xe6ecf2, 0xffffff);
    furn(830, 580, 120, 45, 0xb9c2cc, 0xe6ecf2);       // pileta

    // Patio: piscina de cerámica (borde tileado + agua + brillo)
    dropShadow(this, 480, 730, 300, 0);
    this.add.tileSprite(480, 730, 308, 118, 'pat-ceramica').setDepth(1);
    const pool = this.add.rectangle(480, 730, 308, 118, 0xffffff, 0)
      .setStrokeStyle(8, 0xffffff, 1).setDepth(1.4);
    this.add.rectangle(480, 730, 278, 92, 0x2fa8dd).setDepth(1.1);
    this.add.rectangle(480, 730, 250, 70, 0x6fd8ff).setDepth(1.15);
    this.add.ellipse(410, 700, 90, 20, 0xffffff, 0.45).setDepth(1.2); // reflejo
    solid(this, W, 480, 730, 300, 110);
    furn(250, 730, 50, 90, 0xffd93b, 0xffe98a);
    furn(710, 730, 50, 90, 0xffd93b, 0xffe98a);
    // Postes del cerco
    for (let fx = 80; fx <= 880; fx += 80) {
      this.add.rectangle(fx, 810, 12, 22, 0x6a4a2a).setDepth(56);
    }

    // ---- Raqueta (Hab 1, sobre el estante) ----
    this.pickups = [];
    const raqView = this.physics.add.sprite(110, 74, 'raqueta').setDepth(200);
    this.pickups.push({ id: 'raqueta', label: 'Raqueta', view: raqView, carried: false });
    // Chocolate en la cocina (sobre la mesa comedor)
    const chocoKey = this.textures.exists('chocolate') ? 'chocolate' : 'choco';
    const chView = this.physics.add.sprite(185, 538, chocoKey).setDepth(800);
    this.pickups.push({ id: 'chocolate', label: 'Chocolate', view: chView, carried: false });

    // ---- Ventana de Coni (muro norte, marco visible, inicia Abierta) ----
    this.ventana = { x: 460, y: 40, abierta: true, frame: null, glass: null };
    this.ventana.frame = this.add.rectangle(460, 40, 110, 22, 0x7a5a3a).setDepth(120);
    this.ventana.glass = this.add.rectangle(460, 40, 94, 12, 0x9be8ff).setDepth(121);
    this.ventana.label = roomLabel(this, 460, 64, 'Ventana: Abierta');

    // ---- Protagonista: Jazmín (hitbox en los pies → camina por detrás) ----
    this.player = this.physics.add.sprite(480, 335, 'jazmin');
    this.player.setCollideWorldBounds(true).setDepth(600);
    this.player.body.setSize(20, 12);   // bounding box pequeño abajo
    this.player.body.setOffset(6, 36);
    // Sombra 2.5D bajo los pies (sigue al jugador)
    this.shadow = this.add.ellipse(480, 335, 26, 10, 0x000000, 0.3).setDepth(599);

    this.physics.add.collider(this.player, this.walls);

    // ---- Coni NPC (dormida en su cama, barra 0-100) ----
    this.coni = this.physics.add.sprite(380, 200, 'coni').setDepth(301);
    this.coni.body.setSize(18, 10);
    this.coni.body.setOffset(6, 32);
    this.coniShadow = this.add.ellipse(380, 222, 24, 9, 0x000000, 0.3).setDepth(300);
    this.physics.add.collider(this.coni, this.walls);
    this.coniBar = 0;
    this.coniTarget = null;
    this.coniIdle = 0;
    // Barra sutil sobre Coni
    this.coniBarBg = this.add.rectangle(0, 0, 52, 7, 0x000000, 0.55).setDepth(850);
    this.coniBarFill = this.add.rectangle(0, 0, 50, 5, 0x63c78a).setDepth(851);
    this.coniState = this.add.text(0, 0, '💤', { fontSize: '18px' }).setOrigin(0.5).setDepth(852);
    // HUD fijo esquina superior: Insoportable + vida Jazmín
    this.hudBarBg = this.add.rectangle(150, 24, 220, 18, 0x000000, 0.55).setScrollFactor(0).setDepth(900);
    this.hudBarFill = this.add.rectangle(150, 24, 216, 12, 0x63c78a).setScrollFactor(0).setDepth(901);
    this.hudBarTxt = this.add.text(16, 14, '😡 Coni', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#fff' }).setScrollFactor(0).setDepth(901);
    this.VIDA_MAX = 100;
    this.vida = this.VIDA_MAX;
    this.danoCD = 0;
    this.fin = null; // 'derrota' | 'victoria'
    // Barra de vida Jazmín (fija, no la mueve la cámara)
    this.add.text(16, 36, '❤', { fontSize: '16px' }).setScrollFactor(0).setDepth(901);
    this.hudVidaBg = this.add.rectangle(150, 46, 220, 16, 0x000000, 0.55).setScrollFactor(0).setDepth(900);
    this.hudVidaFill = this.add.rectangle(150, 46, 216, 11, 0x63c78a).setScrollFactor(0).setDepth(901);
    this.hudVidaNum = this.add.text(266, 37, '100', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#fff' }).setScrollFactor(0).setDepth(901);
    // Manos: objeto equipado, esquina superior derecha (fijo)
    this.hudHandsBg = this.add.rectangle(830, 30, 220, 30, 0x000000, 0.55).setScrollFactor(0).setDepth(900);
    this.hudHandsTxt = this.add.text(830, 30, '✋ vacías', { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#ffe45e' }).setOrigin(0.5).setScrollFactor(0).setDepth(901);
    this._handsLabel = '';

    // ---- Abejas ----
    this.bees = this.physics.add.group();
    this.beeAcc = 0;
    this.BEE_MAX = 8;

    // Cámara cercana en Jazmín + viñeta CSS en bordes + fade
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.55);
    this.cameras.main.fadeIn(400);

    // ---- Controles ----
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyE = this.input.keyboard.addKey('E');
    this.keyN = this.input.keyboard.addKey('N');
    this.keyB = this.input.keyboard.addKey('B');
    this.keyX = this.input.keyboard.addKey('X');
    this.keySpace = this.input.keyboard.addKey('SPACE');
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
    this.winHint = this.add.text(460, 112, '[Espacio] Abrir/Cerrar ventana', {
      fontFamily: 'Trebuchet MS', fontSize: '14px',
      backgroundColor: '#000000aa', color: '#9be8ff', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setDepth(700).setVisible(false);

    // Indicación visual TV
    this.tvHint = this.add.text(505, 590, 'Pulsa E para la TV', {
      fontFamily: 'Trebuchet MS', fontSize: '16px',
      backgroundColor: '#000000aa', color: '#ffe45e', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setDepth(700).setVisible(false);

    this.physics.add.overlap(this.player, this.tvZone, () => {
      this.nearTV = true;
    });

    // HUD HTML
    this.hud = document.getElementById('tv-hud');
    this.status = document.getElementById('tv-status');
    GameAudio.onChange = (s) => this.refreshTV(s);
    document.getElementById('btn-tv-toggle').onclick = () => GameAudio.toggleTV();
    document.getElementById('btn-tv-next').onclick = () => GameAudio.next();
    document.getElementById('btn-tv-prev').onclick = () => GameAudio.prev();
    this.refreshTV({ tvOn: false, name: GameAudio.trackName() });
  }

  /* ---- Inventario / manos (1 objeto) ---- */
  nearestPickup() {
    let best = null, bd = this.PICK_R;
    for (const it of this.pickups) {
      if (it.carried) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, it.view.x, it.view.y);
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }

  pickup(it) {
    it.carried = true;
    this.hands = it;
    if (it.view.body) it.view.body.enable = false; // no estorba mientras se lleva
    GameAudio.playSFX('agarre');
  }

  dropAt(x, y) {
    const it = this.hands;
    if (!it) return;
    it.carried = false;
    it.view.setPosition(x, y + 12).setDepth(y);
    if (it.view.body) { it.view.body.enable = true; it.view.body.reset(x, y + 12); }
    this.hands = null;
    GameAudio.playSFX('soltar');
  }

  handleX(near) {
    if (!this.hands) {
      if (near) this.pickup(near); // agarrar
    } else if (near) {
      this.dropAt(this.player.x, this.player.y); // swap: soltar actual…
      this.pickup(near);                          // …y agarrar el nuevo
    } else {
      this.dropAt(this.player.x, this.player.y); // soltar en el suelo
    }
  }

  /* ---- Ventana Coni ---- */
  toggleVentana() {
    const v = this.ventana;
    v.abierta = !v.abierta;
    v.glass.setFillStyle(v.abierta ? 0x9be8ff : 0x2b3a55);
    v.frame.setFillStyle(v.abierta ? 0x7a5a3a : 0x4a3320);
    if (v.label) v.label.setText(v.abierta ? 'Ventana: Abierta' : 'Ventana: Cerrada');
    GameAudio.playSFX('ventana');
  }

  /* ---- Raquetazo ---- */
  swing() {
    const p = this.player;
    const hx = p.x + this.facing.x * 42, hy = p.y + this.facing.y * 42;
    // Hitbox temporal al frente (lista para enemigos futuros)
    this.hitbox = this.add.rectangle(hx, hy, 62, 62, 0xffffff, 0.35).setDepth(p.y + 2);
    this.tweens.add({ targets: this.hitbox, alpha: 0, scale: 1.4, duration: 160,
      onComplete: () => this.hitbox && this.hitbox.destroy() });
    // Sacudida cartoon de Jazmín
    this.tweens.add({ targets: p, scale: 1.18, duration: 80, yoyo: true });
    GameAudio.playSFX('raquetazo');
    this.killBeesAt(hx, hy, 62);
  }

  /* ---- Coni: calmar ---- */
  nearConi() {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, this.coni.x, this.coni.y) < 95;
  }

  feedChocolate() {
    const it = this.hands;
    if (!it || it.id !== 'chocolate') return;
    it.view.destroy(); // Coni se lo come
    this.pickups.splice(this.pickups.indexOf(it), 1);
    this.hands = null;
    this.coniBar = calmarConi(this.coniBar); // -40 de golpe
    this.coniState.setText('😋');
    GameAudio.playSFX('comer');
  }

  /* ---- Abejas ---- */
  spawnBee() {
    if (this.bees.getLength() >= this.BEE_MAX) return;
    const b = this.bees.create(460, 70, 'abeja');
    b.setDepth(400).setCircle(7);
    b.t = Math.random() * 6;
    b.setVelocity(Phaser.Math.Between(-40, 40), 60);
  }

  killBeesAt(x, y, r) {
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
  }

  updateConi(dt) {
    // Amenaza: abejas cerca de Coni, ventana abierta o ruido (TV)
    let beesCerca = false;
    for (const b of this.bees.getChildren()) {
      if (Phaser.Math.Distance.Between(b.x, b.y, this.coni.x, this.coni.y) < 260) { beesCerca = true; break; }
    }
    const amenaza = beesCerca || this.ventana.abierta || GameAudio.tvOn;
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
        const pts = [[110, 200], [470, 220], [720, 200], [480, 335], [250, 470], [600, 470], [860, 520], [300, 700]];
        this.coniTarget = Phaser.Utils.Array.GetRandom(pts);
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
  }

  updateBees(dt, now) {
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
  }

  /* ---- Daño a Jazmín (-15, parpadeo) ---- */
  hurtJazmin(now) {
    if (this.fin) return;
    this.danoCD = now + 900;
    this.vida = Math.max(0, this.vida - 15);
    this.player.setTintFill(0xff4d4d);
    this.tweens.add({ targets: this.player, alpha: 0.25, duration: 80, yoyo: true, repeat: 3,
      onComplete: () => { this.player.setAlpha(1); this.player.clearTint(); } });
    GameAudio.playSFX('dano');
    this.refreshHUD();
  }

  /* ---- HUD fijo ---- */
  refreshHUD() {
    const pct = this.vida / this.VIDA_MAX;
    const col = pct > 0.5 ? 0x63c78a : pct > 0.25 ? 0xffb93b : 0xff4d4d;
    this.hudVidaFill.setDisplaySize(216 * pct, 11).setFillStyle(col);
    this.hudVidaFill.x = 150 - (216 - 216 * pct) / 2;
    this.hudVidaNum.setText('' + this.vida);
    const label = this.hands
      ? (this.hands.id === 'chocolate' ? '🍫 Chocolate' : '🎾 Raqueta')
      : '✋ vacías';
    if (label !== this._handsLabel) { this._handsLabel = label; this.hudHandsTxt.setText(label); }
  }

  /* ---- Fin de nivel ---- */
  bigButton(x, y, label, cb) {
    const c = this.add.container(x, y).setScrollFactor(0).setDepth(1002);
    const bg = this.add.rectangle(0, 0, 280, 54, 0x6c4dff).setStrokeStyle(3, 0xffffff);
    const t = this.add.text(0, 0, label, { fontFamily: 'Trebuchet MS', fontSize: '22px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    c.add([bg, t]);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(0x8a6fff));
    bg.on('pointerout', () => bg.setFillStyle(0x6c4dff));
    bg.on('pointerdown', cb);
    return c;
  }

  endOverlay(title, color, motivo) {
    const cx = 480, cy = 300;
    const dim = this.add.rectangle(cx, cy, 960, 600, 0x000000, 0.72).setScrollFactor(0).setDepth(1000);
    dim.setInteractive(); // bloquea clics al juego de fondo
    this.add.text(cx, cy - 90, title, { fontFamily: 'Trebuchet MS', fontSize: '54px', color, fontStyle: 'bold',
      stroke: '#000', strokeThickness: 8 }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
    this.add.text(cx, cy - 30, motivo, { fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#fff' }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
  }

  gameOver(motivo) {
    if (this.fin) return;
    this.fin = 'derrota';
    this.player.setVelocity(0, 0);
    this.coni.setVelocity(0, 0);
    for (const b of this.bees.getChildren()) b.setVelocity(0, 0);
    GameAudio.playSFX('derrota');
    const msg = motivo === 'vida' ? '¡Jazmín se quedó sin vida!' : '¡Coni se volvió incontrolable!';
    this.endOverlay('DERROTA', '#ff6b6b', msg);
    this.bigButton(480, 380, '🔄 REINTENTAR NIVEL', () => this.scene.restart());
  }

  victory() {
    if (this.fin) return;
    this.fin = 'victoria';
    this.player.setVelocity(0, 0);
    this.coni.setVelocity(0, 0);
    GameAudio.playSFX('victoria');
    this.endOverlay('¡NIVEL COMPLETADO!', '#7dff8a', 'La casa vuelve a la calma 💜');
    // Confeti (pantalla, se destruye solo; restart lo limpia)
    for (let i = 0; i < 90; i++) {
      const s = this.add.circle(Phaser.Math.Between(0, 960), -20,
        Phaser.Math.Between(3, 6), Phaser.Utils.Array.GetRandom([0xffe45e, 0xff9ecb, 0x7dff8a, 0x6fd8ff, 0xffffff]))
        .setScrollFactor(0).setDepth(1001);
      this.tweens.add({ targets: s, y: 640, x: s.x + Phaser.Math.Between(-80, 80),
        angle: 360, duration: Phaser.Math.Between(900, 2200),
        onComplete: () => s.destroy() });
    }
    this.bigButton(330, 420, '🔄 REPETIR', () => this.scene.restart());
    this.bigButton(640, 420, '➡ SIGUIENTE NIVEL', () => {
      if (this.scene.manager.keys['Level2']) {
        this.scene.start('Level2');
      } else { // Nivel 2 aún no existe: aviso visible, el overlay sigue ahí
        const t = this.add.text(480, 480, 'Nivel 2 próximamente…', {
          fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffe45e' })
          .setOrigin(0.5).setScrollFactor(0).setDepth(1002);
        this.tweens.add({ targets: t, alpha: 0, delay: 1200, duration: 500, onComplete: () => t.destroy() });
      }
    });
  }

  nearVentana() {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, this.ventana.x, this.ventana.y + 40) < 120;
  }

  refreshTV(s) {
    if (this.tvScreen) this.tvScreen.setFillStyle(s.tvOn ? 0x66ccff : 0x111111);
    if (this.tvLight) this.tvLight.setAlpha(s.tvOn ? 0.18 : 0);
    if (this.status) {
      this.status.textContent = s.tvOn
        ? '▶ Sonando: ' + s.name
        : '📺 TV apagada (' + s.name + ' en pausa)';
    }
  }

  update(time, delta) {
    if (this.fin) return; // overlay de fin: todo pausado salvo UI
    const p = this.player;
    const speed = 230;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown) vx = -1;
    if (this.cursors.right.isDown) vx = 1;
    if (this.cursors.up.isDown) vy = -1;
    if (this.cursors.down.isDown) vy = 1;

    // 8 direcciones normalizadas
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

    // Objeto en manos sigue a Jazmín
    if (this.hands) {
      const icon = this.hands.id === 'chocolate' ? '🍫' : '🎾';
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
    const donaChoco = this.hands && this.hands.id === 'chocolate' && this.nearConi();
    if (Phaser.Input.Keyboard.JustDown(this.keyX)) {
      if (donaChoco) this.feedChocolate(); else this.handleX(near);
    }

    // Ventana: hint + Espacio (solo si no va a raquetear)
    const nv = this.nearVentana();
    this.winHint.setVisible(nv);
    if (nv) this.winHint.setText(this.ventana.abierta ? '[Espacio] Cerrar ventana' : '[Espacio] Abrir ventana');

    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      if (donaChoco) this.feedChocolate();
      else if (this.hands && this.hands.id === 'raqueta') this.swing();
      else if (nv) this.toggleVentana();
    }

    // Coni + abejas (dt en segundos)
    const dt = Math.min((delta || 16.6) / 1000, 0.05);
    this.updateConi(dt);
    this.updateBees(dt, time || 0);
    this.refreshHUD();

    // Fin de Nivel 1
    if (!this.fin) {
      const causa = checkDerrota(this.vida, this.coniBar);
      if (causa) this.gameOver(causa);
      else if (checkVictoria(!this.ventana.abierta, this.bees.getLength(), this.coniBar)) this.victory();
    }

    // Orden Y para sensación de volumen 2.5D
    p.setDepth(p.y);
    this.shadow.setPosition(p.x, p.y + 22);

    // Proximidad TV (sin overlap permanente: chequeo por distancia)
    const d = Phaser.Math.Distance.Between(p.x, p.y, 505, 448);
    this.nearTV = d < 150;
    this.tvHint.setVisible(this.nearTV);
    if (this.hud) this.hud.classList.toggle('hidden', !this.nearTV);

    if (Phaser.Input.Keyboard.JustDown(this.keyE) && this.nearTV) GameAudio.toggleTV();
    if (Phaser.Input.Keyboard.JustDown(this.keyN) && this.nearTV) GameAudio.next();
    if (Phaser.Input.Keyboard.JustDown(this.keyB) && this.nearTV) GameAudio.prev();
  }
}

/* ---------------- Boot ---------------- */
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 600,
  backgroundColor: '#160b2e',
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  scene: [MenuScene, MainScene]
};

new Phaser.Game(config);
