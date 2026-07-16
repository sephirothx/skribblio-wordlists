#!/usr/bin/env python3
"""Merge comma-separated word lists: dedupe entries, drop any containing an apostrophe, and drop entries longer than 32 characters."""

import argparse
import random

MAX_LENGTH = 32
# skribbl.io's custom word list input has a hard cap of 20000 characters
# (including the comma separators).
MAX_TOTAL_LENGTH = 20000

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("input_files", nargs="+", help="Input files to merge")
parser.add_argument("-o", "--output", required=True, help="Output file name")
args = parser.parse_args()

seen = set()
result = []

for path in args.input_files:
    with open(path, encoding="utf-8") as f:
        content = f.read()
    for word in content.split(","):
        word = word.strip()
        if not word:
            continue
        if "'" in word:
            continue
        if len(word) > MAX_LENGTH:
            continue
        if word not in seen:
            seen.add(word)
            result.append(word)


def trim_to_length(words, max_length):
    """Removes random entries from `words` in place until the comma-joined
    length is at most `max_length`. Returns the number of entries removed."""
    total = sum(len(word) for word in words) + max(len(words) - 1, 0)
    removed = 0

    while total > max_length and words:
        index = random.randrange(len(words))
        word = words.pop(index)
        total -= len(word)
        if words:
            total -= 1
        removed += 1

    return removed


removed_for_length = trim_to_length(result, MAX_TOTAL_LENGTH)

with open(args.output, "w", encoding="utf-8") as f:
    f.write(",".join(result))

print(f"Wrote {len(result)} unique words to {args.output}")
if removed_for_length:
    print(f"Dropped {removed_for_length} entries at random to stay under the {MAX_TOTAL_LENGTH}-character skribbl.io limit.")

