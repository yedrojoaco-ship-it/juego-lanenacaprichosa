/* ============================================================
 * threats.js — Sistema de eventos reutilizable (Fase 2).
 * Cada amenaza futura (fuego, agua, juguetes…) es una subclase
 * de Threat registrada en ThreatSystem. MainScene itera sin
 * conocer detalles: agregar niveles no toca el loop. [F2-P1]
 * ============================================================ */

class Threat {
  constructor(scene, id) {
    this.scene = scene;
    this.id = id;
    this.activa = true;
  }
  actualizar(dt, now) {}            // por frame (dt segundos, now ms)
  amenazaParaConi() { return 0; }   // 0..1 (0 = tranquila)
  estaResuelta() { return false; }
  recibirImpacto(x, y, r) {}        // raquetazo u otra acción con área
}

class ThreatSystem {
  constructor(scene) {
    this.scene = scene;
    this.lista = [];
  }
  registrar(t) { this.lista.push(t); return t; }
  actualizar(dt, now) {
    for (const t of this.lista) if (t.activa) t.actualizar(dt, now);
  }
  nivelAmenaza() { // máximo entre amenazas activas
    let m = 0;
    for (const t of this.lista) if (t.activa) m = Math.max(m, t.amenazaParaConi());
    return m;
  }
  todasResueltas() {
    return this.lista.length > 0 && this.lista.every((t) => t.estaResuelta());
  }
  recibirImpacto(x, y, r) {
    for (const t of this.lista) if (t.activa) t.recibirImpacto(x, y, r);
  }
}
