// png-utils: lector RGBA8 + escritor PNG (filtro None) + CRC32.
const fs = require('fs');
const zlib = require('zlib');
const CRC_T = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc32(b) { let c = -1; for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(type, data) {
  const td = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const cr = Buffer.alloc(4); cr.writeUInt32BE(crc32(Buffer.concat([td, data])));
  return Buffer.concat([len, td, data, cr]);
}
function leerPNG(p) {
  const b = fs.readFileSync(p);
  let pos = 8, w, h, bitd, ctype; const idat = [];
  while (pos < b.length) {
    const len = b.readUInt32BE(pos), type = b.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') { w = b.readUInt32BE(pos + 8); h = b.readUInt32BE(pos + 12); bitd = b[pos + 16]; ctype = b[pos + 17]; }
    if (type === 'IDAT') idat.push(b.slice(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  if (bitd !== 8 || ctype !== 6) throw new Error('solo RGBA8: ' + p);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = 4, stride = w * ch, px = Buffer.alloc(w * h * ch);
  let p0 = 0;
  const paeth = (a, c, d) => { const q = a + c - d, pa = Math.abs(q - a), pb = Math.abs(q - c), pc = Math.abs(q - d); return pa <= pb && pa <= pc ? a : pb <= pc ? c : d; };
  for (let y = 0; y < h; y++) {
    const f = raw[p0++];
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? px[y * stride + x - ch] : 0;
      const c = y > 0 ? px[(y - 1) * stride + x] : 0;
      const d = x >= ch && y > 0 ? px[(y - 1) * stride + x - ch] : 0;
      let v = raw[p0++];
      if (f === 1) v = (v + a) & 255; else if (f === 2) v = (v + c) & 255;
      else if (f === 3) v = (v + ((a + c) >> 1)) & 255; else if (f === 4) v = (v + paeth(a, c, d)) & 255;
      px[y * stride + x] = v;
    }
  }
  return { w, h, px };
}
function escribirPNG(p, w, h, px) {
  const stride = w * 4, raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (stride + 1)] = 0; px.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride); }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  fs.writeFileSync(p, Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
module.exports = { leerPNG, escribirPNG };
