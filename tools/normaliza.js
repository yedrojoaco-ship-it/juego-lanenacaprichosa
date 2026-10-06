// Normaliza un spritesheet 6x4 con fondo transparente o blanco:
// detecta celdas por partición recursiva, limpia halos por flood,
// recentra cada sprite (pies abajo) y escribe assets/images/gen/<n>_sheet.png.
//
// Uso: node tools/normaliza.js <nombre-sin-png>   (ej: node tools/normaliza.js jazmin)
const path = require('path');
const { leerPNG, escribirPNG } = require('./pngutils.js');
const BASE = path.join(__dirname, '..', 'assets', 'images') + path.sep;
function normalizar(nombre, pad) {
  const { w, h, px } = leerPNG(BASE + nombre + '.png');
  const esFondo = (x, y) => {
    const o = (y * w + x) * 4;
    if (px[o + 3] <= 8) return true;
    return px[o + 3] > 100 && px[o] > 225 && px[o + 1] > 225 && px[o + 2] > 225;
  };
  // densidad por columna/fila: vacía si <2% píxeles no-fondo (tolera sombras tenues)
  const colD = new Array(w).fill(0), filD = new Array(h).fill(0);
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2)
    if (!esFondo(x, y)) { colD[x]++; filD[y]++; }
  const colVac = colD.map(c => c < (h / 2) * 0.02);
  const filVac = filD.map(c => c < (w / 2) * 0.02);
  // partición recursiva: divide el grupo más ancho por su gap interno mayor
  function splitN(vacio, n, partes) {
    const llena = (i) => i >= 0 && i < n && !vacio[i];
    let ini = 0; while (ini < n && vacio[ini]) ini++;
    let fin = n - 1; while (fin > ini && vacio[fin]) fin--;
    let grupos = [[ini, fin + 1]];
    while (grupos.length < partes) {
      grupos.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]));
      let partido = false;
      for (const g of grupos) {
        let best = null;
        let i = g[0];
        while (i < g[1]) {
          if (vacio[i]) {
            let j = i;
            while (j < g[1] && vacio[j]) j++;
            if (i > g[0] + 1 && j < g[1] - 1 && (!best || j - i > best[1] - best[0])) best = [i, j];
            i = j;
          } else i++;
        }
        if (best) {
          const m = Math.round((best[0] + best[1]) / 2);
          grupos.splice(grupos.indexOf(g), 1, [g[0], m], [m, g[1]]);
          partido = true;
          break;
        }
      }
      if (!partido) break;
    }
    return grupos.sort((a, b) => a[0] - b[0]);
  }
  const cols = splitN(colVac, w, 6);
  const fils = splitN(filVac, h, 4);
  console.log(nombre, 'celdas: ' + cols.length + 'x' + fils.length);
  if (process.env.DBG) {
    console.log('  X: ' + cols.map(c => c.join('-')).join(' '));
    console.log('  Y: ' + fils.map(c => c.join('-')).join(' '));
  }
  // flood desde bordes de celda: lo conectado al borde y fondo -> transparente
  for (const fr of fils) for (const cr of cols) {
    const seen = new Uint8Array(w * h), pila = [];
    for (let x = cr[0]; x < cr[1]; x++) { pila.push([x, fr[0]], [x, fr[1] - 1]); }
    for (let y = fr[0]; y < fr[1]; y++) { pila.push([cr[0], y], [cr[1] - 1, y]); }
    while (pila.length) {
      const [x, y] = pila.pop();
      if (x < cr[0] || x >= cr[1] || y < fr[0] || y >= fr[1] || seen[y * w + x]) continue;
      seen[y * w + x] = 1;
      if (!esFondo(x, y)) continue;
      px[(y * w + x) * 4 + 3] = 0;
      pila.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }
  const boxes = [];
  let mw = 0, mh = 0;
  for (const fr of fils) for (const cr of cols) {
    let x0 = cr[1], x1 = cr[0], y0 = fr[1], y1 = fr[0];
    for (let y = fr[0]; y < fr[1]; y++) for (let x = cr[0]; x < cr[1]; x++)
      if (px[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < x0) { boxes.push(null); continue; }
    x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1);
    x1 = Math.min(w - 1, x1 + 1); y1 = Math.min(h - 1, y1 + 1);
    boxes.push({ x0, y0, x1, y1 });
    mw = Math.max(mw, x1 - x0 + 1); mh = Math.max(mh, y1 - y0 + 1);
  }
  const FW = mw + pad * 2, FH = mh + pad * 2, CW = 6, CH = 4;
  const out = Buffer.alloc(CW * FW * CH * FH * 4);
  boxes.forEach((b, i) => {
    if (!b) return;
    const cx = i % CW, cy = Math.floor(i / CW);
    const bw = b.x1 - b.x0 + 1;
    const ox = Math.round(cx * FW + (FW - bw) / 2) - b.x0;
    const oy = cy * FH + FH - pad - b.y1;
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) {
      const dx = x + ox, dy = y + oy;
      px.copy(out, (dy * CW * FW + dx) * 4, (y * w + x) * 4, (y * w + x) * 4 + 4);
    }
  });
  const dest = BASE + 'gen\\' + nombre + '_sheet.png';
  escribirPNG(dest, CW * FW, CH * FH, out);
  console.log('  frame ' + FW + 'x' + FH + ' -> ' + dest);
}
normalizar(process.argv[2] || 'jazmin', 6);
