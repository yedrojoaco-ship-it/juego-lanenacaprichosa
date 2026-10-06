/* ============================================================
 * LA NENA CAPRICHOSA — base modular top-down 2.5D (Phaser 3)
 * Archivos: index.html + style.css + js/*.js + game.js
 * Música: /assets/music/track1.mp3, track2.mp3 (HTML5 Audio)
 * Abrir directamente en navegador (sin build, sin módulos).
 * ============================================================ */

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
    // Mansión compacta (datos en js/data-mansion.js)
    const WORLD_W = MANSION.W, WORLD_H = MANSION.H;
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    // Pasto exterior texturizado
    this.add.tileSprite(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 'pat-pasto');

    // Losa de la mansión (x40..920, y40..640)
    this.add.rectangle(480, 340, 900, 620, 0xd9b48f).setStrokeStyle(6, 0x7a5a3a).setDepth(-1.8);

    this.walls = this.physics.add.staticGroup();
    const W = this.walls;
    // Muros con vanos de puerta + marcos visibles (datos en MANSION)
    for (const [x, y, w] of MANSION.murosH) { solid(this, W, x, y, w, 16); wall3D(this, x, y, w, 16, 0x8a6a4a, 0xc09a6a); }
    for (const [x, y, h] of MANSION.murosV) { solid(this, W, x, y, 16, h); wall3D(this, x, y, 16, h, 0x9a7650, 0xc09a6a); }
    for (const [x, y, w] of MANSION.puertas) puerta(this, x, y, w);

    // ---- Pisos texturizados con bordes ----
    const texPorAlias = { madera: texMadera, azulejo: texAzulejo, pasto: 'pat-pasto' };
    for (const [x, y, w, h, tex, borde] of MANSION.pisos) floorTextured(this, x, y, w, h, texPorAlias[tex], borde);
    // Alfombra ovalada cuarto de Coni (calidez cartoon)
    this.add.ellipse(460, 220, 200, 100, 0xff9ecb, 0.85).setDepth(-1)
      .setStrokeStyle(5, 0xd94f7a, 0.9);
    // Alfombra living
    this.add.ellipse(505, 520, 230, 120, 0xc9a06a, 0.9).setDepth(-1)
      .setStrokeStyle(5, 0x8a5a2a, 0.9);

    for (const [x, y, t] of MANSION.labels) roomLabel(this, x, y, t);

    // ---- Muebles (visual 2.5D + colisión) ----
    const furn = (x, y, w, h, base, top) => {
      box25D(this, x, y, w, h, base, top);
      solid(this, W, x, y, w, h);
    };

    // Muebles con colisión (datos en MANSION.muebles) + deco a medida
    for (const [x, y, w, h, base, top] of MANSION.muebles) furn(x, y, w, h, base, top);

    // Cuarto de Coni: respaldo, manta, almohada y juguetes sobre la cama/caja
    this.add.rectangle(400, 128, 90, 14, 0x7a4ec9).setDepth(129); // respaldo
    this.add.rectangle(400, 200, 70, 44, 0xff9ecb).setDepth(191); // manta
    this.add.rectangle(400, 150, 60, 20, 0xffffff).setDepth(192); // almohada
    this.add.circle(500, 250, 7, 0xff4d4d).setDepth(3); // juguetes (sin colisión)
    this.add.rectangle(540, 180, 12, 12, 0x63c78a).setDepth(3);
    this.add.circle(348, 262, 6, 0xffe45e).setDepth(3).setStrokeStyle(2, 0x8a6a1a);

    // Hab 1 y Hab 3: almohadas sobre sus camas
    this.add.rectangle(160, 150, 60, 20, 0xffffff).setDepth(191);
    this.add.rectangle(770, 150, 60, 20, 0xffffff).setDepth(191);

    // Living: plantas (maceta con colisión + follaje) y TV
    const planta = (x, y) => {
      furn(x, y, 30, 30, 0xa8542e, 0xc07a4e);         // maceta
      this.add.circle(x - 8, y - 18, 12, 0x3f9d4e).setDepth(y + 1);
      this.add.circle(x + 8, y - 20, 14, 0x55b75e).setDepth(y + 1.1);
      this.add.circle(x, y - 28, 10, 0x6cc478).setDepth(y + 1.2);
    };
    planta(352, 394); planta(658, 616);
    // TV (objeto especial, guardamos referencia)
    const TV = MANSION.tv;
    box25D(this, TV.x, TV.y, 110, 30, 0x222233, 0x44445e);
    solid(this, W, TV.x, TV.y, 110, 34);
    this.tvScreen = this.add.rectangle(TV.x, TV.y - 12, 88, 24, 0x111111).setDepth(410);
    this.tvLight = this.add.circle(TV.x, TV.y, 70, 0x66ccff, 0).setDepth(409);
    this.tvZone = this.add.zone(...TV.zone, 200, 140);
    this.physics.add.existing(this.tvZone);

    // Patio: piscina de cerámica (borde tileado + agua + brillo)
    dropShadow(this, 480, 730, 300, 0);
    this.add.tileSprite(480, 730, 308, 118, 'pat-ceramica').setDepth(1);
    const pool = this.add.rectangle(480, 730, 308, 118, 0xffffff, 0)
      .setStrokeStyle(8, 0xffffff, 1).setDepth(1.4);
    this.add.rectangle(480, 730, 278, 92, 0x2fa8dd).setDepth(1.1);
    this.add.rectangle(480, 730, 250, 70, 0x6fd8ff).setDepth(1.15);
    this.add.ellipse(410, 700, 90, 20, 0xffffff, 0.45).setDepth(1.2); // reflejo
    solid(this, W, 480, 730, 300, 110);
    // Postes del cerco
    for (let fx = 80; fx <= 880; fx += 80) {
      this.add.rectangle(fx, 810, 12, 22, 0x6a4a2a).setDepth(56);
    }

    // ---- Raqueta (Hab 1, sobre el estante) ----
    this.pickups = [];
    const raqView = this.physics.add.sprite(...MANSION.spawn.raqueta, 'raqueta').setDepth(200);
    this.pickups.push({ id: 'raqueta', label: 'Raqueta', view: raqView, carried: false });
    // Chocolate en la cocina (sobre la mesa comedor)
    const chocoKey = this.textures.exists('chocolate') ? 'chocolate' : 'choco';
    const chView = this.physics.add.sprite(...MANSION.spawn.choco, chocoKey).setDepth(800);
    this.pickups.push({ id: 'chocolate', label: 'Chocolate', view: chView, carried: false });

    // ---- Ventana de Coni (muro norte, marco visible, inicia Abierta) ----
    this.ventana = { x: MANSION.ventana.x, y: MANSION.ventana.y, abierta: true, frame: null, glass: null };
    this.ventana.frame = this.add.rectangle(MANSION.ventana.x, MANSION.ventana.y, 110, 22, 0x7a5a3a).setDepth(120);
    this.ventana.glass = this.add.rectangle(MANSION.ventana.x, MANSION.ventana.y, 94, 12, 0x9be8ff).setDepth(121);
    this.ventana.label = roomLabel(this, MANSION.ventana.x, MANSION.ventana.y + 24, 'Ventana: Abierta');

    this.spawnJazmin();

    this.spawnConi();
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

    this.spawnEnjambre();

    // Cámara cercana en Jazmín + viñeta CSS en bordes + fade
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(MANSION.zoom);
    this.cameras.main.fadeIn(400);

    // ---- Controles ----
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyE = this.input.keyboard.addKey('E');
    this.keyN = this.input.keyboard.addKey('N');
    this.keyB = this.input.keyboard.addKey('B');
    this.keyX = this.input.keyboard.addKey('X');
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.winHint = this.add.text(MANSION.ventana.x, MANSION.ventana.y + 72, '[Espacio] Abrir/Cerrar ventana', {
      fontFamily: 'Trebuchet MS', fontSize: '14px',
      backgroundColor: '#000000aa', color: '#9be8ff', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setDepth(700).setVisible(false);

    // Indicación visual TV
    this.tvHint = this.add.text(...MANSION.tv.hint, 'Pulsa E para la TV', {
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

  /* ---- Ventana Coni ---- */
  toggleVentana() {
    const v = this.ventana;
    v.abierta = !v.abierta;
    v.glass.setFillStyle(v.abierta ? 0x9be8ff : 0x2b3a55);
    v.frame.setFillStyle(v.abierta ? 0x7a5a3a : 0x4a3320);
    if (v.label) v.label.setText(v.abierta ? 'Ventana: Abierta' : 'Ventana: Cerrada');
    GameAudio.playSFX('ventana');
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
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown) vx = -1;
    if (this.cursors.right.isDown) vx = 1;
    if (this.cursors.up.isDown) vy = -1;
    if (this.cursors.down.isDown) vy = 1;
    this.updateJazminMove(vx, vy);

    // Manos: el objeto sigue a Jazmín, prompt [X] y tecla X (ver js/jazmin.js)
    const near = this.updateHandsCarry();
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
    const d = Phaser.Math.Distance.Between(p.x, p.y, ...MANSION.tv.zone);
    this.nearTV = d < 150;
    this.tvHint.setVisible(this.nearTV);
    if (this.hud) this.hud.classList.toggle('hidden', !this.nearTV);

    if (Phaser.Input.Keyboard.JustDown(this.keyE) && this.nearTV) GameAudio.toggleTV();
    if (Phaser.Input.Keyboard.JustDown(this.keyN) && this.nearTV) GameAudio.next();
    if (Phaser.Input.Keyboard.JustDown(this.keyB) && this.nearTV) GameAudio.prev();
  }
}

/* ---------------- Boot ---------------- */
for (const m of window.__mixins || []) m(MainScene); // entidades (js/*.js)

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
