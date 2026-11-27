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

The published reader can be public or protected by one or several passwords. A protected build encrypts the whole book once with a
key drawn for that build (AES-256-GCM) and publishes one key slot per password (PBKDF2-SHA256, 600,000 iterations): the browser tries
the typed password against the slots, and only the reader's shell, `version.json` and encrypted files are published.

On GitHub the passwords are repository secrets, and the repository variable `READER_PASSWORD_SECRETS` lists their names
(for example `READER_PASSWORD_001,READER_PASSWORD_002`). The Pages workflow gives the build step the secrets as JSON and the build
reads only the listed names; a password removed from the list stops opening the book at the next publication. With no name listed the
book is public. Narrarium manages the list and the secrets for you.

For a local build, either set the older single password:

```bash
NARRARIUM_READER_PASSWORD=your-secret-password
```

or the same two variables the workflow passes:

```bash
READER_PASSWORD_SECRETS=READER_PASSWORD_001,READER_PASSWORD_002
NARRARIUM_READER_SECRETS={"READER_PASSWORD_001":"first password","READER_PASSWORD_002":"second password"}
```

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
