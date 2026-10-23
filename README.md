# Filigrane local

Add a watermark to your **PDFs and images** entirely in your browser. No upload, no server, GDPR-friendly by design. A [Custom Digital Services](https://www.custom-digital-services.com) tool.

Live: https://www.custom-digital-services.com/outils/filigrane/

## What it does

- **Text or logo watermark** on PDF (via [pdf-lib](https://github.com/Hopding/pdf-lib)) and images PNG / JPG / WebP (native Canvas)
- **Tiled** (repeated diagonal pattern) or **single** stamp, adjustable font, size, color, opacity and angle
- **Live WYSIWYG preview** of the first page / image, using the exact same drawing code as the export
- **Batch** processing with individual download or a single ZIP
- Quick presets (CONFIDENTIEL / COPIE / BROUILLON / SPÉCIMEN), FR / EN interface

## 100% local

Your files never leave your device. Processing runs client-side; the page ships a strict Content Security Policy (`connect-src 'self'`) that technically blocks any outbound connection. After the first load the tool works **offline** (PWA).

Typical use: mark a copy of a supporting document (passport, ID, diploma) _"reserved for [recipient]"_ to prevent fraudulent reuse.

## Tech

Vite 7 + React 19 + TypeScript strict. Zero copyleft dependency (see the in-app "Third-party licenses" page): pdf-lib (MIT), pdfjs-dist (Apache-2.0), fflate (MIT).

## Development

```bash
npm install
npm run dev          # dev server
npm test             # Vitest unit tests
npm run test:e2e     # Playwright E2E (real files, offline, no network)
npm run build        # production build (tsc + vite)
npm run check:licenses
```

The E2E suite serves the production build statically and asserts, among other things, that **no cross-origin request** is ever made.

## License

[MIT](./LICENSE) © 2026 Custom Digital Services (Kevin Tomas)

## About

Built and maintained by [Kevin Tomas](https://www.custom-digital-services.com/?utm_source=github&utm_medium=readme&utm_campaign=filigrane-local), freelance Power Platform and Microsoft AI consultant (Custom Digital Services).
Try it online: [www.custom-digital-services.com/outils/filigrane](https://www.custom-digital-services.com/outils/filigrane/?utm_source=github&utm_medium=readme&utm_campaign=filigrane-local). More free tools: [www.custom-digital-services.com/outils](https://www.custom-digital-services.com/outils/?utm_source=github&utm_medium=readme&utm_campaign=filigrane-local)
