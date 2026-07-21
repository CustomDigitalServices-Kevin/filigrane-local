// PDF watermarking with pdf-lib (MIT). Text uses the standard Helvetica font:
// its WinAnsi encoding covers every French accent (advisor 2026-07-21), so no
// custom TTF / fontkit is needed for the default text watermark. Everything
// runs in the browser (or in Node for tests) with no network access.

import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import type { PDFFont, PDFImage } from "pdf-lib";
import { WatermarkError, type WatermarkConfig } from "../../core/types";
import { parseHexColor } from "../../core/color";
import { computeTiledAnchors, computeSingleAnchor } from "../../core/text-layout";

// pdf-lib holds the whole document in memory with no streaming, so a huge PDF
// can OOM the tab (advisor risk). Reject early with a clear message instead.
export const MAX_PDF_BYTES = 150 * 1024 * 1024;
export const MAX_PDF_PAGES = 500;

const DEG_TO_RAD = Math.PI / 180;

function loadDocument(bytes: Uint8Array): Promise<PDFDocument> {
  // ignoreEncryption:false makes pdf-lib throw on an encrypted PDF rather than
  // silently producing a blank result (advisor gotcha, issue #1296).
  return PDFDocument.load(bytes, { ignoreEncryption: false }).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    if (/encrypt/i.test(message)) {
      throw new WatermarkError("encrypted-pdf", "Le PDF est protégé par mot de passe ou chiffré.");
    }
    throw new WatermarkError("corrupt-pdf", "Le PDF est illisible ou endommagé.");
  });
}

/** Draw origin so the stamp of size (w, h) is centered on (ax, ay), rotated. */
function centeredOrigin(
  ax: number,
  ay: number,
  w: number,
  h: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = angleDeg * DEG_TO_RAD;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // u = (cos, sin) along the stamp width, v = (-sin, cos) along its height.
  return {
    x: ax - (w / 2) * cos - (h / 2) * -sin,
    y: ay - (w / 2) * sin - (h / 2) * cos,
  };
}

/**
 * Apply the configured watermark to every page of a PDF and return the new PDF
 * bytes. Throws a WatermarkError on encrypted/corrupt input or oversize files.
 */
export async function watermarkPdf(
  bytes: Uint8Array,
  config: WatermarkConfig,
): Promise<Uint8Array> {
  if (bytes.byteLength > MAX_PDF_BYTES) {
    throw new WatermarkError("too-large", "Le PDF dépasse la taille maximale (150 Mo).");
  }
  if (config.mode === "text" && config.text.trim() === "") {
    throw new WatermarkError("empty-text", "Le texte du filigrane est vide.");
  }

  const doc = await loadDocument(bytes);
  const pages = doc.getPages();
  if (pages.length > MAX_PDF_PAGES) {
    throw new WatermarkError(
      "too-large",
      `Le PDF dépasse le nombre maximal de pages (${String(MAX_PDF_PAGES)}).`,
    );
  }

  const rgbColor = parseHexColor(config.color) ?? { r: 0.78, g: 0.12, b: 0.12 };
  const color = rgb(rgbColor.r, rgbColor.g, rgbColor.b);

  let font: PDFFont | null = null;
  let logo: PDFImage | null = null;
  if (config.mode === "text") {
    font = await doc.embedFont(StandardFonts.HelveticaBold);
  } else {
    if (config.imageBytes === null || config.imageFormat === null) {
      throw new WatermarkError("decode-failed", "Aucune image de filigrane fournie.");
    }
    try {
      logo =
        config.imageFormat === "png"
          ? await doc.embedPng(config.imageBytes)
          : await doc.embedJpg(config.imageBytes);
    } catch {
      throw new WatermarkError("decode-failed", "Le logo n'a pas pu être décodé.");
    }
  }

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Stamp bounding size, in PDF points.
    let stampW: number;
    let stampH: number;
    if (config.mode === "text" && font !== null) {
      stampW = font.widthOfTextAtSize(config.text, config.fontSize);
      stampH = font.heightAtSize(config.fontSize, { descender: false });
    } else if (logo !== null) {
      stampW = width * config.imageScale;
      stampH = stampW * (logo.height / logo.width);
    } else {
      continue;
    }

    const anchors =
      config.layout === "tiled"
        ? computeTiledAnchors({
            pageWidth: width,
            pageHeight: height,
            angleDeg: config.rotation,
            tileWidth: stampW,
            tileHeight: stampH,
            gap: config.tileGap,
          })
        : [computeSingleAnchor(width, height, config.position, Math.max(stampW, stampH) / 2 + 24)];

    for (const anchor of anchors) {
      const origin = centeredOrigin(anchor.x, anchor.y, stampW, stampH, config.rotation);
      if (config.mode === "text" && font !== null) {
        page.drawText(config.text, {
          x: origin.x,
          y: origin.y,
          size: config.fontSize,
          font,
          color,
          opacity: config.opacity,
          rotate: degrees(config.rotation),
        });
      } else if (logo !== null) {
        page.drawImage(logo, {
          x: origin.x,
          y: origin.y,
          width: stampW,
          height: stampH,
          opacity: config.opacity,
          rotate: degrees(config.rotation),
        });
      }
    }
  }

  return doc.save();
}
