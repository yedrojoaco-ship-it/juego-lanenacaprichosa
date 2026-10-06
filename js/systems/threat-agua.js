/* ============================================================
 * threat-agua.js — Amenaza Nivel 3: canilla abierta + charcos.
 * Subclase de Threat: MainScene no la conoce en detalle. [F5]
 * ============================================================ */

class ThreatAgua extends Threat {
  constructor(scene) {
    super(scene, 'agua');
    this.bano = { x: 830, y: 470 }; // bañera en el lavadero
    this.canilla = true; // Coni la dejó abierta y se escapó
    this.nivel = 20;
    this.charcos = []; // {x, y, view}
    this.acc = 0;
    this.puntos = [[480, 335], [250, 470], [600, 470], [185, 545], [800, 470], [750, 507]];
    // Bañera + agua + canilla (sólido solo en Nivel 3: no altera N1/N2)
    if (scene.nivel >= 3) {
      box25D(scene, this.bano.x, this.bano.y, 110, 70, 0xe6ecf2, 0xffffff);
      solid(scene, scene.walls, this.bano.x, this.bano.y, 110, 70);
    } else {
      scene.add.rectangle(this.bano.x, this.bano.y, 110, 70, 0xe6ecf2).setDepth(this.bano.y);
    }
    this.aguaBano = scene.add.rectangle(this.bano.x, this.bano.y, 94, 54, 0x3fc1ff).setDepth(this.bano.y + 0.1);
    this.chorro = scene.add.rectangle(this.bano.x + 30, this.bano.y - 48, 8, 26, 0x7fdcff).setDepth(this.bano.y + 0.2);
  }

  vivas() { return 0; }
  congelar() {}

  amenazaParaConi() {
    return (this.canilla || this.nivel > 40 || this.charcos.length > 0) ? 1 : 0;
  }

  estaResuelta() {
    return !this.canilla && this.charcos.length === 0 && this.nivel <= 5;
  }

  cercaCanilla() {
    const p = this.scene.player;
    return Phaser.Math.Distance.Between(p.x, p.y, this.bano.x, this.bano.y) < 100;
  }

  cerrarCanilla() {
    if (!this.canilla || !this.cercaCanilla()) return false;
    this.canilla = false;
    this.chorro.setVisible(false);
    GameAudio.playSFX('agua');
    return true;
  }

  limpiarCercano() {
    const p = this.scene.player;
    for (const c of this.charcos) {
      if (Phaser.Math.Distance.Between(p.x, p.y, c.x, c.y) < 60) {
        c.view.destroy();
        this.charcos.splice(this.charcos.indexOf(c), 1);
        this.nivel = Math.max(0, this.nivel - 10);
        GameAudio.playSFX('agua');
        return true;
      }
    }
    return false;
  }

  actualizar(dt, now) {
    const scene = this.scene;
    this.nivel = aguaTick(this.nivel, dt, { abierta: this.canilla });
    // Charcos nuevos si hay agua corriendo
    if (this.canilla && this.nivel > 30 && this.charcos.length < 6) {
      this.acc += dt;
      if (this.acc >= 5) {
        this.acc = 0;
        const pt = Phaser.Utils.Array.GetRandom(this.puntos);
        const v = scene.add.ellipse(pt[0], pt[1], 44, 24, 0x3fc1ff, 0.6).setDepth(2);
        this.charcos.push({ x: pt[0], y: pt[1], view: v });
      }
    } else if (!this.canilla) {
      this.acc = 0;
    }
    // Chorro visible solo abierta
    this.chorro.setVisible(this.canilla);
    // Resbalón: Jazmín pisa un charco
    const p = scene.player;
    for (const c of this.charcos) {
      if (Phaser.Math.Distance.Between(p.x, p.y, c.x, c.y) < 22 && now > scene.danoCD) {
        scene.danoCD = now + 900;
        scene.vida = Math.max(0, scene.vida - 10);
        p.x += (scene.facing.x || 0) * 30; // deslizamiento
        p.y += (scene.facing.y || 0) * 30;
        GameAudio.playSFX('resbalon');
        scene.refreshHUD();
        break;
      }
    }
  }
}
