// Generates the E2E fixtures (a real multi-page PDF and a real PNG) so the
// Playwright suite watermarks genuine files, not stubs. Run once:
//   node scripts/make-fixtures.mjs
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const outDir = fileURLToPath(new URL("../e2e/assets", import.meta.url));

async function makePdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 2; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`Document de test - page ${i}`, {
      x: 60,
      y: 760,
      size: 24,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawRectangle({
      x: 60,
      y: 200,
      width: 475,
      height: 500,
      borderWidth: 1,
      borderColor: rgb(0.6, 0.6, 0.6),
    });
  }
  const bytes = await doc.save();
  writeFileSync(join(outDir, "sample.pdf"), bytes);
  console.log("wrote sample.pdf", bytes.byteLength, "bytes");
}

// Minimal PNG encoder (truecolor, no alpha, filter 0 per scanline).
function crc32(buf) {
  let c = ~0;
  for (let n = 0; n < buf.length; n++) {
    c ^= buf[n];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function makePng() {
  const w = 640;
  const h = 420;
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const rowStart = y * (1 + w * 3);
    raw[rowStart] = 0; // filter type none
    for (let x = 0; x < w; x++) {
      const p = rowStart + 1 + x * 3;
      raw[p] = Math.floor((x / w) * 255); // R gradient
      raw[p + 1] = Math.floor((y / h) * 255); // G gradient
      raw[p + 2] = 180; // B constant
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type truecolor
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const png = Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(join(outDir, "sample.png"), png);
  console.log("wrote sample.png", png.length, "bytes");
}

await makePdf();
makePng();
