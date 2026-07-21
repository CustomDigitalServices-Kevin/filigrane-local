import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useLocale } from "../i18n/locale-context";
import type { InputFile, WatermarkConfig } from "../core/types";
import { WatermarkError } from "../core/types";
import { renderPdfFirstPage } from "../engines/pdf/pdf-preview";
import { drawImageWatermarkOn, drawTextWatermarkOn } from "../engines/image/draw-watermark";

interface PreviewProps {
  file: InputFile | null;
  config: WatermarkConfig;
}

interface Background {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  /** Preview pixels per export unit (PDF point or source image pixel). */
  unitScale: number;
}

const PREVIEW_MAX = 1400;

export function Preview({ file, config }: PreviewProps): ReactElement {
  const { t } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bg, setBg] = useState<Background | null>(null);
  const [status, setStatus] = useState<"idle" | "rendering" | "error">("idle");
  const [logo, setLogo] = useState<ImageBitmap | null>(null);

  // Load the background (image itself, or PDF page 1) whenever the file changes.
  useEffect(() => {
    if (file === null) {
      setBg(null);
      setStatus("idle");
      return;
    }
    // AbortController rather than a captured boolean: signal.aborted is an
    // external getter, so the linter cannot wrongly flag the guard as constant.
    const controller = new AbortController();
    setStatus("rendering");
    void (async () => {
      try {
        const next = await loadBackground(file);
        if (controller.signal.aborted) {
          next.bitmap.close();
          return;
        }
        setBg(next);
        setStatus("idle");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    })();
    return () => {
      controller.abort();
    };
  }, [file]);

  // Decode the logo bitmap for image-mode watermarks.
  useEffect(() => {
    if (config.mode !== "image" || config.imageBytes === null || config.imageFormat === null) {
      setLogo(null);
      return;
    }
    const controller = new AbortController();
    const blob = new Blob([config.imageBytes as BlobPart], {
      type: config.imageFormat === "png" ? "image/png" : "image/jpeg",
    });
    void createImageBitmap(blob).then(
      (bitmap) => {
        if (controller.signal.aborted) bitmap.close();
        else setLogo(bitmap);
      },
      () => {
        if (!controller.signal.aborted) setLogo(null);
      },
    );
    return () => {
      controller.abort();
    };
  }, [config.mode, config.imageBytes, config.imageFormat]);

  // Redraw whenever the background, config or logo changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null || bg === null) return;
    canvas.width = bg.width;
    canvas.height = bg.height;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
    ctx.clearRect(0, 0, bg.width, bg.height);
    ctx.drawImage(bg.bitmap, 0, 0);

    ctx.globalAlpha = config.opacity;
    // Font size is defined in export units; scale it to preview pixels.
    const scaled: WatermarkConfig = { ...config, fontSize: config.fontSize * bg.unitScale };
    if (config.mode === "text") {
      drawTextWatermarkOn(ctx, bg.width, bg.height, scaled);
    } else if (logo !== null) {
      drawImageWatermarkOn(ctx, bg.width, bg.height, scaled, logo);
    }
    ctx.globalAlpha = 1;
  }, [bg, config, logo]);

  return (
    <section className="preview" aria-label={t("preview.heading")}>
      <h2 className="panel__title">{t("preview.heading")}</h2>
      <div className="preview__stage">
        {file === null ? (
          <p className="preview__empty">{t("preview.empty")}</p>
        ) : status === "rendering" ? (
          <p className="preview__empty">{t("preview.rendering")}</p>
        ) : status === "error" ? (
          <p className="preview__empty">{t("error.corrupt-pdf")}</p>
        ) : (
          <canvas ref={canvasRef} className="preview__canvas" aria-label={t("preview.pageLabel")} />
        )}
      </div>
    </section>
  );
}

async function loadBackground(file: InputFile): Promise<Background> {
  if (file.kind === "pdf") {
    const page = await renderPdfFirstPage(file.bytes, PREVIEW_MAX);
    return page;
  }
  const type =
    file.format === "png" ? "image/png" : file.format === "jpeg" ? "image/jpeg" : "image/webp";
  const native = await createImageBitmap(new Blob([file.bytes as BlobPart], { type })).catch(() => {
    throw new WatermarkError("decode-failed", "Image illisible.");
  });
  const f = Math.min(1, PREVIEW_MAX / Math.max(native.width, native.height));
  if (f >= 1) {
    return { bitmap: native, width: native.width, height: native.height, unitScale: 1 };
  }
  // Downscale to keep the preview canvas light; unitScale carries the factor.
  const w = Math.round(native.width * f);
  const h = Math.round(native.height * f);
  const off = new OffscreenCanvas(w, h);
  const octx = off.getContext("2d");
  if (octx === null) {
    return { bitmap: native, width: native.width, height: native.height, unitScale: 1 };
  }
  octx.drawImage(native, 0, 0, w, h);
  native.close();
  return { bitmap: off.transferToImageBitmap(), width: w, height: h, unitScale: f };
}
