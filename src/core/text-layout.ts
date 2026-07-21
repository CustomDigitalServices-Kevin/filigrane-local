// Pure geometry for placing a repeated watermark. No DOM, no pdf-lib: this is
// unit-tested in Node and shared by both the PDF engine (origin bottom-left,
// y-up) and the image engine (which flips y itself).
//
// The tiled layout is a lattice aligned with the rotation angle, so every stamp
// sits on the same diagonal grid -- the clean "wallpaper" pattern -- rather than
// a page-aligned grid of individually rotated stamps (which overlap unevenly).
// Basis: u points along the text, v is perpendicular. A stamp centered at each
// lattice point covers the page when the index ranges span the page corners
// projected onto u and v.

export interface Anchor {
  x: number;
  y: number;
}

export interface TileParams {
  pageWidth: number;
  pageHeight: number;
  /** Clockwise-positive degrees, matching pdf-lib's `degrees()` and canvas. */
  angleDeg: number;
  /** Bounding width of one stamp, in the same units as the page. */
  tileWidth: number;
  /** Bounding height of one stamp. */
  tileHeight: number;
  /** Extra spacing as a fraction of the stamp size (>= 0). */
  gap: number;
}

const DEG_TO_RAD = Math.PI / 180;

/**
 * Anchor points (stamp centers) tiling the whole page along the rotated
 * lattice. Guaranteed to cover the four page corners.
 */
export function computeTiledAnchors(p: TileParams): Anchor[] {
  const { pageWidth, pageHeight, angleDeg, tileWidth, tileHeight, gap } = p;

  // Degenerate stamps would make the steps zero and loop forever. Guard.
  const stepX = Math.max(tileWidth * (1 + gap), 1);
  const stepY = Math.max(tileHeight * (1 + gap), 1);

  const rad = angleDeg * DEG_TO_RAD;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // u along text, v perpendicular (unit vectors).
  const ux = cos;
  const uy = sin;
  const vx = -sin;
  const vy = cos;

  const cx = pageWidth / 2;
  const cy = pageHeight / 2;

  // Project the four corners onto (u, v) relative to the center to find the
  // index range that covers the page.
  const corners: Anchor[] = [
    { x: 0, y: 0 },
    { x: pageWidth, y: 0 },
    { x: 0, y: pageHeight },
    { x: pageWidth, y: pageHeight },
  ];
  let minI = Infinity;
  let maxI = -Infinity;
  let minJ = Infinity;
  let maxJ = -Infinity;
  for (const c of corners) {
    const dx = c.x - cx;
    const dy = c.y - cy;
    const uCoord = dx * ux + dy * uy;
    const vCoord = dx * vx + dy * vy;
    minI = Math.min(minI, uCoord / stepX);
    maxI = Math.max(maxI, uCoord / stepX);
    minJ = Math.min(minJ, vCoord / stepY);
    maxJ = Math.max(maxJ, vCoord / stepY);
  }

  const iStart = Math.floor(minI);
  const iEnd = Math.ceil(maxI);
  const jStart = Math.floor(minJ);
  const jEnd = Math.ceil(maxJ);

  const anchors: Anchor[] = [];
  for (let j = jStart; j <= jEnd; j++) {
    for (let i = iStart; i <= iEnd; i++) {
      const offU = i * stepX;
      const offV = j * stepY;
      anchors.push({
        x: cx + offU * ux + offV * vx,
        y: cy + offU * uy + offV * vy,
      });
    }
  }
  return anchors;
}

/**
 * Single anchor (stamp center) for the "single" layout, inset from the edges by
 * `margin` so a corner stamp is not clipped.
 */
export function computeSingleAnchor(
  pageWidth: number,
  pageHeight: number,
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right",
  margin: number,
): Anchor {
  switch (position) {
    case "center":
      return { x: pageWidth / 2, y: pageHeight / 2 };
    case "top-left":
      return { x: margin, y: pageHeight - margin };
    case "top-right":
      return { x: pageWidth - margin, y: pageHeight - margin };
    case "bottom-left":
      return { x: margin, y: margin };
    case "bottom-right":
      return { x: pageWidth - margin, y: margin };
  }
}

/** Rotation basis vectors for a given clockwise-positive angle in degrees. */
export function rotationBasis(angleDeg: number): {
  ux: number;
  uy: number;
  vx: number;
  vy: number;
} {
  const rad = angleDeg * DEG_TO_RAD;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { ux: cos, uy: sin, vx: -sin, vy: cos };
}
