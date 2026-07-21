import { describe, it, expect } from "vitest";
import { unzipSync } from "fflate";
import { zipFiles } from "./zip";

function u8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/** Read one entry from an unzipped archive, failing loudly if absent. */
function entry(archive: Record<string, Uint8Array>, name: string): string {
  const bytes = archive[name];
  if (bytes === undefined) throw new Error(`missing entry ${name}`);
  return new TextDecoder().decode(bytes);
}

describe("zipFiles", () => {
  it("packages files that round-trip through unzip", () => {
    const zip = zipFiles([
      { name: "a.pdf", bytes: u8("alpha") },
      { name: "b.png", bytes: u8("bravo") },
    ]);
    const out = unzipSync(zip);
    expect(entry(out, "a.pdf")).toBe("alpha");
    expect(entry(out, "b.png")).toBe("bravo");
  });

  it("disambiguates duplicate filenames instead of overwriting", () => {
    const zip = zipFiles([
      { name: "scan-filigrane.pdf", bytes: u8("one") },
      { name: "scan-filigrane.pdf", bytes: u8("two") },
    ]);
    const out = unzipSync(zip);
    const names = Object.keys(out).sort();
    expect(names).toEqual(["scan-filigrane-1.pdf", "scan-filigrane.pdf"]);
    expect(entry(out, "scan-filigrane.pdf")).toBe("one");
    expect(entry(out, "scan-filigrane-1.pdf")).toBe("two");
  });

  it("produces an empty but valid archive for no files", () => {
    const zip = zipFiles([]);
    expect(Object.keys(unzipSync(zip))).toEqual([]);
  });
});
