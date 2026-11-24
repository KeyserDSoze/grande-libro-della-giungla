# Narrarium Reader Site

This site was scaffolded from `narrarium-astro-reader`.

## Configure

The scaffold creates a local `.env` with the book root already filled in. Adjust it if this reader should point somewhere else:

```bash
NARRARIUM_BOOK_ROOT=..
# NARRARIUM_READER_CANON_MODE=full
# NARRARIUM_READER_PASSWORD=your-secret-password
# EPUBCHECK_CMD=epubcheck
# EPUBCHECK_JAR=/absolute/path/to/epubcheck.jar
```

## Run

```bash
npm install
npm run dev
```

The dev server exports a fresh EPUB to `public/downloads/book.epub` before Astro starts.
It also watches the linked book repository, regenerates the EPUB when canon files change, and triggers a full browser reload.

By default the reader uses a spoiler-safe public mode. If you want a private full-canon deployment, enable `NARRARIUM_READER_CANON_MODE=full` before running dev or build.

## Password protection

Set `NARRARIUM_READER_PASSWORD` to encrypt all prose content at build time using AES-256-GCM.
Visitors must enter the correct password before any text is revealed.

For local development, add the variable to your `.env` file:

```bash
NARRARIUM_READER_PASSWORD=your-secret-password
```

For GitHub Pages deployment, add it to the `Build site` step in `.github/workflows/deploy-pages.yml`:

```yaml
- name: Build site
  env:
    SITE_BASE: /${{ github.event.repository.name }}/
    NARRARIUM_READER_PASSWORD: ${{ secrets.NARRARIUM_READER_PASSWORD }}
  run: npm run build
```

Store the actual password as a repository secret: **Settings → Secrets and variables → Actions → New repository secret**.

## Doctor

```bash
npm run doctor
```

This checks broken canon references, spoiler thresholds, missing asset metadata, and stale `plot.md`, `resumes/`, or `state/` files.

## Build

```bash
npm run build
```

The build also refreshes the EPUB automatically and ships a ready-to-deploy static site.

If you want EPUBCheck validation too, set `EPUBCHECK_JAR=/absolute/path/to/epubcheck.jar` or `EPUBCHECK_CMD=epubcheck` before running export or build.

## GitHub Pages

A starter workflow already exists in `.github/workflows/deploy-pages.yml`.
By default it deploys to standard GitHub Pages using the repository name as the base path.
