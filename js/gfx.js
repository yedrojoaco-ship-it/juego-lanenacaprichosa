/* ============================================================
 * gfx.js — Helpers visuales cartoon 2.5D (sombras, muros, pisos)
 * Globales: dropShadow, box25D, wall3D, puerta, tilePattern,
 * makeFloorPatterns, floorTextured, solid, roomLabel. [F1-P3]
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
