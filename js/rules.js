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
  const fall = (f.calma ? 6 : 2.5) * dt; // TV con música infantil calma
  return clamp100(bar + rise - fall);
}
function calmarConi(bar, n) {
  return clamp100(bar - (n || 40));
}
/* ---- Fuego Nivel 2: intensidad 0-100, extintor resta 34 por uso ---- */
function fuegoTick(v, dt, f) {
  const rise = 5 * dt;
  const baja = f.uso ? 34 : 0;
  return clamp100(v + rise - baja);
}
/* ---- Agua Nivel 3: sube con canilla abierta, baja al cerrarla ---- */
function aguaTick(v, dt, f) {
  return clamp100(v + (f.abierta ? 4 * dt : -2 * dt));
}
/* ---- Reglas de fin de nivel (puras, testeables) ----
 * La victoria es genérica: amenazas resueltas + Coni calma.
 * (ThreatSystem.todasResueltas() + coniBar < 50 en el update.)
 */
function checkDerrota(vida, coniBar) {
  if (vida <= 0) return 'vida';
  if (coniBar >= 100) return 'coni';
  return null;
}
