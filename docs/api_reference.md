# FHL NUI — 後端 API 參考文件

> 版本：v5.5.1　更新：2026-03-30

---

## 概觀

### Base URL

| 環境 | Base URL |
|------|----------|
| 生產環境（同域） | 相對路徑 `/json/` `/ajax/` |
| 生產環境（跨域） | `https://bible.fhl.net` |
| 本地開發 | `http://127.0.0.1:5600`（Flask proxy）→ 失敗時回退至本地虛擬 JSON |

判斷目前環境的邏輯在 [index/isRDLocation.es2023.js](../index/isRDLocation.es2023.js)，以及 [index/api/get_domain.js](../index/api/get_domain.js)：

```js
// isRDLocation() = true 代表「本地開發」
location.origin === 'file://'
|| location.hostname === '127.0.0.1'
|| location.hostname === 'localhost'
```

### 驗證 (Authentication)

**無需驗證**。所有端點均為公開 API，不需要 API Key 或 Session Token。

### 共用慣例

- 字元編碼：UTF-8（URL 需 `encodeURI()`，`#` 要手動轉 `%23`）
- `gb` 參數：`0` = 繁體中文，`1` = 簡體中文
- `engs` 參數：書卷英文縮寫，例如 `Gen`、`Rom`、`Rev`（對應 `BibleConstant.ENGLISH_BOOK_ABBREVIATIONS`）

---

## 端點清單

| 端點 | 功能 | 方法 |
|------|------|------|
| `/json/qsb.php` | 節文查詢（依參照字串） | POST / GET |
| `/json/qp.php` | 原文解析（Strong's Number） | GET |
| `/json/sc.php` | 串珠 / 註釋查詢 | GET |
| `/json/sd.php` | CBOL 原文字典 | GET |
| `/json/sbdag.php` | TWCB 新約希臘文字典 | GET |
| `/json/stwcbhdic.php` | TWCB 舊約希伯來文字典 | GET |
| `/json/uiabv.php` | 聖經版本清單 | GET |
| `/json/se.php` | 關鍵字 / SN 全文搜尋 | GET |
| `/ajax/ob.php` | 典藏查詢 | GET |
| `/ajax/sob.php` | 典藏搜尋 | GET |

---

## 端點詳述

---

### 1. `/json/qsb.php` — 節文查詢

**功能**：依節文參照字串（如 `約3:16`、`羅1:1-3`）取回對應節文。

**來源**：[index/api/qsb.js](../index/api/qsb.js)

#### 請求

優先使用 **POST**，亦支援 GET。

**Header（POST 時）**

```
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
```

**參數**

| 名稱 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `qstr` | string | ✅ | 查詢字串，例如 `約3:16` 或 `羅1:1-3:20` |
| `engs` | string | ✅ | 預設書卷英文縮寫（用於相對參照），例如 `Rom` |
| `version` | string | — | 譯本代號，預設 `unv`（和合本） |
| `strong` | `0\|1` | — | 是否附帶 Strong's Number，預設 `1`；若 version 不是 `unv`/`kjv`/`rcuv` 則強制為 `0` |
| `gb` | `0\|1` | — | 繁/簡體，預設 `0`（繁體） |

**POST Body 範例**

```
qstr=%E7%B4%843%3A16&engs=Joh&version=unv&strong=1&gb=0
```

#### 回應

```jsonc
{
  "status": "success",
  "record_count": 1,
  "proc": 0,           // 0:無特殊字型 1:希臘文 2:希伯來文 3:羅馬拼音 4:OpenHan
  "record": [
    {
      "chineses": "約",          // 書卷中文縮寫
      "engs": "Joh",             // 書卷英文縮寫
      "chap": 3,
      "sec": 16,
      "bible_text": "神愛世人，甚至..."
    }
  ]
}
```

> NUI 內部會在收到結果後，將 `engs` 轉換為 1-based `book` 數字（`qsbRecordToStd()`）。

#### 失敗情境

