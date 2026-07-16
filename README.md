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

### `split_words.py`

Splits a comma-separated word list into single-word and multi-word
(phrase) entries, writing each group to its own output file.

```sh
python3 split_words.py italian/italian-merged.txt -s italian/italian-words.txt -m italian/italian-expressions.txt
```

- Positional argument: the input file to split.
- `-s` / `--single-output`: output file for single-word entries.
- `-m` / `--multi-output`: output file for multi-word entries.
