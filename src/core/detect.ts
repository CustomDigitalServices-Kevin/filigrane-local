// Format detection by magic bytes, not by filename extension: a file dropped
// with the wrong extension must still be routed to the right engine (or
// rejected cleanly). Only the formats the tool actually supports are matched.

import type { ImageFormat, InputKind } from "./types";

export interface DetectedType {
  kind: InputKind;
  format: ImageFormat | "pdf";
}

function startsWith(bytes: Uint8Array, sig: readonly number[], offset = 0): boolean {
  if (bytes.length < offset + sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (bytes[offset + i] !== sig[i]) return false;
  }
  return true;
}

const PDF = [0x25, 0x50, 0x44, 0x46]; // %PDF
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff];
const RIFF = [0x52, 0x49, 0x46, 0x46]; // RIFF
const WEBP = [0x57, 0x45, 0x42, 0x50]; // WEBP at offset 8

/**
 * Detect a supported input type from the leading bytes, or null if the file is
 * not a format this tool handles.
 */
export function detectType(bytes: Uint8Array): DetectedType | null {
  if (startsWith(bytes, PDF)) return { kind: "pdf", format: "pdf" };
  if (startsWith(bytes, PNG)) return { kind: "image", format: "png" };
  if (startsWith(bytes, JPEG)) return { kind: "image", format: "jpeg" };
  if (startsWith(bytes, RIFF) && startsWith(bytes, WEBP, 8)) {
    return { kind: "image", format: "webp" };
  }
  return null;
}

/** MIME type for a produced output of the given format. */
export function mimeFor(format: ImageFormat | "pdf"): string {
  switch (format) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
  }
}

/** Append a suffix before the extension: "a.pdf" -> "a-filigrane.pdf". */
export function withSuffix(name: string, suffix: string): string {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return `${name}-${suffix}`;
  return `${name.slice(0, dot)}-${suffix}${name.slice(dot)}`;
}
