import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LICENSES } from "./licenses-data";

interface Pkg {
  dependencies?: Record<string, string>;
}

// vitest runs from the project root, so cwd is a reliable anchor for
// package.json (import.meta.url is not always a file URL under the DOM env).
const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as Pkg;

const runtimeDeps = Object.keys(pkg.dependencies ?? {});
const listed = LICENSES.map((entry) => entry.name);

describe("licenses-data", () => {
  it("lists every runtime dependency (nothing missing)", () => {
    for (const dep of runtimeDeps) {
      expect(listed).toContain(dep);
    }
  });

  it("lists no dependency that is not actually installed (nothing stale)", () => {
    for (const name of listed) {
      expect(runtimeDeps).toContain(name);
    }
  });

  it("only declares permissive licenses (no copyleft)", () => {
    const allowed = new Set(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC"]);
    for (const entry of LICENSES) {
      expect(allowed.has(entry.license)).toBe(true);
    }
  });
});
