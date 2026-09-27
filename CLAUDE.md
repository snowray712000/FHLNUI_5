# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FHL NUI (信望愛聖經工具) is a web-based Bible study tool. The app runs directly in a browser via ES2023 native modules; a Vite build is optional (branch `vite-build`).

- **Entry point**: `index.html` → `index/index.js`
- **Dev server**: `npm run dev` → `http://127.0.0.1:5173/` (Vite; non-module files are served raw, see `vite.config.js`)
- **Build**: `npm run build` → `dist/` (bundles the `index/index.js` module tree + `<link>` CSS; everything loaded at runtime via `<script src>` / `$.ajax` / `fetch` is copied as-is). Test with `npm run preview` → `http://127.0.0.1:5175/`
- **Tests**: `npm test` runs Vitest on `tests/**/*.test.js` (pure functions, e.g. `gcode2.test.js`); older tests are `tests/*.html` opened directly in a browser
- **Greek text**: FHL stores accents as oxia (έ U+1F73); keyboards and NFC produce tonos (U+03AD). They look identical, so write expected Greek in tests as `\u` escapes (editors may normalize literals)

### Build constraints

- Classic `<script src>` files in `index.html` (jQuery plugins, `static/*`, `index/AppVersion.js`, `FHL.*.js`) are concatenated into one deferred `assets/legacy-[hash].js` at build time; they share the global scope, so top-level `var`s are globals. `libs/ijnjs/*` is excluded; its small files are pre-bundled into `assets/ijnjs-preload-[hash].js` (`window.__IJNJS_PRELOAD__`).
- Scripts that must run before `ijnjs.js` (e.g. the inline `window._ = { debounce }`) must stay inline, otherwise they get merged into the deferred legacy bundle.
- Don't derive paths from `document.scripts` / the module's own filename; in `dist/` the module becomes `assets/index-[hash].js`. Use paths relative to the page.
- CSS order matters: `<div class="markdown-body">` inside `<head>` ends `<head>` early, `index/bs4-compat.css` (vite-ignore) sits in Bootstrap 4's old slot, Bootstrap 5 css is appended to `<head>` by `index.js`, then `fhl.css`. Don't reorder without a computed-style diff.
- No React / Vue / lodash / Bootstrap 4. Old `static/` components use `static/commonR/h.js` (`commonR.h`, `setStyle`, `syncChildren`). Map tab loads leaflet on demand (`ensureLeafletAsync`).
- No `$.ajax` / `.load()` / XHR: use `fetch`. ES modules use `index/fetchAsync.es2023.js` (`fetchTextAsync` / `fetchJsonAsync`, non-2xx rejects, `timeout` option); classic scripts use `fhl.json_api_text` etc. in `static/search_api/fhl_api.js`, which now return a Promise (the `isAsync` arg is ignored — await instead). Dead copies with ajax remain in `libs/ijnjs/ijnjsold.js`, `tests/`.
- Node 24 `fs.rmSync` crashes (0xC0000409) on this Windows path with Chinese characters, which is why `emptyOutDir` is off and `npm run build` deletes `dist/` with `fs.promises.rm` first.

## Architecture

### Module System

- `/index/*.es2023.js` — ES2023 native modules (`import`/`export`), the active codebase
- `/libs/ijnjs/` — Core utility library (path handling, async loading; loads jQuery etc. and evals them)
- `/libs/ijnjs-fhl/`, `/libs/ijnjs-ui/` — FHL-specific extensions (Bible constants, dialogs). The old root `/ijnjs/`, `/ijnjs-fhl/` copies were removed
- `/static/js/` — Legacy Vue/webpack bundles (not actively modified)

### Key Patterns

**Singleton instances** — Classes expose a static `.s` accessor for their singleton:
```js
BookSelect.s    // the singleton instance
TPPageState.s   // global page state (also aliased as `ps`)
window.fhlLecture = FhlLecture.s
```

**Page state** — `TPPageState.s` is the central state:
- `ps.bookIndex` (1–66), `ps.chap`, `ps.sec` (verse), `ps.versions`, `ps.displayMode`

**URL routing** — `location.hash` is the source of truth (format: `#/bible/[book]/[chapter]/[verse]`). Render functions should read from the hash; use `history.pushState()` for browser history.

### Bible Text Rendering Pipeline

```
Raw Bible text
  → twcbflow.es2023.js   (parse)
  → DText[]              (intermediate format: [{w, tp, isRef, ...}])
  → cvtDTextsToHtml.es2023.js  (render to HTML)
```

### Display Modes (ps.displayMode)

| Mode | Layout | Translation display |
|------|--------|---------------------|
| 1 | Verse-by-verse | Side-by-side |
| 2 | Verse-by-verse | Interleaved |
| 3 | Paragraph | Side-by-side (default after refactor) |
| 4 | Paragraph | Interleaved |

### Key Files

