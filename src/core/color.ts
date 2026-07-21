// Hex color parsing shared by the PDF engine (needs 0..1 floats for pdf-lib
// rgb()) and the image engine (needs a CSS color string for canvas).

export interface Rgb01 {
  r: number;
  g: number;
  b: number;
}

const HEX3 = /^#?([0-9a-fA-F]{3})$/;
const HEX6 = /^#?([0-9a-fA-F]{6})$/;

/** "abc" -> "aabbcc" without index access (keeps the strict linter happy). */
function expandShort(short: string): string {
  return Array.from(short, (ch) => ch + ch).join("");
}

/**
 * Parse "#rgb" or "#rrggbb" (with or without the leading #) into 0..1 floats.
 * Returns null for anything malformed so callers can fall back to a default
 * rather than rendering an invisible or garbage color.
 */
export function parseHexColor(input: string): Rgb01 | null {
  const short = HEX3.exec(input);
  const full = HEX6.exec(input);
  let hex: string | null = null;
  if (short !== null && short[1] !== undefined) {
    hex = expandShort(short[1]);
  } else if (full !== null && full[1] !== undefined) {
    hex = full[1];
  }
  if (hex === null) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r: r / 255, g: g / 255, b: b / 255 };
}

/** Normalize any accepted hex form to canonical "#rrggbb" (lowercase). */
export function toHex6(input: string): string | null {
  const rgb = parseHexColor(input);
  if (rgb === null) return null;
  const to2 = (v: number): string =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to2(rgb.r)}${to2(rgb.g)}${to2(rgb.b)}`;
}
