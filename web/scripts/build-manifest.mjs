#!/usr/bin/env node
// Scans the repo's lists/<category> folders for .txt word list files,
// copies them into web/public/lists/<category>/, and writes
// web/public/manifest.json describing every available list.
//
// Runs automatically before `npm run dev` / `npm run build` (see package.json),
// so new categories/lists added to the repo show up on the site with no
// manual configuration.

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(__dirname, "..");
const REPO_ROOT = join(WEB_ROOT, "..");
const LISTS_ROOT = join(REPO_ROOT, "lists");
const LISTS_OUTPUT_DIR = join(WEB_ROOT, "public", "lists");
const MANIFEST_OUTPUT_PATH = join(WEB_ROOT, "public", "manifest.json");

function toDisplayName(fileName, category) {
  let name = fileName.replace(/\.txt$/, "");
  const prefix = `${category}-`;
  if (name.toLowerCase().startsWith(prefix.toLowerCase())) {
    name = name.slice(prefix.length);
  }
  return name
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function countEntries(content) {
  return content
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean).length;
}

async function findCategoryDirs() {
  const entries = await readdir(LISTS_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function buildManifest() {
  if (existsSync(LISTS_OUTPUT_DIR)) {
    await rm(LISTS_OUTPUT_DIR, { recursive: true });
  }

  const categories = await findCategoryDirs();
  const lists = [];

  for (const category of categories) {
    const categoryDir = join(LISTS_ROOT, category);
    const entries = await readdir(categoryDir, { withFileTypes: true });
    const txtFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
      .map((entry) => entry.name)
      .sort();

    if (txtFiles.length === 0) continue;

    const categoryOutputDir = join(LISTS_OUTPUT_DIR, category);
    await mkdir(categoryOutputDir, { recursive: true });

    for (const fileName of txtFiles) {
      const content = await readFile(join(categoryDir, fileName), "utf-8");
      await writeFile(join(categoryOutputDir, fileName), content, "utf-8");

      lists.push({
        id: `${category}/${fileName}`,
        category,
        displayName: toDisplayName(fileName, category),
        path: `lists/${category}/${fileName}`,
        wordCount: countEntries(content),
      });
    }
  }

  await mkdir(dirname(MANIFEST_OUTPUT_PATH), { recursive: true });
  await writeFile(MANIFEST_OUTPUT_PATH, JSON.stringify(lists, null, 2), "utf-8");

  console.log(`Wrote manifest with ${lists.length} list(s) across ${categories.length} categor${categories.length === 1 ? "y" : "ies"}.`);
}

await buildManifest();
