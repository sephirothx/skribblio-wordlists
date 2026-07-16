import "./style.css";
import type { WordList } from "./lib/manifest";
import { mergeLists, parseEntries } from "./lib/merge";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header>
    <h1>skribbl.io Word List Merger</h1>
    <p>
      Select one or more word lists from
      <a href="https://github.com/sephirothx/skribblio-wordlists" target="_blank" rel="noopener">skribblio-wordlists</a>,
      merge them, and copy the result straight into skribbl.io's custom words box.
    </p>
  </header>
  <main>
    <div class="controls">
      <input id="search" type="search" placeholder="Filter lists..." aria-label="Filter lists" />
      <span id="selected-count" class="selected-count">0 selected</span>
    </div>
    <div id="categories" class="categories"></div>
    <div class="actions">
      <button id="merge-btn" type="button" disabled>Merge selected lists</button>
    </div>
    <section id="result" class="result" hidden>
      <h2>Result</h2>
      <p id="result-count"></p>
      <textarea id="result-text" readonly rows="10"></textarea>
      <div class="result-actions">
        <button id="copy-btn" type="button">Copy to clipboard</button>
        <button id="download-btn" type="button">Download .txt</button>
      </div>
      <p id="copy-feedback" class="feedback" aria-live="polite"></p>
    </section>
  </main>
  <dialog id="preview-modal" class="preview-modal">
    <div class="preview-header">
      <h2 id="preview-title"></h2>
      <button id="preview-close" type="button" aria-label="Close preview">&times;</button>
    </div>
    <p id="preview-meta" class="word-count"></p>
    <div id="preview-body" class="preview-body"></div>
  </dialog>
