import { describe, it, expect } from "vitest";
import { parseHexColor, toHex6 } from "./color";

describe("parseHexColor", () => {
  it("parses #rrggbb", () => {
    expect(parseHexColor("#ff0000")).toEqual({ r: 1, g: 0, b: 0 });
    expect(parseHexColor("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("parses without the leading hash", () => {
    expect(parseHexColor("00ff00")).toEqual({ r: 0, g: 1, b: 0 });
  });

  it("parses the #rgb short form", () => {
    expect(parseHexColor("#f00")).toEqual({ r: 1, g: 0, b: 0 });
    expect(parseHexColor("#fff")).toEqual({ r: 1, g: 1, b: 1 });
  });

  it("returns null for malformed input", () => {
    expect(parseHexColor("")).toBeNull();
    expect(parseHexColor("#12")).toBeNull();
    expect(parseHexColor("#gggggg")).toBeNull();
    expect(parseHexColor("red")).toBeNull();
  });
});

describe("toHex6", () => {
  it("canonicalizes short and unprefixed forms", () => {
    expect(toHex6("#f00")).toBe("#ff0000");
    expect(toHex6("00FF00")).toBe("#00ff00");
  });

  it("returns null for garbage", () => {
    expect(toHex6("nope")).toBeNull();
  });
});
