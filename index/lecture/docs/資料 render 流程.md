# 資料 render 流程

#### 整體流程一覽

```
API Response (bible_text: string，每節一筆)
  ↓
cvt_others()          [index/cvt_others.js]
  → RecordWithAddr[]  [book, chap, sec, string]
  → DTextsWithAddr[]  [book, chap, sec, DText[]]
  ↓
build_view_model()    [index/lecture/FhlLecture_render_core.js]
  → ContentVm { paragraphDataUsed, versions: VmVersion[] }
  ↓
build_layout_vm()
  → LayoutVm { mode, copyDir, vercols: VercolItem[] }
  ↓
render_paragraph_div()  × N
  → render_dtexts()   [index/render_dtexts.js]
    → dtexts_render() [index/dtext/dtexts_render.js]
      → JQuery<HTMLElement>
  ↓
#lecMain > .vercol > .paragraph > .lec > .verseContent
```

---

#### DText 物件設計

`DText` 定義在 `index/DText.js`，是解析後每個「文字節點」的資料結構：

**核心文字**
| 欄位 | 型別 | 說明 |
|------|------|------|
| `w` | string | 主要文字內容 |

**Strong Number（原文編碼）**
| 欄位 | 型別 | 說明 |
|------|------|------|
| `sn` | string | Strong 編號（不含 H/G 前綴，去掉首零） |
| `tp` | `'H'｜'G'` | H=Hebrew，G=Greek |
| `tp2` | `'WG'｜'WTG'｜'WAG'｜'WTH'｜'WH'` | 擴展類型（T=時態標記） |
| `isSnActived` | `0｜1` | 是否為目前 active 的 SN |
| `isCurly` | `1` | 花括號標記 |

**格式旗標**
| 欄位 | 型別 | 說明 |
|------|------|------|
| `isTitle1` | `1` | 標題（新譯本 h3，和合本 2010 h2） |
| `isBold` | `0｜1` | 粗體 |
| `isName` | `0｜1` | 私名號（底線） |
| `isGODSay` | `0｜1` | 紅字（耶穌的話） |
| `isOrigNotExist` | `0｜1` | 虛點點（原文不存在） |
| `ispun` | `0｜1` | 標點符號節點 |
| `cssColor` | string | CSS color，例如 `'rgb(195,39,43)'` |
| `class` | string | HTML class 字串 |

**括號**
| 欄位 | 說明 |
|------|------|
| `isParenthesesFW` | 全型括號（和合本注解/標題） |
| `isParenthesesHW` | 半型括號（cbol） |
| `isParenthesesFW2` | 連續雙層全型括號（新譯本詩3:1） |

**特殊結構**
| 欄位 | 說明 |
|------|------|
| `isBr` | 換行 |
| `isHr` | 水平線（原文字典分隔） |
| `children` | 子 DText[]（inline 嵌套，例如括號包文字+SN） |
| `tpContainer` | 配合 children，記錄容器原始 tag（`'<div class="idt">'` 等） |
| `childrenlist` | ul/li 結構用 |
| `marker` | ordered list 的標籤，例如 `'1.'`、`'(一)'` |
| `joTable` | 表格資料（`DTable`） |
| `rawTable` | raw string 表格（非 joTable） |

**交互參照**
| 欄位 | 說明 |
|------|------|
| `isRef` | 標記是交互參照 |
| `refDescription` | 參照描述字串，例如 `'創1:1,5,7-9;2:3-1'` |
| `refAddresses` | 參照地址陣列 `DAddress[]` |

**腳注**
| 欄位 | 說明 |
|------|------|
| `foot` | `DFoot` 腳注資料（id、位址、內容） |

---

#### cvt_others：raw string → DText[]

**檔案：** `index/cvt_others.js`
**簽名：** `cvt_others(version, RecordWithAddr[]) → DTextsWithAddr[]`

每節 bible_text 字串依序經過：

