import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function assetPath(name: string): string {
  return fileURLToPath(new URL(`./assets/${name}`, import.meta.url));
}

export function assetBytes(name: string): Uint8Array {
  return new Uint8Array(readFileSync(assetPath(name)));
}

/** First bytes of a downloaded/produced file, as an array for easy assertions. */
export function magic(bytes: Uint8Array, len: number): number[] {
  return Array.from(bytes.slice(0, len));
}

export const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF
export const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47]; // .PNG
