# skribbl.io Words

This repository collects word lists for use as custom word packs in the
[skribbl.io](https://skribbl.io) drawing game, organized by language.

## Structure

- `lists/` — word list categories (e.g. `english/`, `italian/`,
  `videogames/`), each containing comma-separated `.txt` word list files.
- `scripts/` — Python CLI tools for merging, sanitizing, and validating
  word lists (see below).
- `web/` — the word list merger website (see its section below).

## Scripts

### `merge_words.py`

Merges one or more comma-separated word list files into a single output
file, removing duplicate entries and dropping any entry containing an
apostrophe or longer than 32 characters.

```sh
python3 scripts/merge_words.py lists/italian/italian-expressions.txt lists/italian/italian-words.txt -o lists/italian/italian-merged.txt
```

- Positional arguments: one or more input files to merge.
- `-o` / `--output`: the file to write the merged, deduplicated list to.

### `sanitize_list.py`

Sanitizes a single comma-separated word list file by removing duplicate
entries, entries containing an apostrophe, and entries longer than 32
characters. Overwrites the input file in place by default, or writes to
a separate file if `-o` is given.

```sh
python3 scripts/sanitize_list.py lists/english/english-merged.txt
```

- Positional argument: the word list file to sanitize.
- `-o` / `--output`: output file (defaults to overwriting the input file).

### `validate_lists.py`

Validates one or more comma-separated word list files, checking for
duplicate entries, entries containing an apostrophe, and entries longer
than 32 characters. Exits with a non-zero status and prints the
offending entries if any issues are found.

```sh
python3 scripts/validate_lists.py lists/italian/italian-merged.txt
```

This check also runs automatically as a GitHub Actions workflow
(`.github/workflows/validate-word-lists.yml`) against any `.txt` files
changed in a pull request.

## Website

`web/` is a small static site that lets you pick one or more word lists,
merge them in the browser, and copy or download the result — no need to
run the Python scripts locally. It's built with Vite + vanilla
TypeScript and automatically picks up every list under `lists/` (no
manual configuration needed when new lists are added).

Live site: https://sephirothx.github.io/skribblio-wordlists/

Deployed automatically via `.github/workflows/deploy-site.yml` on every
push to `main` (requires GitHub Pages to be enabled with source set to
"GitHub Actions" in the repo settings).

### Local development

```sh
cd web
npm install
npm run dev
```

`npm run build` produces a production build in `web/dist`, regenerating
`web/public/manifest.json` and `web/public/lists/` from the current
contents of `lists/` first.
