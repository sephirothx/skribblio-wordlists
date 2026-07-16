# skribbl.io Words

This repository collects word lists for use as custom word packs in the
[skribbl.io](https://skribbl.io) drawing game, organized by language
(e.g. `italian/`).

## Scripts

### `merge_words.py`

Merges one or more comma-separated word list files into a single output
file, removing duplicate entries and dropping any word containing an
apostrophe.

```sh
python3 merge_words.py italian/italian.txt italian/italian-2.txt -o italian/italian-merged.txt
```

- Positional arguments: one or more input files to merge.
- `-o` / `--output`: the file to write the merged, deduplicated list to.

### `validate_lists.py`

Validates one or more comma-separated word list files, checking for
duplicate entries and entries containing an apostrophe. Exits with a
non-zero status and prints the offending entries if any issues are found.

```sh
python3 validate_lists.py italian/italian-merged.txt
```

This check also runs automatically as a GitHub Actions workflow
(`.github/workflows/validate-word-lists.yml`) against any `.txt` files
changed in a pull request.
