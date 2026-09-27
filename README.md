# SU iVE 2026 — Certificate Generator

A static, no-backend site that lets participants type their name and instantly
generate + download their official **Certificate of Participation** for
SU iVE 2026 (SU Innovation Hub). Everything runs client-side — no server,
no database, no build step.

## What it does

- Shows the event poster as the page hero.
- One field: full name. Everything else (certificate design, wording,
  "Participation" type) is fixed, matching the approved template — there is
  no segment or certificate-type picker, by design.
- Renders the name onto the certificate artwork on an HTML canvas, live,
  in a script font.
- Stamps a unique **Certificate ID** (e.g. `SU-IVE26-8F3K2QZ`) onto every
  certificate at the moment it's downloaded — it isn't a form field, it's
  just always on the image.
- Downloads a full-resolution PNG (2000×1415, same as the source artwork).
- Keeps a local, on-device log of certificates generated in that browser
  (for the organiser's own reference) and can export it as CSV. This log
  lives only in that browser's `localStorage` — it is **not** shared between
  devices or visitors, and there is no central record. If you need one
  master list of every certificate issued, see "Optional: central logging"
  below.

## File structure

```
su-ive-certificates/
├── index.html
├── css/style.css
├── js/script.js
├── assets/
│   ├── certificate-template.png   ← the blank certificate artwork
│   └── event-poster.png           ← the event poster (hero image)
└── README.md
```

## Deploy on GitHub Pages

1. Create a new GitHub repository and push this folder's contents to it
   (either as the repo root, or into a `docs/` folder — see step 3).
   ```bash
   cd su-ive-certificates
   git init
   git add .
   git commit -m "SU iVE 2026 certificate generator"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**,
   pick the `main` branch and the `/ (root)` folder, then **Save**.
4. GitHub will publish the site at
   `https://<your-username>.github.io/<repo-name>/` within a minute or two.

No other configuration, secrets, or build step is needed — it's plain
HTML/CSS/JS and two images.

## Customising

- **Wording / dates / venue** — edit the text in `index.html` (hero section
  and footer).
- **Certificate ID format** — edit `genCertificateId()` in `js/script.js`.
- **Name position, size or colour on the certificate** — edit the constants
  at the top of `js/script.js` (`NAME_LINE`, `ID_POSITION`, `NAME_COLOR`,
  fonts). These were measured directly from the pixel coordinates of the
  blank line and the empty green corner on `certificate-template.png`; if
  you ever swap in a redesigned template, re-measure and update them.
- **Colours / fonts of the website itself** (not the certificate) — edit
  `css/style.css`.

## Optional: central logging

Because this is a static site with no backend, there's no built-in way to
collect every certificate issued across every visitor's device into one
place. If that turns out to matter (e.g. for verifying certificate IDs
later), the simplest additions would be:
- A Google Form / Google Sheet that the download button also posts to, or
- A tiny serverless function (e.g. a free Cloudflare Worker or Google Apps
  Script) that appends each `{name, id, timestamp}` to a shared sheet.

Either is a small addition on top of the existing `downloadBtn` click
handler in `js/script.js`, but neither was added here since it would require
an external account/service beyond a plain GitHub Pages deploy.
