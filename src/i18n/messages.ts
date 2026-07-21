// Bilingual message catalog. Both locales share the same key set, enforced
// structurally by the Record<Locale, Record<MessageKey, string>> type below:
// a missing or extra key in either locale is a TypeScript error.

export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** localStorage key persisting the user's explicit language choice. */
export const LOCALE_STORAGE_KEY = "filigrane-local:locale";

const fr = {
  "app.title": "Filigrane local",
  "app.tagline": "Ajoutez un filigrane à vos PDF et images directement dans votre navigateur.",
  "app.localBanner":
    "100% local : vos fichiers ne quittent jamais votre appareil. Aucun envoi, aucun serveur.",

  "nav.home": "Accueil",
  "nav.privacy": "Pourquoi 100% local",
  "nav.licenses": "Licences tierces",
  "nav.back": "Retour à l'outil",

  "dropzone.title": "Déposez vos PDF ou images ici",
  "dropzone.hint": "ou cliquez pour parcourir, ou collez depuis le presse-papiers",
  "dropzone.hintActive": "Relâchez pour ajouter vos fichiers",
  "dropzone.browse": "Parcourir les fichiers",
  "dropzone.accepted": "Formats acceptés : PDF, PNG, JPG, WebP",

  "controls.heading": "Réglages du filigrane",
  "controls.mode": "Type de filigrane",
  "controls.mode.text": "Texte",
  "controls.mode.image": "Logo / image",
  "controls.text": "Texte du filigrane",
  "controls.textPlaceholder": "Ex : CONFIDENTIEL",
  "controls.fontSize": "Taille",
  "controls.color": "Couleur",
  "controls.opacity": "Opacité",
  "controls.rotation": "Angle",
  "controls.layout": "Disposition",
  "controls.layout.tiled": "Répété (mosaïque)",
  "controls.layout.single": "Unique",
  "controls.position": "Position",
  "controls.position.center": "Centre",
  "controls.position.top-left": "Haut gauche",
  "controls.position.top-right": "Haut droite",
  "controls.position.bottom-left": "Bas gauche",
  "controls.position.bottom-right": "Bas droite",
  "controls.density": "Espacement",
  "controls.logo": "Image du filigrane",
  "controls.logoUpload": "Choisir un logo (PNG ou JPG)",
  "controls.logoScale": "Taille du logo",
  "controls.logoMissing": "Choisissez une image pour le filigrane logo.",
  "controls.presetHeading": "Modèles rapides",
  "controls.preset.confidential": "CONFIDENTIEL",
  "controls.preset.copy": "COPIE",
  "controls.preset.draft": "BROUILLON",
  "controls.preset.specimen": "SPÉCIMEN",

  "preview.heading": "Aperçu",
  "preview.empty": "Déposez un fichier pour voir l'aperçu du filigrane.",
  "preview.rendering": "Rendu de l'aperçu...",
  "preview.pageLabel": "Aperçu de la première page",

  "queue.heading": "Fichiers",
  "queue.empty": "Aucun fichier pour l'instant.",
  "queue.applyAll": "Appliquer et tout télécharger",
  "queue.downloadAllZip": "Tout télécharger (ZIP)",
  "queue.zipWorking": "Préparation du ZIP...",
  "queue.clear": "Vider la liste",
  "queue.download": "Télécharger",
  "queue.remove": "Retirer",
  "queue.processing": "Application du filigrane...",
  "queue.applyOne": "Appliquer",

  "status.pending": "En attente",
  "status.processing": "Filigrane en cours",
  "status.done": "Terminé",
  "status.error": "Échec",

  "kind.pdf": "PDF",
  "kind.image": "Image",

  "error.encrypted-pdf": "PDF protégé par mot de passe : déverrouillez-le puis réessayez.",
  "error.corrupt-pdf": "PDF illisible ou endommagé.",
  "error.unsupported-format": "Format non pris en charge.",
  "error.too-large": "Fichier trop volumineux pour un traitement en mémoire.",
  "error.empty-text": "Le texte du filigrane est vide.",
  "error.decode-failed": "Le fichier n'a pas pu être décodé.",
  "error.internal": "Une erreur interne est survenue.",
  "error.unsupported-drop": "Fichier ignoré (format non pris en charge) :",

  "privacy.title": "Pourquoi 100% local",
  "privacy.lead":
    "Cet outil applique le filigrane entièrement dans votre navigateur. Vos documents ne sont jamais téléversés.",
  "privacy.p1":
    "Le traitement PDF (pdf-lib) et images (Canvas) s'exécute côté client. Aucune donnée n'est envoyée à un serveur.",
  "privacy.p2":
    "La politique de sécurité du contenu (CSP) de la page bloque techniquement toute connexion sortante : le navigateur lui-même empêche l'envoi de vos fichiers.",
  "privacy.p3":
    "Après le premier chargement, l'outil fonctionne hors ligne (PWA). Vous pouvez couper le réseau et continuer à filigraner.",
  "privacy.p4":
    "Cas d'usage type : marquer une copie d'un justificatif (passeport, pièce d'identité, diplôme) « RÉSERVÉ À [destinataire] » pour prévenir toute réutilisation frauduleuse.",

  "licenses.title": "Licences tierces",
  "licenses.lead": "Cet outil est distribué sous licence MIT. Il embarque les composants suivants.",
  "licenses.col.name": "Composant",
  "licenses.col.license": "Licence",
  "licenses.col.usage": "Usage",

  "footer.madeBy": "Un outil Custom Digital Services",
  "footer.source": "Code source (MIT)",
} as const;

