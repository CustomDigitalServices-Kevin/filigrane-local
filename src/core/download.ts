// Browser download helper. Isolated so the UI never touches URL/anchor plumbing
// directly and so it can be stubbed in component tests.

/** Trigger a browser download of raw bytes under the given filename. */
export function triggerDownload(bytes: Uint8Array, name: string, mime: string): void {
  const blob = new Blob([bytes as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick so the download has started reading the blob.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}
