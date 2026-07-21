import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { assetPath, magic, PDF_MAGIC } from "./helpers";

test.use({ locale: "fr-FR" });

// PWA promise: after the first load the tool keeps working with no network.
// The service worker precaches the app shell (HTML/CSS/JS incl. the watermark
// worker that bundles pdf-lib), so the PDF export path works fully offline.
test("still watermarks a PDF after going offline", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Filigrane local" })).toBeVisible();

  // Wait for the service worker to control the page (precache ready).
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
    timeout: 30_000,
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Filigrane local" })).toBeVisible();

  await page.locator('input[type="file"]').first().setInputFiles(assetPath("sample.pdf"));
  await expect(page.getByText("sample.pdf")).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Appliquer", exact: true }).first().click(),
  ]);
  const out = new Uint8Array(readFileSync(await download.path()));
  expect(magic(out, 4)).toEqual(PDF_MAGIC);

  await context.setOffline(false);
});
