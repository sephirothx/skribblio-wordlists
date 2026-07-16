// Mirrors the sanitization rules enforced by the repo's Python scripts
// (merge_words.py / validate_lists.py): dedupe entries, drop any entry
// containing an apostrophe, and drop any entry longer than MAX_LENGTH
// characters.

export const MAX_LENGTH = 32;

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

/**
 * Merges multiple lists of entries into a single deduplicated, sanitized
 * list. Entries are kept in the order the lists are given (and first-seen
 * order within each list), so the result is deterministic regardless of
 * selection order.
 */
export function mergeLists(entryLists: string[][]): string[] {
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

  return result;
}
