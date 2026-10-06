/* ============================================================
 * LA NENA CAPRICHOSA — base modular top-down 2.5D (Phaser 3)
 * Archivos: index.html + style.css + js/*.js + game.js
 * Música: /assets/music/track1.mp3, track2.mp3 (HTML5 Audio)
 * Abrir directamente en navegador (sin build, sin módulos).
 * ============================================================ */

/* ---------------- MainScene ---------------- */
class MainScene extends Phaser.Scene {
  constructor() { super('Main'); }

  init(data) {
    this.nivel = (data && data.nivel) || 1; // 1: abejas · 2: fuego cocina
  }  create() {
    const fr0 = this.textures.get('jazmin');
    this.jazSprite = !!(fr0 && fr0.frameTotal >= 16 && this.anims.exists('jaz-abajo'));
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
    // Chocolates en la heladera (stock 3, GDD) + peluche en lo de Coni
    const chocoKey = this.textures.exists('chocolate') ? 'chocolate' : 'choco';
    for (const pos of MANSION.spawn.chocos) {
      const v = this.physics.add.sprite(pos[0], pos[1], chocoKey).setDepth(800);
      this.pickups.push({ id: 'chocolate', label: 'Chocolate', view: v, carried: false });
    }
    const pelKey = this.textures.exists('peluche') ? 'peluche' : 'coni';
    const pelView = this.physics.add.sprite(...MANSION.spawn.peluche, pelKey).setDepth(200).setTint(0xffc0cb);
    this.pickups.push({ id: 'peluche', label: 'Peluche', view: pelView, carried: false });
    // Extintor en el lavadero (solo Nivel 2)
    if (this.nivel >= 2) {
      const extView = this.physics.add.sprite(...MANSION.spawn.extintor, 'extintor').setDepth(200);
      this.pickups.push({ id: 'extintor', label: 'Extintor', view: extView, carried: false });
    }

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
    // Notificaciones flotantes (cola, una por vez)
    this.notiCola = [];
    this.notiFlags = {};
    this.notiTxt = this.add.text(480, 84, '', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', fontStyle: 'bold', color: '#ffe45e',
      backgroundColor: '#000000aa', padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(950).setAlpha(0);

    // Amenazas según nivel (Fase 2+: ThreatSystem extensible)
    this.threats = new ThreatSystem(this);
    this.enjambre = null;
    this.fuego = null;
    if (this.nivel === 1) this.enjambre = this.threats.registrar(new ThreatAbejas(this));
    else this.fuego = this.threats.registrar(new ThreatFuego(this));

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

  /* ---- HUD fijo ---- */
  notify(texto) {
    this.notiCola.push(texto);
    this.mostrarNoti();
  }

  mostrarNoti() {
    if (this.notiTxt.alpha > 0 || this.notiCola.length === 0 || this.fin) return;
    this.notiTxt.setText(this.notiCola.shift()).setAlpha(1);
    this.tweens.add({ targets: this.notiTxt, alpha: 0, delay: 2200, duration: 500 });
  }

  refreshHUD() {
    const pct = this.vida / this.VIDA_MAX;
    const col = pct > 0.5 ? 0x63c78a : pct > 0.25 ? 0xffb93b : 0xff4d4d;
    this.hudVidaFill.setDisplaySize(216 * pct, 11).setFillStyle(col);
    this.hudVidaFill.x = 150 - (216 - 216 * pct) / 2;
    this.hudVidaNum.setText('' + this.vida);
    const label = this.hands ? ((ICONS[this.hands.id] || '') + ' ' + this.hands.label) : '✋ vacías';
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
    if (this.enjambre) this.enjambre.congelar();
    GameAudio.playSFX('derrota');
    const msg = motivo === 'vida' ? '¡Jazmín se quedó sin vida!' : '¡Coni se volvió incontrolable!';
    this.endOverlay('DERROTA', '#ff6b6b', msg);
    this.bigButton(480, 380, '🔄 REINTENTAR NIVEL', () => this.scene.restart({ nivel: this.nivel }));
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
    this.bigButton(330, 420, '🔄 REPETIR', () => this.scene.restart({ nivel: this.nivel }));
    this.bigButton(640, 420, '➡ SIGUIENTE NIVEL', () => {
      if (this.nivel < 2) {
        this.scene.start('Main', { nivel: this.nivel + 1 });
      } else { // Nivel 3 aún no existe: aviso visible, el overlay sigue ahí
        const t = this.add.text(480, 480, 'Nivel 3 próximamente…', {
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
    const donaCalma = this.hands && (this.hands.id === 'chocolate' || this.hands.id === 'peluche') && this.nearConi();
    if (Phaser.Input.Keyboard.JustDown(this.keyX)) {
      if (donaCalma) this.feedChocolate(); else this.handleX(near);
    }

    // Ventana: hint + Espacio (solo si no va a raquetear)
    const nv = this.nearVentana();
    this.winHint.setVisible(nv);
    if (nv) this.winHint.setText(this.ventana.abierta ? '[Espacio] Cerrar ventana' : '[Espacio] Abrir ventana');

    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      if (donaCalma) this.feedChocolate();
      else if (this.hands && this.hands.id === 'raqueta') this.swing();
      else if (this.hands && this.hands.id === 'extintor' && this.fuego && this.fuego.usarExtintor()) { /* apagando */ }
      else if (this.fuego && this.fuego.silenciarAlarma()) { /* alarma off */ }
      else if (nv) this.toggleVentana();
    }

    // Coni + amenazas (dt en segundos)
    const dt = Math.min((delta || 16.6) / 1000, 0.05);
    this.updateConi(dt);
    this.threats.actualizar(dt, time || 0);
    this.refreshHUD();

    // Notificaciones flotantes (una vez por nivel)
    if (!this.fin) {
      if (!this.notiFlags.ventana && this.enjambre && this.ventana.abierta && this.enjambre.vivas() > 0) {
        this.notiFlags.ventana = true; this.notify('¡Cierra la ventana! 🐝');
      }
      if (!this.notiFlags.fuego && this.fuego && this.fuego.intensidad > 0) {
        this.notiFlags.fuego = true; this.notify('¡Fuego en la cocina! 🔥');
      }
      if (!this.notiFlags.coni && this.coniBar > 70) {
        this.notiFlags.coni = true; this.notify('¡Coni está incontrolable! 🍫');
      }
      if (!this.notiFlags.vida && this.vida <= 30 && this.vida > 0) {
        this.notiFlags.vida = true; this.notify('¡Jazmín necesita cuidarse! ❤');
      }
      this.mostrarNoti();
    }

    // Fin de nivel genérico: amenazas resueltas + Coni calma
    if (!this.fin) {
      const causa = checkDerrota(this.vida, this.coniBar);
      if (causa) this.gameOver(causa);
      else if (this.threats.todasResueltas() && this.coniBar < 50) this.victory();
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
  scene: [BootScene, MenuScene, MainScene]
};

new Phaser.Game(config);
