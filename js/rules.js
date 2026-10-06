/* ============================================================
 * rules.js — Lógica pura del juego (sin Phaser, testeable con node)
 * Se carga con <script> antes que game.js. [F1-P1]
 * ============================================================ */

/* ---- Lógica pura Coni (testeable, sin Phaser) ---- */
function clamp100(v) {
  return Math.max(0, Math.min(100, v));
}
function coniTick(bar, dt, f) {
  const rise = f.amenaza ? 8 * dt : 0;
  const fall = 2.5 * dt;
  return clamp100(bar + rise - fall);
}
function calmarConi(bar) {
  return clamp100(bar - 40);
}
/* ---- Reglas de fin de Nivel 1 (puras, testeables) ---- */
function checkDerrota(vida, coniBar) {
  if (vida <= 0) return 'vida';
  if (coniBar >= 100) return 'coni';
  return null;
}
function checkVictoria(ventanaCerrada, abejas, coniBar) {
  return ventanaCerrada && abejas === 0 && coniBar < 50;
}
