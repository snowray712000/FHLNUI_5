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
- No React / Vue / lodash / Bootstrap 4. `static/commonR/` (the React-replacement `commonR.h`) was removed with the preach rewrite; new UI is ES modules building DOM with `index/auDom.es2023.js` `el()`. Map tab loads leaflet on demand (`ensureLeafletAsync`).
- No hard-coded colors (#hex / rgb() / color names) in css or js: use the semantic vars of `index/theme/theme-vars.css` (in js `cssVar('fg')` from `index/theme/Theme.es2023.js`); only `theme-vars.css` may use Apple color names. `tests/theme-colors.test.js` checks. See docs/z261003b
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
| `index/theme/theme-vars.css` | Semantic color vars (theme); `Theme.es2023.js` theme state |

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
| `docs/z260927f(有聲聖經與講道-重寫與新版本).md` | Audio + preach (講道) tab rewrite, shared `MediaNowPlaying` (one plays at a time, mini player, Media Session). Audio: 22 audio versions + mp4 slides, coverage from `new/audio_hb.php` (au.php always returns a URL), URL rule, alternate readers (bid `1A`), one persistent `<video>` kept outside `#fhlInfoContent` so playback survives tab switches, mini player, follow-reading, `--au-*` css vars (Chinese) |
| `docs/z260928a(原文資料-由bible_parsing產生與舊約SN).md` | NT/OT original text with SN (`bible_fhlwh.json.gz`, `bible_bhs.json.gz`) and OT search code (`bible_bhs_code.json.gz`) generated from FHL's open `bible_parsing.zip` (`npm run gen:orig`); db structure, why text comes from wid=0 (word rows have typos), OT `uword` reversed line order, alignment rules, `npm run check:data` (Chinese) |
| `docs/z260928b(註釋交互參照-資料漏了#的偵測).md` | Commentary cross refs: data sometimes lacks the leading `#`, uses full-width `＃` / `｜`, or lacks the closing `|`; `REGEX_COMMENT_REF` in `index/comments/convertDocToDText.js`, checked against the whole `bible_comm.zip` (Chinese) |
| `docs/z260928c(七十士譯本-由新約字形推SN).md` | LXX SN: no word data, so SN is inferred from the NT parsing form → SN table (`npm run gen:lxx`), coverage and what's left untagged, `<G…>` label only for lxx, LXX-Rahlfs-1935 licensing, why 原文直譯 (cbol) can't get SN the same way (Chinese) |
| `docs/z260928d(SN滑鼠移過去-註釋與搜尋結果也active).md` | Active SN on hover (`SN_Act_Color`, `.snAct` / `.snAct2`) in comments and search results: comment mouseenter read the event instead of `this`; `.search-dlg .seSN` grey outranked `.snAct`; searched SN now purple (Chinese) |
| `docs/z260928e(SN篩選顯示-規畫).md` | SN filter (show only chosen SNs): plan for L1 SN list / L2 lexical POS / L3 per-word morphology (和合本 `{<WG…>}` untranslated, `<WTG5656>` tense codes; parsing db pro/wform), presets for NT/OT, `SnFilter` / `SnFilterDialog`, `tp2` attr on `.sn`, phases P1–P4 (Chinese) |
| `docs/z260928f(SN篩選-讀經組合與說明).md` | SN filter 讀經組合 (lenses, `SN_LENSES`): one click per reading question, `?` help from `docs/SN讀經組合說明.md` (one `## name (id)` section each, rendered with Help's markdown-it, verse links `#/bible/…` also apply the lens), active lens by comparing settings (`cfgKey`), user-saved combos, right-click quick menu; examples verified against sn_morph (Chinese) |
| `docs/z260928g(SN篩選-字上色與詞性提示).md` | SN filter P4: color the words themselves (`SnFilter.colorBy` 'pos' / 'verb', `WORD_COLORS`, `snc-*` classes, `--snc-*` css vars) and a `title` hint (SN + POS + morph, `morphName`); works with SN off; words are the existing `span.sn-text` matched to the next same-SN `.sn` (Chinese) |
| `docs/z260930a(字型大小-一列與對話框組合).md` | Font size: settings panel reduced from 4 rows to one `A− n A+ ⚙` row; `FontSize` state (values stay in ps + `--fontsize*` css vars, link/ratio/custom combos in localStorage `fhlFontSize`, ratio stored so A+/A- don't drift), `FontSizeDialog` presets / my combos / preview, dialog pins its own font-size; later: actual size = overall `scale` % (sidebar A− A+) × situation `profile` (presets, incl. UI size); UI → `--ui-k` multiplier on the fixed UI sizes (left panel, version-name row, info tabs, 典藏 controls); old localStorage migrated by `migrateFontSize` (Chinese) |
| `docs/z261008a(字型大小-以介面為基準與觸控下限).md` | Font size model v3 (supersedes the UI-in-profile part of z260930a): background (pt / px / CSS reference pixel / viewport / touch targets / Dynamic Type); UI = 12pt × overall % is the base and not in the profile, profile = content ratios to UI (only 預設 / 投影 presets), `--touch-min` 44px floor with `pointer: coarse` and `--bar-h`; lecture original-language columns (`.lec[ver=fhlwh/lxx/bhs]`) were never wired to Greek / Hebrew size since the grid refactor, now follow them with COBS fonts; version dialog Bootstrap buttons follow content size, `div.group-help` specificity vs the dialog's own min.css; per-tab split (names / descriptions follow content size, buttons / labels / `?` follow UI size: AI, audio / preach, 串珠 toolbar, comment title, map, ▦ resources, help dialog), `#fhlInfoContent` height overflow fix; test pitfalls (no `pointer: coarse` emulation, `fhlPageState` residue); open items (Chinese) |
| `docs/z261008b(拖曳把手-統一小方塊與出處欄寬、原文解析上下可拖).md` | 7.2.5: drag handles share one small knob (col-width line, left/right panel splitters, parsing split; `::before`/`::after`, 44px on `pointer: coarse`, colour on light grey headers); search label column width `--vg-label-w` draggable (`fhlSearchLabelW`, header now also for a single version); parsing top/bottom split `--parsing-top-h` / `#parsingSplit` draggable (`fhlParsingTopH`) (Chinese) |
| `docs/z261008c(典藏-看更多不跳回頂端與表格換行及閱讀按鈕).md` | 7.2.7: 典藏 card 看更多 repaints only `.ob_results` (full `#setState` repaint reset scroll); table cells wrap (`overflow-wrap: anywhere`, only the 閱讀 column nowrap); only the 閱讀 button (`.ob_read_btn[data-read-id]`) opens a book, rows not clickable so text can be selected / copied (Chinese) |
| `docs/z260930b(工具列-合成一列).md` | Top bar merged from 2 rows into one 44px row (`TopBar.es2023.js`): ≡ / ▥ toggle left/right panels, ▦ opens the 信望愛資源 links panel on click (was hover menu), ⋮ collects ▦ ? ⛶ ✉ version / reload when narrow, 🔍 expands search; breakpoints purely in css (1000 / 760 / 560px), `--tb-h` / `--win-top`; `#versionSelect3` / `#windowControl` removed (Chinese) |
| `docs/z260930c(信望愛資源-各連結說明與首頁比對).md` | ▦ 信望愛資源 panel (`#resourcesPanel`, links in `index/Resources.es2023.js` `RESOURCES`): what each link actually is, which app feature it overlaps (專卷研經 = 註釋 tab's `sc.php?book=3`, 經文查詢 = search, smap = map…), homepage items added (合參, 次經, 使徒教父, new 原文學習 / AI groups…) / skipped and why, dead links (Chinese) |
| `docs/z260930d(經文區table化-考量與CSS Grid規畫).md` | Lecture as table or not: what the `index/lecture/` 01–18 demos + `TableSelection/` tried (deleted 2026-10-02, see git history), why table (no JS `reshape` alignment, rowspan for merged verses, rectangular copy) vs why not (table DOM order makes native selection sweep across versions, custom selection breaks touch/scroll and clickable `.sn/.ft/.ref`), stale demo docs; plan: CSS Grid with column-major DOM (`.vercol` `display: contents`), "copy as parallel table" action (floating button after native selection) instead of custom drag, phases + checklist; later the cross-ref dialog and search results share the same model / verse renderer / grid (today 3 render paths); decisions of 2026-09-30 (Chinese) |
| `docs/z261001a(複製對照表-整格為單位與平板觸控).md` | Copy-as-table rules changed after iPad testing: cross-cell (cols or rows) = whole cells, html table + plain; same cell = plain text by the handles. Whole-cell shading `.lct-cell` (Custom Highlight removed), rectangle from the two corner cells. iPad: `::selection` ignored, no touchend/pointerup on handle release → `IDLE_MS` idle = released → sticky (native selection removed), corner knobs `.lct-knob`, long-press another cell re-corners, tap clears, button at bottom center (iOS menu). ASI pitfall, iOS simulator testing tips (Chinese) |
| `docs/z261001b(譯本名稱-uiabv快照與譯本選擇分類).md` | Lecture header version name was sometimes blank: qsb.php has no name and raced `uiabv.php`. Now a hard-coded snapshot (`abvphp_snapshot.js`, `npm run gen:uiabv`) + background refresh, `abvphp.readyAsync(books, isgb)` waits only for unknown versions; why not localStorage; 譯本選擇 dialog `langs` keeps only classification, names from abvphp; gnt6 / cwwuchsb (Chinese) |
| `docs/z261002a(平板拖灰框-touch-punch載入順序與箭頭不反白).md` | iPad couldn't drag the gray splitters: `jquery.ui.touch-punch` was loaded before jQuery UI so it threw on touch devices (dist was likely fine since it's merged into the deferred legacy bundle); what touch-punch affects; ❮ ❯ chapter arrows `user-select: none`; 聖經版本選擇 → 聖經譯本選擇 (gbText key too) (Chinese) |
| `docs/z261002b(節碼-併入上節20-21與搜尋結果節碼).md` | Merged verses (qsb.php `bible_text` "a", e.g. 和合本 西2:21 into 20): shared `isMergedWithPrev` / `extendVerseLabel` / `mergedPlaceholderDTexts` in `VerseGrid.es2023.js`; lecture fix (mode 1 one verse per paragraph lost the previous verse → `lastReal`), cross-ref / search placeholder 「（併入上節）」; search result cells now have verse numbers (copy table consistent); decided plan for copy-as-Markdown button (Chinese) |
| `docs/z261002c(複製為Markdown-格式決定與iOS晚報選取).md` | Copy-as-Markdown "MD" button next to 複製對照表 (text/plain only, no colors, hidden for one-cell selection): side-by-side header = version names (+「經文」label column), mode 1 merged cell (rowspan) →「（併入上節）」, interleaved adds a 譯本 column, `\|` escape, newline → space; `sideGrid` shared with the html table; iOS re-reports the just-removed selection after sticky → treated as long-press → collapsed to one cell, fixed with `#removedRange` (Chinese) |
| `docs/z261002d(平板灰框可按範圍與拖圓點自動捲動).md` | Tablet: splitters get a 32px hit area via transparent `::before` in `@media (pointer: coarse)` (looks 12px; `#fhlLeftWindow` z-index 1 or `#fhlMidWindow` covers the left one's right half); dragging a `.lct-knob` near the top/bottom of the scroll container (`scrollerOf`: `#lecMain`, `.sd-results`, `.ref-dlg`'s dialog content) auto-scrolls (`AUTO_EDGE` 48px, `AUTO_MAX` 20px/frame), re-picking the cell each frame; dragged knob follows the finger and is never hidden (hidden = pointer capture lost) (Chinese) |
| `docs/z261002e(7.1.1正式版-7.0.x總覽與決定不做的).md` | 7.1.1 = first official 7 release: index of what each 7.0.x did (→ which doc), what was tested, and what was decided NOT to do (drag-rectangle selection, copy text from the data model instead of DOM, paragraph titles in copies, gb/b5 names in the version dialog, LAN IP in `isRDLocation`); `index/lecture/` demos deleted afterwards (Chinese) |
| `docs/z261003a(韋式聯式-整段一個標籤與括號是WH編者的意見).md` | NT 韋式 (WH) / 聯式 (UBS) variants `+ w + u +`: one `(韋：…)` label per segment instead of per word, in the lecture (`split_wu_plus` gives spaces `wu` too, `add_wu_label` labels same-wu runs, edge spaces outside) and the parsing tab (label on first/last word span, spans stay clickable); the data's `( )` are WH's `[ ]` (`(( ))` = `[[ ]]`, e.g. Luke 22:43) — editor's judgment, kept, not a conversion bug (Chinese) |
| `docs/z261003b(主題切換-Apple色票與css變數).md` | Theme switching (auto / light / dark / hc-light / hc-dark) with `@fhlnet/color-apple` copied to `index/theme/apple-color-ios.css` (`npm run gen:theme`; importmap / node_modules can't work without build); semantic vars in `index/theme/theme-vars.css` (only place with Apple color names; all other css / js use `--fg`, `--surface-bg`, `--accent`, `--sn-fg`…, per-theme ratios `--tint` / `--hl-*` / `--fill-k` in `color-mix`), `theme-3rd.css` overrides jQuery UI / Bootstrap 5 / github-markdown-css (pinned 5.9.0, it followed the system by itself) / leaflet; early inline script for no flash, `Theme.es2023.js` (`withLightPalette` for copy-table colors), settings row `ThemeTool`; pitfalls (package 0.3.0 cascade bug, bs4 `--danger` clash, leaflet SVG attrs, `color(srgb …)` in clipboard, tertiaryLabel too faint, yellow highlight in dark); `tests/theme-colors.test.js` fails on hard-coded colors (Chinese) |
| `docs/z261003c(主題微調-對話框標題列改回紅色與深色時的虛線).md` | 7.2.1: jQuery UI dialog title bar back to red (`--dlg-title-bg`, systemRed mixed with black for ≥ 4.5:1 white text, `--dlg-k` 70% in hc-dark; other `.ui-widget-header` stay neutral); `--col-line` (opaque Gray3 / Gray2 in dark) for the dashed lines between versions and `.verse-grid` row lines, since `--line` (Apple separator) is translucent and vanishes on black (Chinese) |
| `docs/信望愛資源說明.md` | Intro (100–200 字, for new believers: what it is / 什麼時候用 / 怎麼用) behind the `?` next to each ▦ link; one `## 標題` per link, title must equal the `RESOURCES` title in `index/Resources.es2023.js` (tests/resources.test.js checks); copied to `dist/` |
| `docs/SN讀經組合說明.md` | User-facing help for each 讀經組合 (copied to `dist/`); update when `SN_LENSES` changes — a test checks every lens has a section |
| `docs/z260222e(串珠規畫).md` | Chain reference (串珠) format & plan |
| `docs/DialogHtml使用心得.md` | DialogHtml tips: initial position relative to a dom, initial width (was `readmeRD.md`) |
| `docs/z250928a(hash與網址列).md` | Hash/routing architecture notes |
| `readme.md` | Project README for humans (features, dev/build, layout) |
| `docs/使用說明.md` | User guide (Chinese), task-oriented. Update it when a release adds or changes a user-visible feature |
| `docs/dependency-graph.mmd` | Module import graph (mermaid), from `index.js` entry point. Regenerate after large restructuring with `npm run depgraph` |

## Data Files

- `index/bible_fhlwh.json.gz` / `index/bible_bhs.json.gz` — NT Greek / OT Hebrew with SN embedded (`word<WG2526>`, `word<WH7225>`), loaded instead of qsb.php when the 新約原文 / 舊約馬索拉原文 version is shown. Regenerate both with `npm run gen:orig` (`tools/gen_bible_orig.mjs`) from FHL's open `bible_parsing.zip` (ftp.fhl.net/FHL/COBS/data, sqlite); text from each verse's wid=0 row (OT: `word` converted line by line with `umscode`, since `uword` has reversed line order), SN from the word rows; `ver` in the file = the db's `version.dt`
- `index/bible_bhs_code.json.gz` — whole OT Hebrew (bhs) in FHL's internal ASCII code, for Hebrew search. Also generated by `npm run gen:orig`
- `index/bible_lxx.json.gz` — LXX (七十士譯本) with SN embedded, same format. The LXX has no word data, so `npm run gen:lxx` (`tools/gen_bible_lxx.mjs`) builds a form → SN table from the NT parsing rows and gives each LXX word the SN of the same NT form (unique or ≥ 90% majority); ~84.5% of words get one, words absent from the NT (many names, animals) get none. Text from qsb.php `version=lxx` (cached in `tools/.cache/`); needs `bible_parsing.db` from `gen:orig`. Loaded by `Bible_lxx_json` instead of qsb.php when 七十士譯本 is shown
- `npm run check:data` — HEAD the source zip and compare with the `src.lastModified` stored in those three files; exit 1 if any is outdated
- `index/sn_pos.json.gz` — SN → part of speech (dictionary-form level) for the SN filter presets (`Sn_pos_json`). `npm run gen:snpos` (`tools/gen_sn_pos.mjs`) from `bible_parsing.db`: NT `pro`, OT `wform` Chinese description (drop suffix / article segments — Aramaic article is a suffix — and pausal / qere prefixes). Multiple POS joined by `|`
- `index/sn_morph_nt.json.gz` / `index/sn_morph_ot.json.gz` — each verse's verbs as `sn:code` (NT tense+voice+mood, OT `stem:form` e.g. `q:wy` wayyiqtol) for the SN filter's verb-form options (`Sn_morph_json`). `npm run gen:snmorph` (`tools/gen_sn_morph.mjs`) from `bible_parsing.db`
- `index/tvm_table.json` — 和合本 tense code (`<WTG5723>`, `<WTH8804>`) → the codes above, derived by aligning the whole 和合本 (qsb, cached in `tools/.cache/unv_qsb.json`) with `sn_morph` where an SN occurs once in a verse. `npm run gen:tvm` (run after `gen:snmorph`). OT Strong's codes don't separate wayyiqtol/yiqtol or weqatal/qatal, so values can list several codes
- `static/search_api/abvphp_snapshot.js` — snapshot of `uiabv.php` (version code ↔ name, 繁/簡, ntonly/otonly/strong), loaded before `abvphp_api.js` so names exist at page load (lecture header no longer races `uiabv.php`; it waits only for a version missing from the snapshot). `uiabv.php` still refreshes the dicts in the background. Regenerate with `npm run gen:uiabv` (`tools/gen_uiabv.mjs`), which also lists versions the 譯本選擇 dialog hasn't classified (`langs` in `libs/ijnjs-ui/BibleVersionDialog/BibleVersionDialog.js`, which holds only grouping/year/cds/od; names come from abvphp, `cna` only for versions `uiabv.php` doesn't list)
- `index/audio_bible_index.json` — which chapters each audio bible version has (and which have mp4 slides). Regenerate with `npm run gen:audio`
- `index/sd_cnt.json`, `index/sd_same.json` — Strong's Number data
- `app_versions.json` — Version changelog (update `currentSWVer` in `index.html` on release)

## Adding a New Component

1. Create `index/NewComponent.es2023.js` with a class and static `.s` singleton
2. Import it in `index/index.js`
3. Assign to `window.newComponent = NewComponent.s` for global access
