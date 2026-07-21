// Runtime dependencies bundled into the shipped app, with their license and
// what each is used for. A test (licenses-data.test.ts) locks this list against
// package.json "dependencies" in both directions so it can never drift.

export interface LicenseEntry {
  name: string;
  license: string;
  usageFr: string;
  usageEn: string;
}

export const LICENSES: readonly LicenseEntry[] = [
  {
    name: "pdf-lib",
    license: "MIT",
    usageFr: "Application du filigrane sur les PDF (texte et logo).",
    usageEn: "Applying the watermark to PDFs (text and logo).",
  },
  {
    name: "pdfjs-dist",
    license: "Apache-2.0",
    usageFr: "Rendu de l'aperçu de la première page des PDF.",
    usageEn: "Rendering the first-page preview of PDFs.",
  },
  {
    name: "fflate",
    license: "MIT",
    usageFr: "Création de l'archive ZIP pour le téléchargement groupé.",
    usageEn: "Building the ZIP archive for batch download.",
  },
  {
    name: "react",
    license: "MIT",
    usageFr: "Bibliothèque d'interface utilisateur.",
    usageEn: "User interface library.",
  },
  {
    name: "react-dom",
    license: "MIT",
    usageFr: "Rendu React dans le navigateur.",
    usageEn: "React rendering in the browser.",
  },
];
