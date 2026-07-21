// Image watermarking with the native Canvas API (no library). Runs on an
// OffscreenCanvas so it works identically on the main thread and inside the
// Web Worker. Draws the source image, then stamps the watermark on top (via the
// shared draw-watermark module, the same code the live preview uses), then
// re-encodes to the original format. No network, no external decoder.

import { WatermarkError, type ImageFormat, type WatermarkConfig } from "../../core/types";
import { drawTextWatermarkOn, drawImageWatermarkOn } from "./draw-watermark";

export const MAX_IMAGE_BYTES = 80 * 1024 * 1024;
/** Guard against a decode bomb producing an unreasonable canvas. */
export const MAX_IMAGE_PIXELS = 100 * 1024 * 1024;

function mimeForImage(format: ImageFormat): string {
  return format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
}

/**
 * Apply the configured watermark to a raster image and return the encoded
 * bytes in the same format. Throws WatermarkError on decode failure or size
 * limits.
 */
export async function watermarkImage(
  bytes: Uint8Array,
  format: ImageFormat,
  config: WatermarkConfig,
): Promise<Uint8Array> {
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new WatermarkError("too-large", "L'image dépasse la taille maximale (80 Mo).");
  }
  if (config.mode === "text" && config.text.trim() === "") {
    throw new WatermarkError("empty-text", "Le texte du filigrane est vide.");
  }

  const blob = new Blob([bytes as BlobPart], { type: mimeForImage(format) });
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    throw new WatermarkError("decode-failed", "L'image n'a pas pu être décodée.");
  }

  const { width, height } = bitmap;
  if (width * height > MAX_IMAGE_PIXELS) {
    bitmap.close();
    throw new WatermarkError("too-large", "L'image a une résolution trop élevée.");
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    bitmap.close();
    throw new WatermarkError("internal", "Contexte Canvas indisponible.");
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  ctx.globalAlpha = config.opacity;
  if (config.mode === "text") {
    drawTextWatermarkOn(ctx, width, height, config);
  } else {
    if (config.imageBytes === null || config.imageFormat === null) {
      throw new WatermarkError("decode-failed", "Aucune image de filigrane fournie.");
    }
    let logo: ImageBitmap;
    try {
      logo = await createImageBitmap(
        new Blob([config.imageBytes as BlobPart], {
          type: config.imageFormat === "png" ? "image/png" : "image/jpeg",
        }),
      );
    } catch {
      throw new WatermarkError("decode-failed", "Le logo n'a pas pu être décodé.");
    }
    drawImageWatermarkOn(ctx, width, height, config, logo);
    logo.close();
  }
  ctx.globalAlpha = 1;

  const outBlob = await canvas.convertToBlob(
    format === "png" ? { type: "image/png" } : { type: mimeForImage(format), quality: 0.92 },
  );
  return new Uint8Array(await outBlob.arrayBuffer());
}
