// ZIP packaging for the "download all" action, using fflate (MIT). Stored
// (no deflate) because the payloads are already-compressed PDF/JPEG/PNG/WebP:
// re-deflating them wastes CPU for no size gain.

import { zipSync } from "fflate";

export interface NamedBytes {
  name: string;
  bytes: Uint8Array;
}

/** Bundle files into a single ZIP, disambiguating duplicate names. */
export function zipFiles(files: readonly NamedBytes[]): Uint8Array {
  const entries: Record<string, Uint8Array> = {};
  const seen = new Map<string, number>();
  for (const file of files) {
    let name = file.name;
    const count = seen.get(name);
    if (count !== undefined) {
      const next = count + 1;
      seen.set(file.name, next);
      const dot = file.name.lastIndexOf(".");
      name =
        dot > 0
          ? `${file.name.slice(0, dot)}-${String(next)}${file.name.slice(dot)}`
          : `${file.name}-${String(next)}`;
    } else {
      seen.set(name, 0);
    }
    entries[name] = file.bytes;
  }
  return zipSync(entries, { level: 0 });
}
