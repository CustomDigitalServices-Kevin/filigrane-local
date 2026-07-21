import { describe, it, expect } from "vitest";
import {
  computeTiledAnchors,
  computeSingleAnchor,
  rotationBasis,
  type TileParams,
} from "./text-layout";

const base: TileParams = {
  pageWidth: 600,
  pageHeight: 800,
  angleDeg: 0,
  tileWidth: 100,
  tileHeight: 20,
  gapX: 0,
  gapY: 0,
};

describe("computeTiledAnchors", () => {
  it("covers the whole page: every corner has a stamp within one step", () => {
    const anchors = computeTiledAnchors({ ...base, angleDeg: 45 });
    const stepX = base.tileWidth;
    const stepY = base.tileHeight;
    const reach = Math.hypot(stepX, stepY);
    for (const corner of [
      { x: 0, y: 0 },
      { x: 600, y: 0 },
      { x: 0, y: 800 },
      { x: 600, y: 800 },
    ]) {
      const nearest = Math.min(...anchors.map((a) => Math.hypot(a.x - corner.x, a.y - corner.y)));
      expect(nearest).toBeLessThanOrEqual(reach);
    }
  });

  it("places a stamp at the page center for a symmetric grid", () => {
    const anchors = computeTiledAnchors(base);
    const hasCenter = anchors.some((a) => Math.abs(a.x - 300) < 1e-6 && Math.abs(a.y - 400) < 1e-6);
    expect(hasCenter).toBe(true);
  });

  it("spaces stamps by tileWidth along x when angle is 0 and gap is 0", () => {
    const anchors = computeTiledAnchors(base);
    // Take the row through the center (y == 400) and check x spacing.
    const row = anchors
      .filter((a) => Math.abs(a.y - 400) < 1e-6)
      .map((a) => a.x)
      .sort((a, b) => a - b);
    expect(row.length).toBeGreaterThan(1);
    for (let k = 1; k < row.length; k++) {
      const cur = row[k];
      const prev = row[k - 1];
      if (cur === undefined || prev === undefined) throw new Error("unexpected gap");
      expect(cur - prev).toBeCloseTo(100, 5);
    }
  });

  it("widens spacing (fewer stamps) when gapX increases", () => {
    const tight = computeTiledAnchors({ ...base, gapX: 0 }).length;
    const loose = computeTiledAnchors({ ...base, gapX: 1 }).length;
    expect(loose).toBeLessThan(tight);
  });

  it("widens spacing (fewer stamps) when gapY increases", () => {
    const tight = computeTiledAnchors({ ...base, gapY: 0 }).length;
    const loose = computeTiledAnchors({ ...base, gapY: 1 }).length;
    expect(loose).toBeLessThan(tight);
  });

  it("gapX and gapY act on independent axes", () => {
    // At angle 0, gapX controls x spacing and gapY controls y spacing.
    const rowXSpacing = (anchors: { x: number; y: number }[]): number => {
      const row = anchors
        .filter((a) => Math.abs(a.y - 400) < 1e-6)
        .map((a) => a.x)
        .sort((a, b) => a - b);
      return (row[1] ?? 0) - (row[0] ?? 0);
    };
    // Increasing only gapY must not change the along-x spacing.
    expect(rowXSpacing(computeTiledAnchors({ ...base, gapY: 3 }))).toBeCloseTo(100, 5);
  });

  it("never loops forever on a degenerate (zero-size) stamp", () => {
    const anchors = computeTiledAnchors({
      ...base,
      tileWidth: 0,
      tileHeight: 0,
    });
    expect(anchors.length).toBeGreaterThan(0);
    expect(Number.isFinite(anchors.length)).toBe(true);
  });
});

describe("computeSingleAnchor", () => {
  it("centers correctly", () => {
    expect(computeSingleAnchor(600, 800, "center", 40)).toEqual({
      x: 300,
      y: 400,
    });
  });

  it("insets corners by the margin (bottom-left origin, y-up)", () => {
    expect(computeSingleAnchor(600, 800, "top-left", 40)).toEqual({
      x: 40,
      y: 760,
    });
    expect(computeSingleAnchor(600, 800, "bottom-right", 40)).toEqual({
      x: 560,
      y: 40,
    });
  });
});

describe("rotationBasis", () => {
  it("returns orthonormal vectors", () => {
    const b = rotationBasis(30);
    // Unit length.
    expect(Math.hypot(b.ux, b.uy)).toBeCloseTo(1, 10);
    expect(Math.hypot(b.vx, b.vy)).toBeCloseTo(1, 10);
    // Orthogonal.
    expect(b.ux * b.vx + b.uy * b.vy).toBeCloseTo(0, 10);
  });

  it("matches known values at 90 degrees", () => {
    const b = rotationBasis(90);
    expect(b.ux).toBeCloseTo(0, 10);
    expect(b.uy).toBeCloseTo(1, 10);
    expect(b.vx).toBeCloseTo(-1, 10);
    expect(b.vy).toBeCloseTo(0, 10);
  });
});
