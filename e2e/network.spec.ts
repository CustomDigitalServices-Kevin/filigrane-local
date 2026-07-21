import { test, expect } from "@playwright/test";
import { assetPath } from "./helpers";

test.use({ locale: "fr-FR" });

// The core promise: files never leave the device. This asserts it at the
// network layer -- every request the page makes must target its own origin.
test("makes no cross-origin request while watermarking", async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on("request", (req) => {
    const url = req.url();
    if (
      !url.startsWith(baseURL ?? "http://localhost:4173") &&
      !url.startsWith("data:") &&
      !url.startsWith("blob:")
    ) {
      external.push(url);
    }
  });

  await page.goto("/");
  await page.locator('input[type="file"]').first().setInputFiles(assetPath("sample.pdf"));
  await expect(page.getByText("sample.pdf")).toBeVisible();
  await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Appliquer", exact: true }).first().click(),
  ]);

  expect(external).toEqual([]);
});
