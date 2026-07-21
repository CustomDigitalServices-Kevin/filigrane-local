// Main-thread facade over the watermark Web Worker. One worker instance,
// request/response correlated by an incrementing id, so several files can be
// queued without blocking the UI. Mirrors the compresseur WorkerBridge pattern.

import type { InputFile, WatermarkConfig, WatermarkResult } from "./types";
import { WatermarkError } from "./types";
import type { WorkerRequest, WorkerResponse } from "../workers/watermark.worker";

interface Pending {
  resolve: (result: WatermarkResult) => void;
  reject: (error: WatermarkError) => void;
}

export class WatermarkBridge {
  private worker: Worker;
  private nextId = 1;
  private readonly pending = new Map<number, Pending>();

  constructor() {
    this.worker = new Worker(new URL("../workers/watermark.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>): void => {
      const data = event.data;
      const entry = this.pending.get(data.id);
      if (entry === undefined) return;
      this.pending.delete(data.id);
      if (data.ok) {
        entry.resolve({ id: String(data.id), name: data.name, mime: data.mime, bytes: data.bytes });
      } else {
        entry.reject(new WatermarkError(data.code as WatermarkError["code"], data.message));
      }
    };
  }

  process(input: InputFile, config: WatermarkConfig): Promise<WatermarkResult> {
    const id = this.nextId++;
    const request: WorkerRequest = { id, input, config };
    return new Promise<WatermarkResult>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage(request);
    });
  }

  /** Terminate the worker and reject any in-flight requests. */
  dispose(): void {
    for (const entry of this.pending.values()) {
      entry.reject(new WatermarkError("internal", "Traitement annulé."));
    }
    this.pending.clear();
    this.worker.terminate();
  }
}
