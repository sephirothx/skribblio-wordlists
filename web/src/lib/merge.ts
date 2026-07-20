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

export interface MergeResult {
  /** The final, deduplicated, sanitized, and length-capped list of entries. */
  entries: string[];
  /** How many entries were randomly dropped to fit the requested entry count. */
  removedForEntryLimit: number;
  /** How many entries were randomly dropped to fit under the character limit. */
  removedForLength: number;
}

export interface MergeOptions {
  /** Cap the number of entries in the result. Unset means no entry cap. */
  maxEntries?: number;
  /** Cap the comma-joined result to this many characters. Unset means no character cap. */
  maxLength?: number;
}

/**
 * Merges multiple lists of entries into a single deduplicated, sanitized
 * list. Entries are kept in the order the lists are given (and first-seen
 * order within each list), so the result is deterministic regardless of
 * selection order. Neither limit is applied unless explicitly requested
 * via `options`. If `maxEntries` is given and exceeded, random entries
 * are dropped to fit. If `maxLength` is given, the comma-joined result is
 * then capped to that many characters, again by dropping random entries.
 */
export function mergeLists(entryLists: string[][], options: MergeOptions = {}): MergeResult {
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

  let removedForEntryLimit = 0;
  if (options.maxEntries !== undefined && result.length > options.maxEntries) {
    removedForEntryLimit = trimToCount(result, Math.max(0, options.maxEntries));
  }

  let removedForLength = 0;
  if (options.maxLength !== undefined) {
    removedForLength = trimToLength(result, options.maxLength);
  }

  return { entries: result, removedForEntryLimit, removedForLength };
}

/**
 * Removes random entries from `words` (in place) until at most `maxCount`
 * remain. Returns the number of entries removed.
 */
function trimToCount(words: string[], maxCount: number): number {
  let removed = 0;

  while (words.length > maxCount) {
    const index = Math.floor(Math.random() * words.length);
    words.splice(index, 1);
    removed++;
  }

  return removed;
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


