import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { assetPath, assetBytes, magic, PDF_MAGIC, PNG_MAGIC } from "./helpers";

// Force French so the localized button labels are deterministic.
test.use({ locale: "fr-FR" });

test.describe("watermarking real files", () => {
  test("watermarks a real PDF and downloads a larger valid PDF", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Filigrane local" })).toBeVisible();

    await page.locator('input[type="file"]').first().setInputFiles(assetPath("sample.pdf"));
    await expect(page.getByText("sample.pdf")).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Appliquer", exact: true }).first().click(),
    ]);
    const path = await download.path();
    const out = new Uint8Array(readFileSync(path));

    expect(magic(out, 4)).toEqual(PDF_MAGIC);
    // The watermark adds content, so the output must be larger than the source.
    expect(out.byteLength).toBeGreaterThan(assetBytes("sample.pdf").byteLength);
    await expect(page.getByText("Terminé")).toBeVisible();
  });

  test("watermarks a real PNG and downloads a valid PNG", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').first().setInputFiles(assetPath("sample.png"));
    await expect(page.getByText("sample.png")).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Appliquer", exact: true }).first().click(),
    ]);
    const out = new Uint8Array(readFileSync(await download.path()));
    expect(magic(out, 4)).toEqual(PNG_MAGIC);
    expect(out.byteLength).toBeGreaterThan(0);
  });

  test("renders a live preview canvas for the dropped file", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').first().setInputFiles(assetPath("sample.pdf"));
    const canvas = page.locator("canvas.preview__canvas");
    await expect(canvas).toBeVisible({ timeout: 30_000 });
    const box = await canvas.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(50);
  });

  test("rejects the single centered layout export path too", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="file"]').first().setInputFiles(assetPath("sample.pdf"));
    await page.getByRole("button", { name: "Unique" }).click();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Appliquer", exact: true }).first().click(),
    ]);
    const out = new Uint8Array(readFileSync(await download.path()));
    expect(magic(out, 4)).toEqual(PDF_MAGIC);
  });
});
