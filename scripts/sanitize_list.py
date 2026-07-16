#!/usr/bin/env python3
"""Sanitize a comma-separated word list: remove duplicate entries, entries containing an apostrophe, and entries longer than 32 characters."""

import argparse

MAX_LENGTH = 32

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("input_file", help="Word list file to sanitize")
parser.add_argument("-o", "--output", help="Output file (defaults to overwriting the input file)")
args = parser.parse_args()

output_path = args.output or args.input_file

with open(args.input_file, encoding="utf-8") as f:
    content = f.read()

seen = set()
result = []

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

with open(output_path, "w", encoding="utf-8") as f:
    f.write(",".join(result))

print(f"Wrote {len(result)} sanitized words to {output_path}")