`;

const searchInput = document.querySelector<HTMLInputElement>("#search")!;
const categoriesEl = document.querySelector<HTMLDivElement>("#categories")!;
const mergeBtn = document.querySelector<HTMLButtonElement>("#merge-btn")!;
const selectedCountEl = document.querySelector<HTMLSpanElement>("#selected-count")!;
const resultSection = document.querySelector<HTMLElement>("#result")!;
const resultCountEl = document.querySelector<HTMLParagraphElement>("#result-count")!;
const resultTextEl = document.querySelector<HTMLTextAreaElement>("#result-text")!;
const copyBtn = document.querySelector<HTMLButtonElement>("#copy-btn")!;
const downloadBtn = document.querySelector<HTMLButtonElement>("#download-btn")!;
const copyFeedback = document.querySelector<HTMLParagraphElement>("#copy-feedback")!;
const previewModal = document.querySelector<HTMLDialogElement>("#preview-modal")!;
const previewTitle = document.querySelector<HTMLHeadingElement>("#preview-title")!;
const previewMeta = document.querySelector<HTMLParagraphElement>("#preview-meta")!;
const previewBody = document.querySelector<HTMLDivElement>("#preview-body")!;
const previewClose = document.querySelector<HTMLButtonElement>("#preview-close")!;

const selected = new Set<string>();
let lists: WordList[] = [];
const listEntriesCache = new Map<string, string[]>();

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function updateSelectedCount() {
  selectedCountEl.textContent = `${selected.size} selected`;
  mergeBtn.disabled = selected.size === 0;
}

function renderCategories(filter: string) {
  const query = filter.trim().toLowerCase();
  const byCategory = new Map<string, WordList[]>();

  for (const list of lists) {
    const matches =
      !query ||
      list.displayName.toLowerCase().includes(query) ||
      list.category.toLowerCase().includes(query);
    if (!matches) continue;
    if (!byCategory.has(list.category)) byCategory.set(list.category, []);
    byCategory.get(list.category)!.push(list);
  }

  if (byCategory.size === 0) {
    categoriesEl.innerHTML = `<p class="empty">No lists match your search.</p>`;
    return;
  }

  categoriesEl.innerHTML = [...byCategory.entries()]
    .map(
      ([category, categoryLists]) => `
        <fieldset class="category">
          <legend>${escapeHtml(category)}</legend>
          ${categoryLists
            .map(
              (list) => `
                <div class="list-item">
                  <label>
                    <input type="checkbox" value="${escapeHtml(list.id)}" ${selected.has(list.id) ? "checked" : ""} />
                    <span>${escapeHtml(list.displayName)}</span>
                    <span class="word-count">${list.wordCount}</span>
                  </label>
                  <button type="button" class="preview-btn" data-id="${escapeHtml(list.id)}" aria-label="Preview ${escapeHtml(list.displayName)}">View</button>
                </div>
              `,
            )
            .join("")}
        </fieldset>
      `,
    )
    .join("");
}

categoriesEl.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;
  if (target.type !== "checkbox") return;
  if (target.checked) {
    selected.add(target.value);
  } else {
    selected.delete(target.value);
  }
  updateSelectedCount();
});

categoriesEl.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(".preview-btn");
  if (!target) return;
  const id = target.dataset.id;
  if (id) openPreview(id);
});

async function loadListEntries(list: WordList): Promise<string[]> {
  const cached = listEntriesCache.get(list.id);
  if (cached) return cached;
  const response = await fetch(`${import.meta.env.BASE_URL}${list.path}`);
  if (!response.ok) throw new Error(`Failed to load ${list.path}`);
  const entries = parseEntries(await response.text());
  listEntriesCache.set(list.id, entries);
  return entries;
}

async function openPreview(id: string) {
  const list = lists.find((candidate) => candidate.id === id);
  if (!list) return;

  previewTitle.textContent = list.displayName;
  previewMeta.textContent = `${list.wordCount} word${list.wordCount === 1 ? "" : "s"} \u2022 ${list.category}`;
  previewBody.innerHTML = `<p class="empty">Loading...</p>`;
  previewModal.showModal();

  try {
    const entries = await loadListEntries(list);
    const sorted = [...entries].sort((a, b) => a.localeCompare(b));
    previewBody.innerHTML = sorted.map((entry) => `<span class="chip">${escapeHtml(entry)}</span>`).join("");
  } catch (error) {
    console.error(error);
    previewBody.innerHTML = `<p class="empty">Failed to load this list. Please try again.</p>`;
  }
}

previewClose.addEventListener("click", () => previewModal.close());
previewModal.addEventListener("click", (event) => {
  if (event.target === previewModal) previewModal.close();
});

searchInput.addEventListener("input", () => {
  renderCategories(searchInput.value);
});

function showResult(entries: string[], removedForLength: number) {
  resultSection.hidden = false;
  let countText = `${entries.length} unique word${entries.length === 1 ? "" : "s"}`;
  if (removedForLength > 0) {
    countText += ` (dropped ${removedForLength} at random to stay under skribbl.io's 20,000-character limit)`;
  }
  resultCountEl.textContent = countText;
  resultTextEl.value = entries.join(",");
  copyFeedback.textContent = "";
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

mergeBtn.addEventListener("click", async () => {
  mergeBtn.disabled = true;
  mergeBtn.textContent = "Merging...";
  try {
    const selectedLists = lists.filter((list) => selected.has(list.id));
    const entryLists = await Promise.all(selectedLists.map((list) => loadListEntries(list)));
    const { entries, removedForLength } = mergeLists(entryLists);
    showResult(entries, removedForLength);
  } catch (error) {
    console.error(error);
    alert("Something went wrong merging the selected lists. Please try again.");
  } finally {
    mergeBtn.disabled = selected.size === 0;
    mergeBtn.textContent = "Merge selected lists";
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultTextEl.value);
    copyFeedback.textContent = "Copied to clipboard!";
  } catch (error) {
    console.error(error);
    resultTextEl.select();
    copyFeedback.textContent =
      "Could not access the clipboard automatically — text has been selected, press Ctrl/Cmd+C to copy.";
  }
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([resultTextEl.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "skribbl-word-list.txt";
  anchor.click();
  URL.revokeObjectURL(url);
});

async function init() {
  const response = await fetch(`${import.meta.env.BASE_URL}manifest.json`);
  lists = await response.json();
  renderCategories("");
  updateSelectedCount();
}

init();
