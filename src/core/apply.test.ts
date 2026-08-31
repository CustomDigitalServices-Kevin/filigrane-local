import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyWatermark } from "./apply";
import { watermarkPdf } from "../engines/pdf/pdf-watermark";
import { watermarkImage } from "../engines/image/image-watermark";
import {
  DEFAULT_CONFIG,
  WatermarkError,
  type ImageFormat,
  type InputFile,
  type WatermarkConfig,
} from "./types";

// Only the two engines are mocked: the point is to assert which engine runs
// and with which payload. detect (withSuffix, mimeFor) and types stay real so
// the assembled result is checked against their actual behaviour.

vi.mock("../engines/pdf/pdf-watermark", () => ({ watermarkPdf: vi.fn() }));
vi.mock("../engines/image/image-watermark", () => ({ watermarkImage: vi.fn() }));

const pdfEngine = vi.mocked(watermarkPdf);
const imageEngine = vi.mocked(watermarkImage);

function bytes(...vals: number[]): Uint8Array {
  return new Uint8Array(vals);
}

function pdfInput(): InputFile {
  return {
    id: "input-1",
    name: "passeport.pdf",
    kind: "pdf",
    format: "pdf",
    bytes: bytes(0x25, 0x50, 0x44, 0x46),
  };
}

function imageInput(format: ImageFormat): InputFile {
  return {
    id: "input-2",
    name: `scan.${format}`,
    kind: "image",
    format,
    bytes: bytes(0x89, 0x50, 0x4e, 0x47),
  };
}

describe("applyWatermark", () => {
  const config: WatermarkConfig = { ...DEFAULT_CONFIG, text: "RÉSERVÉ À MORPHEUS FORMATION" };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("routes a pdf input to the pdf engine with its bytes and config", async () => {
    const input = pdfInput();
    const out = bytes(1, 2, 3);
    pdfEngine.mockResolvedValue(out);

    const result = await applyWatermark(input, config);

    expect(pdfEngine).toHaveBeenCalledTimes(1);
    expect(pdfEngine).toHaveBeenCalledWith(input.bytes, config);
    expect(pdfEngine.mock.calls[0]?.[1]).toBe(config);
    expect(imageEngine).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: "input-1",
      name: "passeport-filigrane.pdf",
      mime: "application/pdf",
      bytes: out,
    });
  });

  it("routes an image input to the image engine with its format passed through", async () => {
    const input = imageInput("png");
    const out = bytes(4, 5, 6);
    imageEngine.mockResolvedValue(out);

    const result = await applyWatermark(input, config);

    expect(imageEngine).toHaveBeenCalledTimes(1);
    expect(imageEngine).toHaveBeenCalledWith(input.bytes, "png", config);
    expect(imageEngine.mock.calls[0]?.[2]).toBe(config);
    expect(pdfEngine).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: "input-2",
      name: "scan-filigrane.png",
      mime: "image/png",
      bytes: out,
    });
  });

  it("keeps every image format on the image path and maps its mime", async () => {
    const out = bytes(7, 8, 9);
    imageEngine.mockResolvedValue(out);

    for (const format of ["png", "jpeg", "webp"] as ImageFormat[]) {
      const input = imageInput(format);
      const result = await applyWatermark(input, config);
      expect(imageEngine).toHaveBeenLastCalledWith(input.bytes, format, config);
      expect(result.name).toBe(`scan-filigrane.${format}`);
      expect(result.mime).toBe(`image/${format}`);
    }

    expect(imageEngine).toHaveBeenCalledTimes(3);
    expect(pdfEngine).not.toHaveBeenCalled();
  });

  it("rejects an image-kind file carrying the pdf format without calling any engine", async () => {
    const input: InputFile = {
      id: "input-3",
      name: "renamed.pdf",
      kind: "image",
      format: "pdf",
      bytes: bytes(0x25, 0x50, 0x44, 0x46),
    };

    await expect(applyWatermark(input, config)).rejects.toBeInstanceOf(WatermarkError);
    await expect(applyWatermark(input, config)).rejects.toMatchObject({
      code: "unsupported-format",
    });
    expect(pdfEngine).not.toHaveBeenCalled();
    expect(imageEngine).not.toHaveBeenCalled();
  });

  it("propagates a pdf engine rejection instead of swallowing it", async () => {
    pdfEngine.mockRejectedValue(new WatermarkError("corrupt-pdf", "Le PDF est corrompu."));

    await expect(applyWatermark(pdfInput(), config)).rejects.toMatchObject({ code: "corrupt-pdf" });
  });

  it("propagates an image engine rejection instead of swallowing it", async () => {
    imageEngine.mockRejectedValue(new WatermarkError("decode-failed", "Décodage impossible."));

    await expect(applyWatermark(imageInput("png"), config)).rejects.toMatchObject({
      code: "decode-failed",
    });
  });
});
