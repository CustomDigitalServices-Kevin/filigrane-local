import { describe, it, expect } from "vitest";
import { detectType, mimeFor, withSuffix } from "./detect";

function bytes(...vals: number[]): Uint8Array {
  return new Uint8Array(vals);
}

describe("detectType", () => {
  it("detects PDF by %PDF", () => {
    expect(detectType(bytes(0x25, 0x50, 0x44, 0x46, 0x2d))).toEqual({
      kind: "pdf",
      format: "pdf",
    });
  });

  it("detects PNG by signature", () => {
    expect(detectType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00))).toEqual({
      kind: "image",
      format: "png",
    });
  });

  it("detects JPEG by SOI + marker", () => {
    expect(detectType(bytes(0xff, 0xd8, 0xff, 0xe0))).toEqual({
      kind: "image",
      format: "jpeg",
    });
  });

  it("detects WebP by RIFF....WEBP", () => {
    const b = bytes(
      0x52,
      0x49,
      0x46,
      0x46, // RIFF
      0x00,
      0x00,
      0x00,
      0x00, // size (ignored)
      0x57,
      0x45,
      0x42,
      0x50, // WEBP
    );
    expect(detectType(b)).toEqual({ kind: "image", format: "webp" });
  });

  it("does not mistake a bare RIFF (e.g. WAV) for WebP", () => {
    const wav = bytes(
      0x52,
      0x49,
      0x46,
      0x46,
      0x00,
      0x00,
      0x00,
      0x00,
      0x57,
      0x41,
      0x56,
      0x45, // WAVE
    );
    expect(detectType(wav)).toBeNull();
  });

  it("returns null for an unsupported format", () => {
    expect(detectType(bytes(0x00, 0x01, 0x02, 0x03))).toBeNull();
  });

  it("returns null for an empty buffer", () => {
    expect(detectType(bytes())).toBeNull();
  });
});

describe("mimeFor", () => {
  it("maps every format", () => {
    expect(mimeFor("pdf")).toBe("application/pdf");
    expect(mimeFor("png")).toBe("image/png");
    expect(mimeFor("jpeg")).toBe("image/jpeg");
    expect(mimeFor("webp")).toBe("image/webp");
  });
});

describe("withSuffix", () => {
  it("inserts before the extension", () => {
    expect(withSuffix("passeport.pdf", "filigrane")).toBe("passeport-filigrane.pdf");
  });

  it("handles names without an extension", () => {
    expect(withSuffix("scan", "filigrane")).toBe("scan-filigrane");
  });

  it("handles dotfiles without treating the leading dot as an extension", () => {
    expect(withSuffix(".htaccess", "x")).toBe(".htaccess-x");
  });

  it("uses the last dot for multi-dotted names", () => {
    expect(withSuffix("a.b.png", "wm")).toBe("a.b-wm.png");
  });
});
