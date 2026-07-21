// Turns picked/dropped browser File objects into typed InputFile records,
// detecting the real format by magic bytes and rejecting anything unsupported.

import { detectType } from "./detect";
import type { InputFile } from "./types";

export interface IngestResult {
  inputs: InputFile[];
  /** Names of files that were not a supported PDF/PNG/JPG/WebP. */
  rejected: string[];
}

function newId(): string {
  // randomUUID is available in every browser targeted here and in Node 24.
  return crypto.randomUUID();
}

export async function ingestFiles(files: readonly File[]): Promise<IngestResult> {
  const inputs: InputFile[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = detectType(bytes);
    if (detected === null) {
      rejected.push(file.name);
      continue;
    }
    inputs.push({
      id: newId(),
      name: file.name,
      kind: detected.kind,
      format: detected.format,
      bytes,
    });
  }
  return { inputs, rejected };
}
