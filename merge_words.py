#!/usr/bin/env python3
"""Merge comma-separated word lists: dedupe entries, drop any containing an apostrophe, and drop entries longer than 32 characters."""

import argparse

MAX_LENGTH = 32

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

with open(args.output, "w", encoding="utf-8") as f:
    f.write(",".join(result))

print(f"Wrote {len(result)} unique words to {args.output}")
