/// <reference lib="webworker" />
// Web Worker: performs the actual watermarking off the main thread so the UI
// never freezes on a large PDF or high-resolution image. It imports the same
// pure engines used by the unit tests -- no logic is duplicated here.

import { applyWatermark } from "../core/apply";
import { WatermarkError, type InputFile, type WatermarkConfig } from "../core/types";

export interface WorkerRequest {
  id: number;
  input: InputFile;
  config: WatermarkConfig;
}

export type WorkerResponse =
  | { id: number; ok: true; name: string; mime: string; bytes: Uint8Array }
  | { id: number; ok: false; code: string; message: string };

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, input, config } = event.data;
  void (async () => {
    try {
      const result = await applyWatermark(input, config);
      const response: WorkerResponse = {
        id,
        ok: true,
        name: result.name,
        mime: result.mime,
        bytes: result.bytes,
      };
      // Transfer the output buffer to avoid a copy back to the main thread.
      self.postMessage(response, [result.bytes.buffer]);
    } catch (err: unknown) {
      const code = err instanceof WatermarkError ? err.code : "internal";
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      const response: WorkerResponse = { id, ok: false, code, message };
      self.postMessage(response);
    }
  })();
};
