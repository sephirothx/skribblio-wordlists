// Mirrors the sanitization rules enforced by the repo's Python scripts
// (merge_words.py / validate_lists.py): dedupe entries, drop any entry
// containing an apostrophe, and drop any entry longer than MAX_LENGTH
// characters.

export const MAX_LENGTH = 32;

// skribbl.io's custom word list input has a hard cap of 20000 characters
// (including the comma separators).
export const MAX_TOTAL_LENGTH = 20000;

/**
 * Parses a raw comma-separated word list file's contents into a list of
 * trimmed, non-empty entries.
 */
export function parseEntries(rawContent: string): string[] {
  return rawContent
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export interface MergeResult {
  /** The final, deduplicated, sanitized, and length-capped list of entries. */
  entries: string[];
  /** How many entries were randomly dropped to fit under MAX_TOTAL_LENGTH. */
  removedForLength: number;
}

/**
 * Merges multiple lists of entries into a single deduplicated, sanitized
 * list. Entries are kept in the order the lists are given (and first-seen
 * order within each list), so the result is deterministic regardless of
 * selection order. If the comma-joined result would exceed
 * MAX_TOTAL_LENGTH characters, random entries are dropped until it fits.
 */
export function mergeLists(entryLists: string[][]): MergeResult {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entries of entryLists) {
    for (const entry of entries) {
      if (entry.includes("'")) continue;
      if (entry.length > MAX_LENGTH) continue;
      if (seen.has(entry)) continue;
      seen.add(entry);
      result.push(entry);
    }
  }

  const removedForLength = trimToLength(result, MAX_TOTAL_LENGTH);
  return { entries: result, removedForLength };
}

/**
 * Removes random entries from `words` (in place) until the comma-joined
 * length is at most `maxLength`. Returns the number of entries removed.
 */
function trimToLength(words: string[], maxLength: number): number {
  let total = words.reduce((sum, word) => sum + word.length, 0) + Math.max(words.length - 1, 0);
  let removed = 0;

  while (total > maxLength && words.length > 0) {
    const index = Math.floor(Math.random() * words.length);
    const [word] = words.splice(index, 1);
    total -= word.length;
    if (words.length > 0) total -= 1;
    removed++;
  }

  return removed;
}

