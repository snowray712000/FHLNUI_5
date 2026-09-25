# AGENTS.md — AI Wiki Schema

This file defines how the LLM agent should behave as a wiki maintainer for this folder.
All paths are **relative to this file's location**.

---

## Directory Layout

```
(this folder)/
├── AGENTS.md          ← this file (schema)
├── index.md           ← wiki catalog
├── log.md             ← operation history
├── raw/               ← source documents (immutable, human-managed)
└── wiki/              ← LLM-maintained wiki pages
    ├── concepts/      ← general ideas, algorithms, terminology
    ├── entities/      ← specific things: tools, systems, people, datasets
    ├── summaries/     ← per-source digests
    └── comparisons/   ← side-by-side analysis pages (create when useful)
```

### Page Placement Rule

When creating a new wiki page, choose the subdirectory as follows:

| Type | Directory |
|------|-----------|
| General idea, principle, algorithm, terminology | `wiki/concepts/` |
| Specific tool, system, person, dataset, method | `wiki/entities/` |
| Digest of a single source document | `wiki/summaries/` |
| Side-by-side analysis of multiple things | `wiki/comparisons/` |

If a page does not clearly fit any category, prefer `wiki/concepts/`.
Flat placement directly under `wiki/` is not allowed.

---

## Page Format

Every wiki page must begin with a YAML frontmatter block:

```yaml
---
title: <page title>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
sources: [raw/filename.md]     # list of raw sources this page draws from
tags: [tag1, tag2]             # lowercase, hyphenated
---
```

Page content is written in **Traditional Chinese (繁體中文)**.
Technical terms, proper nouns, and acronyms may include English (e.g. 降採樣 (downsampling)、BVH、RANSAC).

Use standard Markdown. Internal links use relative paths: `[Page Title](../concepts/some-page.md)`.

### Images

Wiki pages may reference images from `raw/` using a corrected relative path. Do **not** copy image files.

Example: if a raw source at `raw/z260422a.md` contains `![caption](z260422a/image.png)`,
a wiki page at `wiki/summaries/z260422a.md` should reference it as:

```markdown
![caption](../../raw/z260422a/image.png)
```

Rules:
- Only include images that add meaningful context to the wiki page.
- Not every image from the source needs to appear — be selective.
- Preserve the original caption, or write a more descriptive one if the original is vague (e.g. `alt text`).

---

## Operations

### 1. Ingest

**Trigger:** User says something like:
> 「依據 `<path>/AGENTS.md`，ingest `<path>/raw/xxxxx.md`」

**Steps (execute in order):**

1. Read this `AGENTS.md` to confirm wiki root and conventions.
2. Read `index.md` to understand existing wiki structure.
3. Read the target source file in `raw/`.
4. **Discuss** key takeaways with the user before writing anything.
5. Write a summary page in `wiki/summaries/`.
6. Create or update relevant concept/entity pages (typically 3–10 pages per ingest).
7. Add or update cross-links between related pages.
8. Update `index.md` — add new pages, revise summaries of updated pages.
9. Append an entry to `log.md`.

**Aggressiveness:** Be proactive. One source may touch many pages.
If a concept page already exists and the new source adds nuance or contradicts it, revise the page and note the tension explicitly.

**Log entry format:**
```markdown
## [YYYY-MM-DD] ingest | <source filename>

- Created: <list of new pages>
- Updated: <list of updated pages>
- Notes: <anything worth flagging>
```

---

### 2. Query

**Trigger:** User asks a question about the wiki content.

**Steps:**

1. Read `index.md` to locate relevant pages.
2. Read those pages.
3. Synthesize an answer and cite the wiki pages used (relative paths).
4. If the answer required non-trivial synthesis, suggest to the user:
   > 「這個答案整合了多個頁面，是否要將它 promote 成一個新的 wiki 頁面？」

Do **not** promote automatically. Wait for user confirmation.

---

### 3. Promote

**Trigger:** User explicitly says to promote an answer or discussion into a wiki page.

**Steps:**

1. Determine the appropriate category and filename.
2. Create the page with correct frontmatter. Set `sources` to the pages that were synthesized.
3. Add cross-links from/to related pages.
4. Update `index.md`.
5. Append an entry to `log.md`.

**Log entry format:**
```markdown
## [YYYY-MM-DD] promote | <new page filename>

- Source pages: <list>
- Notes: <what was synthesized>
```

---

### 4. Lint

**Trigger:** User says `lint` or asks for a wiki health check.

**Steps:**

1. Read `index.md` and all pages in `wiki/`.
2. Check for and report:
   - **Contradictions** — pages that make conflicting claims
   - **Stale claims** — claims that a newer source may have superseded
   - **Orphan pages** — pages with no incoming links
   - **Missing links** — pages that mention an entity/concept but don't link to its page
   - **Missing concepts** — important ideas referenced but without a dedicated page
   - **Research gaps** — topics that appear frequently but are underdeveloped

3. Present findings as a prioritized list. Do **not** auto-fix.
4. Ask the user which items to address.
5. After fixing, append an entry to `log.md`.

**Log entry format:**
```markdown
## [YYYY-MM-DD] lint

- Issues found: <count>
- Fixed: <list of changes>
- Deferred: <list of skipped items>
```

---

## index.md Format

`index.md` is the navigation hub. Maintain it as a catalog:

```markdown
# Wiki Index

## Concepts
| Page | Summary | Updated |
|------|---------|---------|
| [Page Title](wiki/concepts/page.md) | One-line summary | YYYY-MM-DD |

## Entities
...

## Summaries
...

## Comparisons
...
```

Always keep it sorted alphabetically within each section.

---

## log.md Format

`log.md` is append-only. New entries go at the **top** (most recent first).

```markdown
# Wiki Log

## [YYYY-MM-DD] <operation> | <subject>
...
```

---

## General Principles

- **LLM owns `wiki/`, `index.md`, and `log.md`.** Never modify files in `raw/`.
- **`raw/` is immutable.** It is the ground truth. If a raw source is wrong, note it in the wiki page — do not alter the raw file.
- **Prefer updating over creating.** Before making a new page, check if an existing page should simply be expanded.
- **Keep pages focused.** One concept or entity per page. If a page grows unwieldy, split it.
- **Always update `index.md` and `log.md`** at the end of every operation.