#!/usr/bin/env python3
"""Validate comma-separated word list files: no duplicate entries, no apostrophes, no entries longer than 32 characters."""

import argparse
import sys

MAX_LENGTH = 32

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("input_files", nargs="+", help="Word list files to validate")
args = parser.parse_args()

had_errors = False

for path in args.input_files:
    with open(path, encoding="utf-8") as f:
        content = f.read()

    seen = set()
    duplicates = set()
    apostrophe_words = []
    too_long_words = []

    for word in content.split(","):
        word = word.strip()
        if not word:
            continue
        if "'" in word:
            apostrophe_words.append(word)
        if len(word) > MAX_LENGTH:
            too_long_words.append(word)
        if word in seen:
            duplicates.add(word)
        else:
            seen.add(word)

    if duplicates or apostrophe_words or too_long_words:
        had_errors = True
        print(f"{path}:")
        for word in sorted(duplicates):
            print(f"  duplicate entry: {word}")
        for word in apostrophe_words:
            print(f"  entry contains apostrophe: {word}")
        for word in too_long_words:
            print(f"  entry exceeds {MAX_LENGTH} characters: {word}")

if had_errors:
    sys.exit(1)

print("All word lists are sanitized.")