export type MessageKey = keyof typeof fr;

const en: Record<MessageKey, string> = {
  "app.title": "Local watermark",
  "app.tagline": "Add a watermark to your PDFs and images right in your browser.",
  "app.localBanner": "100% local: your files never leave your device. No upload, no server.",

  "nav.home": "Home",
  "nav.privacy": "Why 100% local",
  "nav.licenses": "Third-party licenses",
  "nav.back": "Back to the tool",

  "dropzone.title": "Drop your PDFs or images here",
  "dropzone.hint": "or click to browse, or paste from the clipboard",
  "dropzone.hintActive": "Release to add your files",
  "dropzone.browse": "Browse files",
  "dropzone.accepted": "Accepted formats: PDF, PNG, JPG, WebP",

  "controls.heading": "Watermark settings",
  "controls.mode": "Watermark type",
  "controls.mode.text": "Text",
  "controls.mode.image": "Logo / image",
  "controls.text": "Watermark text",
  "controls.textPlaceholder": "e.g. CONFIDENTIAL",
  "controls.fontSize": "Size",
  "controls.color": "Color",
  "controls.opacity": "Opacity",
  "controls.rotation": "Angle",
  "controls.layout": "Layout",
  "controls.layout.tiled": "Repeated (tiled)",
  "controls.layout.single": "Single",
  "controls.position": "Position",
  "controls.position.center": "Center",
  "controls.position.top-left": "Top left",
  "controls.position.top-right": "Top right",
  "controls.position.bottom-left": "Bottom left",
  "controls.position.bottom-right": "Bottom right",
  "controls.density": "Spacing",
  "controls.logo": "Watermark image",
  "controls.logoUpload": "Choose a logo (PNG or JPG)",
  "controls.logoScale": "Logo size",
  "controls.logoMissing": "Choose an image for the logo watermark.",
  "controls.presetHeading": "Quick presets",
  "controls.preset.confidential": "CONFIDENTIAL",
  "controls.preset.copy": "COPY",
  "controls.preset.draft": "DRAFT",
  "controls.preset.specimen": "SPECIMEN",

  "preview.heading": "Preview",
  "preview.empty": "Drop a file to preview the watermark.",
  "preview.rendering": "Rendering preview...",
  "preview.pageLabel": "First page preview",

  "queue.heading": "Files",
  "queue.empty": "No files yet.",
  "queue.applyAll": "Apply and download all",
  "queue.downloadAllZip": "Download all (ZIP)",
  "queue.zipWorking": "Preparing ZIP...",
  "queue.clear": "Clear list",
  "queue.download": "Download",
  "queue.remove": "Remove",
  "queue.processing": "Applying watermark...",
  "queue.applyOne": "Apply",

  "status.pending": "Pending",
  "status.processing": "Watermarking",
  "status.done": "Done",
  "status.error": "Failed",

  "kind.pdf": "PDF",
  "kind.image": "Image",

  "error.encrypted-pdf": "Password-protected PDF: unlock it, then try again.",
  "error.corrupt-pdf": "PDF is unreadable or damaged.",
  "error.unsupported-format": "Unsupported format.",
  "error.too-large": "File too large for in-memory processing.",
  "error.empty-text": "The watermark text is empty.",
  "error.decode-failed": "The file could not be decoded.",
  "error.internal": "An internal error occurred.",
  "error.unsupported-drop": "File skipped (unsupported format):",

  "privacy.title": "Why 100% local",
  "privacy.lead":
    "This tool applies the watermark entirely in your browser. Your documents are never uploaded.",
  "privacy.p1":
    "PDF processing (pdf-lib) and image processing (Canvas) run client-side. No data is sent to any server.",
  "privacy.p2":
    "The page's Content Security Policy technically blocks any outbound connection: the browser itself prevents your files from being sent.",
  "privacy.p3":
    "After the first load, the tool works offline (PWA). You can cut the network and keep watermarking.",
  "privacy.p4":
    'Typical use: mark a copy of a supporting document (passport, ID, diploma) "RESERVED FOR [recipient]" to prevent fraudulent reuse.',

  "licenses.title": "Third-party licenses",
  "licenses.lead":
    "This tool is distributed under the MIT license. It bundles the following components.",
  "licenses.col.name": "Component",
  "licenses.col.license": "License",
  "licenses.col.usage": "Usage",

  "footer.madeBy": "A Custom Digital Services tool",
  "footer.source": "Source code (MIT)",
};

export const messages: Record<Locale, Record<MessageKey, string>> = { fr, en };

export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "fr" || stored === "en") return stored;
  } catch {
    // localStorage can throw in private mode; fall through to language sniff.
  }
  const lang = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "fr";
  return lang.startsWith("en") ? "en" : "fr";
}

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore: a failed persist just means the choice is not remembered.
  }
}
