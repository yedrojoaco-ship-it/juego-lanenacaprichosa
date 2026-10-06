/* ============================================================
 * data-mansion.js — Geometría y decorado de la mansión (Nivel 1)
 * Solo datos, sin lógica. create() los consume con loops. [F1-P4]
 * ============================================================ */

const MANSION = {
  W: 960, H: 860, zoom: 1.55,

  // Muros horizontales [cx, y, w], grosor 16 (vanos ya descontados)
  murosH: [
    [480, 40, 880],            // norte exterior
    [91, 300, 102], [249, 300, 102],     // Hab1 | vano x142..198
    [366, 300, 132], [554, 300, 132],    // Coni | vano x432..488
    [681, 300, 122], [859, 300, 122],    // Hab3 | vano x742..798
    [96, 370, 112], [269, 370, 122],     // Cocina | vano x152..208
    [401, 370, 142], [604, 370, 152],    // Living | vano x472..528
    [726, 370, 92], [874, 370, 92],      // Lavadero | vano x772..828
    [256, 640, 432], [754, 640, 332],    // sur (puerta patio x472..588)
    [480, 810, 880],                     // cerco patio
  ],
  // Muros verticales [x, cy, h], grosor 16
  murosV: [
    [40, 425, 770], [920, 425, 770],     // exteriores (llegan al cerco)
    [300, 170, 260], [620, 170, 260],    // tabiques cuartos
    [330, 505, 270], [680, 505, 270],    // tabiques abajo
  ],
  // Marcos de puerta [x, y, w] (paso libre por el vano)
  puertas: [
    [170, 300, 56], [460, 300, 56], [770, 300, 56],
    [180, 370, 56], [500, 370, 56], [800, 370, 56],
    [530, 640, 116],
  ],
  // Pisos [x, y, w, h, tex, borde] — tex: 'madera' | 'azulejo' | 'pasto'
  pisos: [
    [170, 172, 244, 240, 'madera', 0x7a5a3a],   // Hab 1 parquet
    [460, 172, 312, 240, 'madera', 0x6a4a8a],   // Coni parquet
    [770, 172, 284, 240, 'madera', 0x4a6a8a],   // Hab 3 parquet
    [480, 335, 864, 54, 'madera', 0x8a7a5a],    // pasillo estrecho
    [185, 505, 274, 254, 'azulejo', 0x6a8a9a],  // Cocina azulejos
    [505, 505, 334, 254, 'madera', 0x9a5a3a],   // Living parquet
    [800, 505, 224, 254, 'azulejo', 0x5a9aaa],  // Lavadero azulejos
    [480, 725, 864, 154, 'pasto', 0x3f7a46],    // Patio pasto
  ],
  labels: [
    [170, 80, 'Habitación 1'],
    [460, 80, 'Cuarto de Coni 💜'],
    [770, 80, 'Habitación 3'],
    [260, 612, 'Cocina'],
    [620, 600, 'Living 📺'],
    [800, 450, 'Lavadero'],
    [480, 668, 'Patio · Piscina'],
  ],
  // Muebles con colisión [x, y, w, h, base, top]
  muebles: [
    [400, 190, 90, 130, 0xb678ff, 0xd3aaff],  // cama Coni
    [560, 82, 70, 36, 0x9a6a3a, 0xc08a4e],    // armario
    [585, 258, 44, 36, 0x4aa3df, 0x8ac8ef],   // caja de juguetes
    [160, 190, 90, 120, 0x5aa9ff, 0x9cc8ff],  // cama Hab 1
    [110, 96, 80, 30, 0x9a6a3a, 0xc08a4e],    // estante (Raqueta)
    [770, 190, 90, 120, 0x63c78a, 0xa5e6bd],  // cama Hab 3
    [855, 100, 44, 40, 0xc08a4e, 0xe0aa6e],   // caja Hab 3
    [140, 402, 190, 40, 0xb9c2cc, 0xe6ecf2],  // mesada norte
    [70, 500, 44, 170, 0xb9c2cc, 0xe6ecf2],   // mesada oeste
    [285, 402, 50, 70, 0xdff3ff, 0xffffff],   // heladera
    [185, 545, 95, 60, 0x9a6a3a, 0xc08a4e],   // mesa comedor
    [185, 498, 28, 26, 0x7a5a3a, 0xa87c4e],   // sillas x4
    [185, 592, 28, 26, 0x7a5a3a, 0xa87c4e],
    [122, 545, 28, 26, 0x7a5a3a, 0xa87c4e],
    [248, 545, 28, 26, 0x7a5a3a, 0xa87c4e],
    [450, 548, 140, 45, 0xd94f4f, 0xff8a8a],  // sofá horizontal
    [562, 508, 45, 110, 0xc04444, 0xff8a8a],  // sofá vertical (L)
    [488, 488, 70, 40, 0x9a6a3a, 0xc08a4e],   // mesa ratona
    [725, 420, 50, 50, 0xe6ecf2, 0xffffff],   // lavarropas x2
    [725, 490, 50, 50, 0xe6ecf2, 0xffffff],
    [830, 580, 120, 45, 0xb9c2cc, 0xe6ecf2],  // pileta
    [250, 730, 50, 90, 0xffd93b, 0xffe98a],   // reposeras
    [710, 730, 50, 90, 0xffd93b, 0xffe98a],
  ],
  plantas: [[352, 394], [658, 616]],

  spawn: {
    jugador: [480, 335], coni: [380, 200],
    raqueta: [110, 74],
    chocos: [[260, 460], [285, 462], [310, 460]], // frente a heladera (stock 3)
    peluche: [540, 120], // cuarto de Coni
    extintor: [870, 430], // lavadero (Nivel 2)
    mopa: [760, 540], // lavadero (Nivel 3)
  },
  ventana: { x: 460, y: 40 },
  tv: { x: 505, y: 402, zone: [505, 448], hint: [505, 590] },
  wander: [
    [110, 200], [470, 220], [720, 200], [480, 335],
    [250, 470], [600, 470], [860, 520], [300, 700],
  ],
};