| File | Purpose |
|------|---------|
| `index/index.js` | Module bootstrap, imports all components |
| `index/FhlLecture.es2023.js` | Bible text display |
| `index/twcbflow.es2023.js` | Bible text parsing workflow |
| `index/cvtDTextsToHtml.es2023.js` | DText[] → HTML conversion |
| `index/renderTsk.es2023.js` | Chain reference (串珠) rendering |
| `index/do_preach.es2023.js` | Sermon rendering |
| `index/TPPageState.es2023.js` | Global page state singleton |
| `index/DialogHtml.es2023.js` | jQuery UI dialog wrapper (reusable base class) |
| `index/BibleConstant.es2023.js` | Book/chapter/verse metadata |
| `index/BibleConstantHelper.es2023.js` | Address arithmetic (next verse, chapter nav) |

## Documentation Files

| File | Purpose |
|------|---------|
| `docs/z260221a(給ai的總綱).md` | Project overview (Chinese) |
| `docs/z260925a(vite化緣由與過程).md` | Why/how the Vite build was added, the three loading worlds (ES module / legacy classic scripts / ijnjs eval), don't-touch list (Chinese) |
| `docs/z260925b(dev、build與上傳注意事項).md` | Cautions for dev / build / deploying `dist/` (what to upload, order, cache) (Chinese) |
| `docs/z260926a(搜尋重構-依閱讀位置選範圍與dialog).md` | Search: default scope by the book being read (same book → same author/group → testament → all), SearchApi / SearchSession / SearchDialog, API pitfalls (Chinese) |
| `docs/z260927a(原文搜尋-信望愛內碼與新舊約).md` | Greek / Hebrew search: FHL stores original text in an internal ASCII code, not Unicode; gcode_2 / umscode, ssn.php (NT), bible_bhs_code.json.gz (OT), oxia vs tonos pitfalls (Chinese) |
| `docs/z260927b(典藏清單篩選-chip與可收合).md` | 典藏 (ob) list filters: category chips, language chips + text box, table/card, collapsible; client-side filtering, faceted counts, partial repaint while typing, `--ob-*` css vars (Chinese) |
| `docs/z260927c(原文字典-高亮正在讀的經文).md` | Dictionary dialog highlights refs matching the verse being read (active address): same verse / same chapter (incl. whole-chapter refs), where each entry point gets its activeAddr, `--ref-act-*` css vars (Chinese) |
| `docs/z260927d(地圖分頁-切走後其它分頁無法捲動).md` | Map tab: leaflet lives in child div `#fhlmapContainer`, `fhlmap_dispose()` when leaving; otherwise leaflet's wheel preventDefault / `touch-action:none` stay on the shared `#fhlInfoContent` and other tabs can't scroll (Chinese) |
| `docs/z260927e(地圖地名-連到聖光聖經地理).md` | Map tab: clicking a place label opens a popup linking to 聖光聖經地理 (biblegeography.holylight.org.tw) name search / chapter list / Google site search; which sobj.php name field matches best (`cname`, strip `•`), gb=1 fetches traditional names by id, clickable permanent tooltips in leaflet 1.3.4 (Chinese) |
| `docs/z260927f(有聲聖經-重寫與新版本).md` | Audio tab rewrite: 22 audio versions + mp4 slides, coverage from `new/audio_hb.php` (au.php always returns a URL), URL rule, alternate readers (bid `1A`), one persistent `<video>` kept outside `#fhlInfoContent` so playback survives tab switches, mini player, follow-reading, `--au-*` css vars (Chinese) |
| `docs/z260222e(串珠規畫).md` | Chain reference (串珠) format & plan |
| `docs/DialogHtml使用心得.md` | DialogHtml tips: initial position relative to a dom, initial width (was `readmeRD.md`) |
| `docs/z250928a(hash與網址列).md` | Hash/routing architecture notes |
| `readme.md` | Project README for humans (features, dev/build, layout) |
| `docs/使用說明.md` | User guide (Chinese), task-oriented. Update it when a release adds or changes a user-visible feature |
| `docs/dependency-graph.mmd` | Module import graph (mermaid), from `index.js` entry point. Regenerate after large restructuring with `npm run depgraph` |

## Data Files

- `index/bible_fhlwh.json` / `.json.gz` — Bible text index (gzip via pako)
- `index/bible_bhs_code.json.gz` — whole OT Hebrew (bhs) in FHL's internal ASCII code, for Hebrew search. Regenerate with `npm run gen:bhs`
- `index/audio_bible_index.json` — which chapters each audio bible version has (and which have mp4 slides). Regenerate with `npm run gen:audio`
- `index/sd_cnt.json`, `index/sd_same.json` — Strong's Number data
- `app_versions.json` — Version changelog (update `currentSWVer` in `index.html` on release)

## Adding a New Component

1. Create `index/NewComponent.es2023.js` with a class and static `.s` singleton
2. Import it in `index/index.js`
3. Assign to `window.newComponent = NewComponent.s` for global access
