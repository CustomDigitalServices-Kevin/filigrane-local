// Shared domain types for the watermark tool. Kept free of any DOM or pdf-lib
// import so the pure geometry (text-layout.ts) and the engines can share them
// and be unit-tested in Node.

/** A watermark is either repeated text or a repeated raster logo. */
export type WatermarkMode = "text" | "image";

/** How the watermark is placed: tiled across the whole page, or one stamp. */
export type WatermarkLayout = "tiled" | "single";

/** Anchor for the single-stamp layout. */
export type SinglePosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Families the tool accepts as input. */
export type InputKind = "pdf" | "image";

/** Raster image formats accepted and produced. */
export type ImageFormat = "png" | "jpeg" | "webp";

export interface WatermarkConfig {
  mode: WatermarkMode;

  // Text mode.
  text: string;
  /** Font size in points (PDF) / pixels-at-scale (image). */
  fontSize: number;
  /** Fill color as a "#rrggbb" hex string. */
  color: string;

  // Image mode.
  /** Logo bytes (PNG or JPEG). null when mode is "text". */
  imageBytes: Uint8Array | null;
  /** Logo format, needed to embed it in a PDF. */
  imageFormat: "png" | "jpeg" | null;
  /** Logo width as a fraction (0..1) of the page/image width, per stamp. */
  imageScale: number;

  // Common.
  /** 0 (invisible) .. 1 (opaque). */
  opacity: number;
  /** Clockwise-positive rotation in degrees. */
  rotation: number;
  layout: WatermarkLayout;
  /** Used only when layout is "single". */
  position: SinglePosition;
  /**
   * Spacing between tiles as a multiple of the stamp size, for the tiled
   * layout. 0 means stamps touch; 0.5 leaves half a stamp of blank space.
   */
  tileGap: number;
}

/** Sensible defaults for an anti-reuse text watermark. */
export const DEFAULT_CONFIG: WatermarkConfig = {
  mode: "text",
  text: "CONFIDENTIEL",
  fontSize: 24,
  color: "#c81e1e",
  imageBytes: null,
  imageFormat: null,
  imageScale: 0.25,
  opacity: 0.3,
  rotation: 45,
  layout: "tiled",
  position: "center",
  tileGap: 0.6,
};

/** One selected input file plus its detected kind. */
export interface InputFile {
  id: string;
  name: string;
  kind: InputKind;
  /** Original format for images; always "pdf" for PDFs. */
  format: ImageFormat | "pdf";
  bytes: Uint8Array;
}

/** Result of watermarking one file. */
export interface WatermarkResult {
  id: string;
  /** Output filename, e.g. "passeport-filigrane.pdf". */
  name: string;
  /** MIME type of the produced blob. */
  mime: string;
  bytes: Uint8Array;
}

/** Typed error the UI can map to a localized, actionable message. */
export type WatermarkErrorCode =
  | "encrypted-pdf"
  | "corrupt-pdf"
  | "unsupported-format"
  | "too-large"
  | "empty-text"
  | "decode-failed"
  | "internal";

export class WatermarkError extends Error {
  readonly code: WatermarkErrorCode;
  constructor(code: WatermarkErrorCode, message: string) {
    super(message);
    this.name = "WatermarkError";
    this.code = code;
  }
}
