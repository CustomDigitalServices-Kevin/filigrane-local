// Shared Canvas drawing for the watermark, used by BOTH the image engine
// (OffscreenCanvas, in the worker) and the live preview (HTMLCanvasElement, on
// the main thread). Keeping one implementation means the preview is a faithful
// WYSIWYG of the exported result. Pure drawing: the caller owns decode/encode.

import type { WatermarkConfig } from "../../core/types";
import { computeTiledAnchors, computeSingleAnchor } from "../../core/text-layout";
import { parseHexColor } from "../../core/color";

/** Both 2D context flavors expose the subset of the API we use. */
export type AnyCanvasCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const DEG_TO_RAD = Math.PI / 180;

function toCssColor(hex: string): string {
  const rgb = parseHexColor(hex);
  if (rgb === null) return "#c81e1e";
  const to255 = (v: number): number => Math.round(v * 255);
  return `rgb(${String(to255(rgb.r))}, ${String(to255(rgb.g))}, ${String(to255(rgb.b))})`;
}

function anchorsFor(
  config: WatermarkConfig,
  width: number,
  height: number,
  stampW: number,
  stampH: number,
): { x: number; y: number }[] {
  if (config.layout === "tiled") {
    return computeTiledAnchors({
      pageWidth: width,
      pageHeight: height,
      angleDeg: config.rotation,
      tileWidth: stampW,
      tileHeight: stampH,
      gap: config.tileGap,
    });
  }
  return [computeSingleAnchor(width, height, config.position, Math.max(stampW, stampH) / 2 + 24)];
}

/** Draw the text watermark. Assumes ctx.globalAlpha is already set by caller. */
export function drawTextWatermarkOn(
  ctx: AnyCanvasCtx,
  width: number,
  height: number,
  config: WatermarkConfig,
): void {
  ctx.fillStyle = toCssColor(config.color);
  ctx.font = `bold ${String(config.fontSize)}px Helvetica, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const rot = -config.rotation * DEG_TO_RAD;
  const textWidth = ctx.measureText(config.text).width;

  for (const anchor of anchorsFor(config, width, height, textWidth, config.fontSize)) {
    ctx.save();
    ctx.translate(anchor.x, anchor.y);
    ctx.rotate(rot);
    ctx.fillText(config.text, 0, 0);
    ctx.restore();
  }
}

/** Draw the logo watermark. Assumes ctx.globalAlpha is already set by caller. */
export function drawImageWatermarkOn(
  ctx: AnyCanvasCtx,
  width: number,
  height: number,
  config: WatermarkConfig,
  logo: ImageBitmap,
): void {
  const rot = -config.rotation * DEG_TO_RAD;
  const stampW = width * config.imageScale;
  const stampH = stampW * (logo.height / logo.width);

  for (const anchor of anchorsFor(config, width, height, stampW, stampH)) {
    ctx.save();
    ctx.translate(anchor.x, anchor.y);
    ctx.rotate(rot);
    ctx.drawImage(logo, -stampW / 2, -stampH / 2, stampW, stampH);
    ctx.restore();
  }
}
