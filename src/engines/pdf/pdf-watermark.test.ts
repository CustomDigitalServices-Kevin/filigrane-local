import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { watermarkPdf, MAX_PDF_BYTES } from "./pdf-watermark";
import { DEFAULT_CONFIG, WatermarkError, type WatermarkConfig } from "../../core/types";

async function makePdf(pages = 2): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([595, 842]);
  return doc.save();
}

const textConfig: WatermarkConfig = {
  ...DEFAULT_CONFIG,
  text: "RÉSERVÉ À MORPHEUS FORMATION",
};

describe("watermarkPdf", () => {
  it("preserves the page count", async () => {
    const src = await makePdf(3);
    const out = await watermarkPdf(src, textConfig);
    const reloaded = await PDFDocument.load(out);
    expect(reloaded.getPageCount()).toBe(3);
  });

  it("produces a larger document (watermark content added)", async () => {
    const src = await makePdf(1);
    const out = await watermarkPdf(src, textConfig);
    expect(out.byteLength).toBeGreaterThan(src.byteLength);
  });

  it("accepts French accents with the standard font (no fontkit needed)", async () => {
    const src = await makePdf(1);
    // Would throw 'WinAnsi cannot encode' only for non-latin glyphs.
    await expect(watermarkPdf(src, textConfig)).resolves.toBeInstanceOf(Uint8Array);
  });

  it("supports the single centered layout", async () => {
    const src = await makePdf(1);
    const out = await watermarkPdf(src, { ...textConfig, layout: "single" });
    expect((await PDFDocument.load(out)).getPageCount()).toBe(1);
  });

  it("rejects empty text with code empty-text", async () => {
    const src = await makePdf(1);
    await expect(watermarkPdf(src, { ...textConfig, text: "   " })).rejects.toMatchObject({
      code: "empty-text",
    });
  });

  it("rejects a corrupt PDF with code corrupt-pdf", async () => {
    const junk = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x99, 0x99]);
    await expect(watermarkPdf(junk, textConfig)).rejects.toBeInstanceOf(WatermarkError);
    await expect(watermarkPdf(junk, textConfig)).rejects.toMatchObject({
      code: "corrupt-pdf",
    });
  });

  it("rejects an oversize buffer with code too-large", async () => {
    // Fake a huge buffer without allocating 150 MB: build a small valid PDF,
    // then lie about the length via a subarray-backed view is not possible, so
    // allocate a sparse typed array of the threshold + 1.
    const huge = new Uint8Array(MAX_PDF_BYTES + 1);
    huge.set([0x25, 0x50, 0x44, 0x46]);
    await expect(watermarkPdf(huge, textConfig)).rejects.toMatchObject({
      code: "too-large",
    });
  });

  it("embeds a PNG logo in image mode", async () => {
    const src = await makePdf(1);
    // 1x1 red PNG.
    const png = Uint8Array.from(
      atob(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      ),
      (c) => c.charCodeAt(0),
    );
    const config: WatermarkConfig = {
      ...DEFAULT_CONFIG,
      mode: "image",
      imageBytes: png,
      imageFormat: "png",
    };
    const out = await watermarkPdf(src, config);
    expect((await PDFDocument.load(out)).getPageCount()).toBe(1);
  });
});