- HTTP 非 200：`fetch` 丟出錯誤，呼叫端需自行 catch
- API 處理失敗：回傳無 `status` 欄位的物件，或 `status !== "success"`

---

### 2. `/json/qp.php` — 原文解析

**功能**：取回指定節的逐字原文解析，包含 Strong's Number、詞性、原型等。

**來源**：[index/parsing_api_async_es2023.js](../index/parsing_api_async_es2023.js)、[index/FhlLecture.es2023.js:1040](../index/FhlLecture.es2023.js#L1040)

#### 請求（GET）

```
GET /json/qp.php?engs=Rom&chap=1&sec=1&gb=0
```

**參數**

| 名稱 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `engs` | string | ✅ | 書卷英文縮寫 |
| `chap` | number | ✅ | 章 |
| `sec` | number | ✅ | 節 |
| `gb` | `0\|1` | — | 繁/簡體，預設 `0` |

#### 回應

```jsonc
{
  "status": "success",
  "record": [
    {
      "engs": "Rom",
      "chineses": "羅",
      "chap": 1,
      "sec": 1,
      "wid": 123,        // 詞索引
      "sn": "G3972",     // Strong's Number
      "word": "Παῦλος",  // 原文字
      "pro": "N-NSM",    // 詞性
      "wform": "主格單數陽性",
      "orig": "Παῦλος",  // 原型
      "exp": "保羅",      // 原型簡義
      "remark": ""       // 備註
    }
    // ...每個字一筆
  ]
}
```

#### 失敗情境

- 找不到資料：`record.length === 0`，NUI 回傳字串 `"找不到資料 get_parsing_async a"`
- 網路錯誤：catch 後回傳字串 `"找不到資料 get_parsing_async b"`

---

### 3. `/json/sc.php` — 串珠 / 註釋查詢

**功能**：依書 `book` 參數決定回傳串珠（book=4）或聖經注釋（book=3）。

**來源**：[index/tsks/renderTsk.js](../index/tsks/renderTsk.js)、[index/api/sc.js](../index/api/sc.js)

#### 請求（GET）

```
GET /json/sc.php?book=4&engs=Mark&chap=1&sec=1&gb=0
```

**參數**

| 名稱 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `book` | number | ✅ | `4` = 串珠（TSK）、`3` = 聖經注釋 |
| `engs` | string | ✅ | 書卷英文縮寫 |
| `chap` | number | ✅ | 章 |
| `sec` | number | ✅ | 節 |
| `gb` | `0\|1` | — | 繁/簡體 |

#### 回應（`DScResult`）

```jsonc
{
  "status": "success",
  "record_count": 1,
  "record": [
    {
      "com_text": "創1:1 → 太1:1 ...",  // 串珠/注釋原文內容
      "title": "創世紀 1章1節 到 1章1節",
      "book_name": "串珠"
    }
  ],
  "prev": { "book": "Gen", "chap": 1, "sec": 0, "engs": "Gen" },
  "next": { "book": "Gen", "chap": 1, "sec": 2, "engs": "Gen" }
}
```

> NUI 內部會呼叫 `normalize_sc_result()` 將 `prev.engs` / `next.engs` 轉為 1-based `book` 數字，並拉出 `sc_book`、`sc_book_name` 欄位至頂層。

---

### 4. `/json/sd.php` — CBOL 原文字典

**功能**：查詢 CBOL（中文聖經線上資料庫）的原文字彙說明。

**來源**：[index/SnDictOfCbol.es2023.js](../index/SnDictOfCbol.es2023.js)

#### 請求（GET）

```
GET /json/sd.php?N=0&k=3303&gb=0
```

**參數**

| 名稱 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `N` | `0\|1` | ✅ | `1` = 舊約（希伯來文），`0` = 新約（希臘文） |
| `k` | string | ✅ | Strong's Number（數字部分，無 G/H 前綴），例如 `3303` |
| `gb` | `0\|1` | — | 繁/簡體 |

#### 回應（`DataOfDictOfFhl`）

```jsonc
{
  "record": [
    {
      "dic_text":  "μέν [G3303]...",  // 中文字典說明文字
      "edic_text": "men [G3303]..."   // 英文字典說明文字
    }
  ]
}
```

---

### 5. `/json/sbdag.php` — TWCB 新約希臘文字典

**功能**：查詢浸宣出版社新約希臘文字典。

**來源**：[index/SnDictOfTwcb.es2023.js](../index/SnDictOfTwcb.es2023.js)

#### 請求（GET）

```
GET /json/sbdag.php?k=3303&gb=0
```

**參數**

| 名稱 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `k` | string | ✅ | Strong's Number（數字部分） |
| `gb` | `0\|1` | — | 繁/簡體 |

#### 回應

回傳 **JSON 字串**（需手動 `JSON.parse`）：

```jsonc
{
  "record": [
    {
      "dic_text": "μέν G3303 ..."  // 字典說明（浸宣格式標記語言）
    }
  ]
}
```

> 注意：此端點回傳的是文字字串，不是直接解析的 JSON 物件，呼叫端需要 `JSON.parse(reStr)`。

---

### 6. `/json/stwcbhdic.php` — TWCB 舊約希伯來文字典

**功能**：查詢浸宣出版社舊約希伯來文字典。

**來源**：[index/SnDictOfTwcb.es2023.js](../index/SnDictOfTwcb.es2023.js)

#### 請求（GET）

```
GET /json/stwcbhdic.php?k=0128&gb=0
```

**參數**

| 名稱 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `k` | string | ✅ | Strong's Number（數字部分） |
| `gb` | `0\|1` | — | 繁/簡體 |

#### 回應

與 `sbdag.php` 相同格式，回傳 **JSON 字串**，需手動 `JSON.parse`。

---

### 7. `/json/uiabv.php` — 聖經版本清單

**功能**：取得所有可用聖經譯本及其屬性。

**來源**：[static/search_api/abvphp_api.js](../static/search_api/abvphp_api.js)

#### 請求（GET）

```
GET /json/uiabv.php?gb=0
```

**參數**

| 名稱 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `gb` | `0\|1` | ✅ | 回傳繁體（0）或簡體（1）的版本名稱 |

#### 回應

```jsonc
{
  "record": [
    {
      "cname": "和合本",   // 版本中文名稱（key）
      "book": "unv",       // 版本代號（version code）
      "ntonly": "0",       // 是否僅有新約
      "otonly": "0",       // 是否僅有舊約
      "strong": "1"        // 是否含 Strong's Number
    }
    // ...其他版本
  ]
}
```

> NUI 啟動時只呼叫一次，結果快取於 `abvphp.g_bibleversions`（繁體）及 `abvphp.g_bibleversionsGb`（簡體）。

---

### 8. `/json/se.php` — 全文搜尋

**功能**：依關鍵字或 Strong's Number 搜尋聖經節文，每次最多回傳 500 筆。

**來源**：[static/search_api/sephp.pre_search_keyword.js](../static/search_api/sephp.pre_search_keyword.js)、[static/search_api/sephp.pre_search_sn.js](../static/search_api/sephp.pre_search_sn.js)

#### 請求（GET，透過 `fhl.json_api_text`）

**關鍵字搜尋**：

```
GET /json/se.php?orig=0&VERSION=unv&index_only=1&limit=500&offset=0&q=神愛世人&gb=0
```

**SN 搜尋**：

```
GET /json/se.php?index_only=1&limit=500&offset=0&orig=1&sn=G3303&gb=0
```

**參數**

| 名稱 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `q` | string | — | 關鍵字（與 `sn` 擇一） |
| `sn` | string | — | Strong's Number（與 `q` 擇一） |
| `VERSION` | string | — | 譯本代號，例如 `unv` |
| `orig` | `0\|1` | — | `0` = 非原文搜尋，`1` = 原文 SN 搜尋 |
| `index_only` | `0\|1` | — | `1` = 僅回傳位置索引（不帶 `bible_text`） |
| `limit` | number | — | 每次最多筆數，最大 `500` |
| `offset` | number | — | 起始偏移（分頁用） |
| `gb` | `0\|1` | — | 繁/簡體 |

#### 回應

```jsonc
{
  "status": "success",
  "record_count": 74,
  "record": [
    {
      "id": 42312,          // 全域節文編號（1-based 絕對節）
      "engs": "Joh",
      "chineses": "約",
      "chap": 3,
      "sec": 16,
      "bible_text": "神愛世人，甚至..."  // index_only=1 時此欄位不存在
    }
    // ...
  ]
}
```

> 因上限 500 筆，NUI 以遞迴方式（增加 `offset`）持續呼叫直到 `record_count < 500`，最終合併所有結果。

#### 失敗情境

- 回傳文字不含 `"status":"success"` → NUI 丟出 `throw "搜尋回傳錯誤"`

---

### 9. `/ajax/ob.php` — 典藏查詢

**功能**：依書卷、章節查詢聖經典藏圖像記錄。

**來源**：[static/ob_api/obphp.js](../static/ob_api/obphp.js)

#### 請求（GET，透過 `fhl.json_api`）

```
GET /ajax/ob.php?...
```

**參數**：由前端 React Component 動態組成，包含書卷、章節、年代範圍等篩選條件。

#### 回應

JSON 物件，含 `record_count` 及 `record[]` 陣列。

---

### 10. `/ajax/sob.php` — 典藏搜尋

**功能**：依更多條件（風格、年代等）搜尋典藏。

**來源**：[static/ob_api/obphp.js](../static/ob_api/obphp.js)

#### 請求（GET）

```
GET /ajax/sob.php?...
```

---

## 錯誤處理總覽

| 情境 | 表現方式 | NUI 做法 |
|------|---------|---------|
| HTTP 非 200 | `fetch` reject / jQuery ajax `error` 回呼 | `console.error` + Promise `reject` |
| 回傳 JSON 但 `status !== "success"` | 物件沒有 `status` 或值不是 `"success"` | 視端點決定：忽略、顯示空白、或丟出 Error |
| `record_count === 0` | 有 status success 但無資料 | 各元件自行判斷（渲染空白或提示文字） |
| 本地開發 CORS | 所有 `/json/` 請求失敗 | 先嘗試 `http://127.0.0.1:5600` proxy → 逾時後讀本地虛擬 JSON（`sd_virtual_old.json` 等） |

---

## 本地開發虛擬資料

| 檔案 | 對應端點 | 說明 |
|------|---------|------|
| `index/sd_virtual_old.json` | `/json/sd.php?N=1` | CBOL 舊約字典假資料 |
| `index/sd_virtual_new.json` | `/json/sd.php?N=0` | CBOL 新約字典假資料 |
| `index/sd_virtual_old_twcb.json` | `/json/stwcbhdic.php` | TWCB 舊約字典假資料 |
| `index/sd_virtual_new_twcb.json` | `/json/sbdag.php` | TWCB 新約字典假資料 |

---

## 呼叫工具函式

| 函式 | 位置 | 說明 |
|------|------|------|
| `fhl.json_api(url, success, error)` | [static/search_api/fhl_api.js](../static/search_api/fhl_api.js) | 以 `fhl.urlJSON` 為 base，jQuery GET JSON |
| `fhl.xml_api(url, success, error)` | 同上 | 以 `fhl.urlAjax` 為 base，jQuery GET XML |
| `fhl.json_api_text(url, success, error)` | 同上 | 回傳原始文字（用於 JSON 格式不標準的端點） |
| `getAjaxUrl(func, ps, idx)` | [index/getAjaxUrl.es2023.js](../index/getAjaxUrl.es2023.js) | 依 `func`（`sc`/`qp`/`sd` 等）自動組出完整 URL |
| `get_domain()` | [index/api/get_domain.js](../index/api/get_domain.js) | 判斷環境回傳 domain |
