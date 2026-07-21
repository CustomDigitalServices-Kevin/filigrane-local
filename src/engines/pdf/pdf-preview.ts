// Rasterizes the first page of a PDF to an ImageBitmap for the live preview.
// Uses pdfjs-dist (Apache-2.0), the same renderer the convertisseur ships. The
// worker URL is resolved by Vite (?url) so it is bundled and served from 'self'
// (strict CSP) and runtime-cached by the service worker for offline use.

import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { WatermarkError } from "../../core/types";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface RenderedPage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  /** Rendered pixels per PDF point, so the preview can scale the font to match. */
  unitScale: number;
}

/**
 * Render page 1 of a PDF, scaled so its largest side is at most `maxDim` px.
 * Returns an ImageBitmap plus the rendered pixel dimensions.
 */
export async function renderPdfFirstPage(bytes: Uint8Array, maxDim: number): Promise<RenderedPage> {
  // pdfjs transfers/detaches the input buffer, so hand it a copy: the original
  // bytes are still needed by the export path.
  const data = bytes.slice();
  const loadingTask = pdfjsLib.getDocument({ data });
  let doc: pdfjsLib.PDFDocumentProxy;
  try {
    doc = await loadingTask.promise;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (/password/i.test(message)) {
      throw new WatermarkError("encrypted-pdf", "PDF protégé par mot de passe.");
    }
    throw new WatermarkError("corrupt-pdf", "PDF illisible.");
  }

  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(1, maxDim / Math.max(base.width, base.height));
    const viewport = page.getViewport({ scale });

    const canvas = new OffscreenCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new WatermarkError("internal", "Contexte Canvas indisponible.");
    }
    // pdfjs paints transparent background; fill white so a scanned page looks
    // like paper rather than showing the app background through it.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;

    const bitmap = canvas.transferToImageBitmap();
    return { bitmap, width: canvas.width, height: canvas.height, unitScale: scale };
  } finally {
    void loadingTask.destroy();
  }
}
