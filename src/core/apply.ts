// Routes one input through the right engine. Kept engine-agnostic so both the
// worker and (in tests) a direct call share the exact same dispatch.

import { watermarkPdf } from "../engines/pdf/pdf-watermark";
import { watermarkImage } from "../engines/image/image-watermark";
import { mimeFor, withSuffix } from "./detect";
import {
  WatermarkError,
  type InputFile,
  type WatermarkConfig,
  type WatermarkResult,
} from "./types";

/** Apply the watermark to a single detected input file. */
export async function applyWatermark(
  input: InputFile,
  config: WatermarkConfig,
): Promise<WatermarkResult> {
  if (input.kind === "pdf") {
    const out = await watermarkPdf(input.bytes, config);
    return {
      id: input.id,
      name: withSuffix(input.name, "filigrane"),
      mime: mimeFor("pdf"),
      bytes: out,
    };
  }
  if (input.format === "pdf") {
    // Defensive: an image-kind file should never carry the pdf format.
    throw new WatermarkError("unsupported-format", "Format incohérent.");
  }
  const out = await watermarkImage(input.bytes, input.format, config);
  return {
    id: input.id,
    name: withSuffix(input.name, "filigrane"),
    mime: mimeFor(input.format),
    bytes: out,
  };
}