1. `replaceNewLineToBr()` — 換行符號 → `isBr:1`
2. `replaceOrigToPair()` — 原文標記改成成對標記，避免 DOMParser 解析失敗
3. `text_like_foot()` — （限 rcuv）處理像腳注的內文
4. `replaceKJVToPair()` / `replaceCnetFootReference()` / `replaceCsbFootReference()` — 版本特殊處理
5. `doUsingDOMParsor()` — 解析 h2/h3/b/u/WH/WG 等 HTML 標籤
6. `attach_sn_text()` — （unv/kjv/rcuv/fhlwh/bhs）附加 Strong Number（`sn` 欄位）
7. `addParentheses()` — 產生 `isParenthesesFW/HW` 欄位
8. `addReference()` — 解析交互參照，產生 `isRef`/`refAddresses`
9. `runAddFoot()` — 附加腳注（`foot` 欄位）

---

#### dtexts_render：DText[] → jQuery HTMLElement

**檔案：** `index/dtext/dtexts_render.js`
**簽名：** `dtexts_render(dtexts: DText[]) → JQuery<HTMLElement>`

對每個 DText 呼叫 `dtext_render(dtext)`，按優先順序判斷型別：

| 條件 | 產生元素 |
|------|---------|
| `isHr` | `<hr/>` |
| `isBr` | `<br/>` |
| `rawTable` | `<pre class='raw-table'>` |
| `joRaw` | `$(dtext.joRaw)` 直接轉 jQuery |
| `joTable` | `render_joTable()` → `<div.joTable><table>...` |
| `childrenlist` | `render_childrenlist()` → `<ul><li class='hanging-indent'>...` |
| `children` | `render_children()` → 遞迴，外包 tpContainer tag |
| `foot` | `render_foot()` → `<span.foot>【註...】` |
| `isRef` | `render_ref()` → `<span.ref addr-data=...>` |
| `sn`（有 tp2） | `render_sn()` → `<span.sn tp=... sn=...>` |
| `sn`（無 tp2） | `render_sn()` → `<span.sn-text>` |
| 其他 | `render_regular_text()` → `<span class='...'>` |

`render_regular_text` 中，旗標欄位直接對應 CSS class：
`isTitle1 → .isTitle1`、`isBold → .isBold`、`isName → .isName`、`isGODSay → .isGODSay`、`isOrigNotExist → .isOrigNotExist` 等。

---

#### FhlLecture_render_core 流程

**檔案：** `index/lecture/FhlLecture_render_core.js`

```
FhlLecture_render_core(rspApp, mode)
  ├─ build_view_model(rspApp, mode)
  │    ├─ get_paragraphs(mode, rspApp)     ← mode 1/2: fake 分段; mode 3/4: 真實段落
  │    ├─ cvt_others(version, records)     ← string → DText[]
  │    ├─ queryFootsAsync() [選用]          ← ps.foot_note_show_method == 2 時
  │    └─ grouping_by_paragraph_for_dtexts_with_addr()
  │         → VmVersion[] { version, isRtl, paragraphs: VmParagraph[] }
  │              VmParagraph { paragraphIndex, title, verses: VmVerse[] }
  │                   VmVerse { book, chap, sec, dtexts, verseLabel,
  │                             mergedSecs, isMergePlaceholder,
  │                             hideVerseNumber, hideVerseContent }
  │
  ├─ build_layout_vm(contentVm, mode, copyDir)
  │    copyDir = mode 1/3 → "col"（或 "row"）; mode 2/4 → "col"
  │    → VercolItem[] { version, isRtl, paragraph }
  │
  ├─ generate_htmlContent_with_VersionColumns()
  │    mode 1/3: 每個版本一欄 (.vercol)
  │    mode 2/4: 只有一欄
  │
  └─ for each VercolItem → render_paragraph_div()
       └─ for each verse → render_dtexts() → dtexts_render()
            → span.lec[ver,chap,sec,book] > span.verseContent
```

**"a" 節（併入上節）處理：**
某些節的 bible_text 為 `"a"`，代表該節應併入上節顯示。`build_view_model` 中偵測到後，上節的 `verseLabel` 改為 `"20-21"`，本節設為 `hideVerseContent:true` 不顯示內容。

---

#### Mode 1-4 版面差異

| Mode | 段落單位 | 欄位配置 | 適用情境 |
|------|---------|---------|---------|
| 1 | 每節一段（fake）| 多欄並排 | 多譯本對照，節為單位 |
| 2 | 每節一段（fake）| 單欄交錯 | 交錯閱讀多譯本 |
| 3 | 真實段落 | 多欄並排 | 多譯本對照，段落為單位 |
| 4 | 真實段落 | 單欄交錯 | 按段落交錯閱讀 |
