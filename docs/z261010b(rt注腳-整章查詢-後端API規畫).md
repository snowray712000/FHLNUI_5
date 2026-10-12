# rt.php 注腳：整章一次查

> **2026-10-12 狀態**：後端 `rt-nui.php` 已放在 bkbible.fhl.net（與 rt.php 的差別見 [z261011a](z261011a(rt-nui.php與rt.php的差別).md)），前端已改：`rtAsync` 端點改 `/json/rt-nui.php`，不帶 `id` = 整章；`queryFootsAsync` 依 (版本、書、章) 分組一次查整章並快取，回應沒有 `scope` 才退回逐 id。下面是當初的規畫。
> 實測：非 lcc / csb（如 cnet）注腳 id 整本連號、`chap` 沒作用，回整本 (`scope: "book"`)；雅各書 engs 是 `James`；書名有空白 (`1 Sam`) 要 encode。
> 待辦：bible.fhl.net 同步後確認正式站；本機開發 (`127.0.0.1:15600`) 後端若沒有 rt-nui.php 會走不通。

## 問題 (2026-10-10 實測)

- 呂振中譯本 (lcc)、同時看 unv：注腳「直接載入」時，每個 `【n】` 一個 `rt.php?engs&chap&version&id&gb` 請求。哈2 一章十幾個，鴻、結、彌等更多。
- 正式站 (`bkbible.fhl.net`) 對**同時**的請求有上限，約 6 個：同時 2 / 4 / 6 個全 200，8 個起開始 503 (12 個 4 個 503，40 個 29 個 503)。503 回 html，前端 `response.json()` 丟 SyntaxError，`Promise.all` 整批失敗 → 經文區停在上一章。
- 不是「重複請求」造成的：8 個請求裡只有 3 種不同 id 也 503，是看**同時數量**。去重只是少送。
- 本機開發走 `127.0.0.1:15600`，沒有這個限制，所以開發時看不到。
- 現況 (7.5.10.2 候選，前端已改)：同時最多 4 個、失敗重試 3 次、同注腳只查一次、失敗只讓那個 `【n】` 留著。只是治標：請求數還是 = 注腳數。

## 目標

一章一個請求，後端一次 SQL (`WHERE version, book, chap`)，前端一次填完整章。對後端少連線、少 PHP 啟動；對前端少往返、不必限流重試。

## 相容原則

舊前端永遠帶 `id`；新前端要能對舊後端也運作。所以：**加參數，不改舊行為**。

現行 `rt.php` 的行為 (實測)：

| 呼叫 | 回應 |
|---|---|
| `id=1` | `record` 一筆 `{id, text}` |
| 沒有 `id` / `id=` / `id=0` | `success`，`record_count: 0`，**沒有 `record` 欄位** |
| `id=1,2` | 只當 `1` (intval)，回一筆 |
| 查不到的 id | 同上：`success`、`record_count: 0`、沒有 `record` |

→ 「沒帶 id」現在回空，沒有任何前端依賴它，可以安全地改成「整章」。

## 新規格

`rt.php?engs=Hab&chap=2&version=lcc&gb=0` (省略 `id`)：回該章所有注腳。

```json
{
  "status": "success",
  "record_count": 3,
  "version": "lcc",
  "engs": "Hab",
  "chap": 2,
  "scope": "chapter",
  "record": [
    { "id": 1, "text": "-①根據死海古卷修復的" },
    { "id": 2, "text": "…" },
    { "id": 3, "text": "…" }
  ]
}
```

- `record` 欄位與單筆時**同形** (`[{id, text}]`)，只是多筆；`record_count` = 筆數。
- 該章沒有注腳：`record_count: 0`，**建議永遠給 `record: []`** (現在省略，前端用 `?.` 才不會炸)。
- 新增 `scope: "chapter"` 只在整章查詢時出現。**這是偵測用的**：新前端對舊後端送出整章查詢會得到「成功但 0 筆、沒有 scope」，和「新後端、這章真的沒注腳」長得一樣，靠 `scope` 區分。
- 帶 `id` 時回應完全不變 (不加 `scope`)，舊前端不受影響。
- 順手 (選配)：`id=1,2,5` 多個 id。整章已夠用，可不做。
- 查不到的 id 建議維持 `success` + 0 筆 (前端已處理)。

## 前端 (`queryFootsAsync.js`，後端做好之後)

1. 收集待查注腳，依 `(version, book, chap)` 分組。
2. 每組一個 `rtAsync({ book, chap, ver })` (不帶 `id`) → 得到 `Map<id, text>`，同組注腳直接填。
3. 若回應 `scope != 'chapter'` (舊後端)：整組退回現在的逐 id 查詢 (限流 4、重試 3、去重，現有程式)。
4. 整章結果可快取 (key = `version|book|chap`)，來回切章不必再查。多章範圍 (交互參照、搜尋結果) 同時最多也只有「章數」個請求，仍走限流。
5. `rtAsync` 的 `id` 預設值 `1` 要拿掉 (現在 `args.id ?? 1`，不帶就變成 `id=1`)。

## 部署順序

1. 後端先上 (舊前端無感)。
2. 前端再上 (偵測 `scope`，沒有就退回逐 id)。
3. 驗證：`curl '…/rt.php?engs=Hab&chap=2&version=lcc&gb=0'` 要有 `"scope":"chapter"` 與 `record` 陣列；`…&id=1` 要與以前逐字相同。

## 依 rt.php 原始碼的修正 (2026-10-10 拿到程式碼之後)

原始碼 (節錄) 確認了上面的推測，並多出幾點：

- `$k = (int)$_REQUEST['id']`：沒帶 → 0，`id=1,2` → 1，與實測一致。
- **只有 `lcc` / `csb` 用 `chap` 篩** (`where id=$k and engs='$engs' and chap=$chap`)，其他版本 (cnet、tcv…) 只有 `where id=$k and engs='$engs'`：那些版本的 id **在整本書內唯一**，章不是 key。所以「整章」只對 lcc / csb 有意義；其他版本若表裡有 `chap` 欄位可同樣處理，沒有就回整本書 (`scope: "book"`)。
- 只取 `db_fetch_row($result, 0)` 第一筆，輸出是手拼的 JSON。
- 503 不是這支程式回的 (它沒有 503)，是前面 nginx / php-fpm 的連線數限制；所以前端限流是必要的，整章查詢才是治本。

建議的改法 (帶 `id` 的路徑一個字都不動，舊前端不受影響)：

```php
$hasId = isset($_REQUEST['id']) && trim($_REQUEST['id']) !== '';
if ($hasId) {
    // ── 原本的單筆查詢與輸出，維持不變 ──
} else {
    // 整章 (lcc / csb)；其他版本 chap 欄位若不存在就整本
    $isChap = ($version == 'lcc' || $version == 'csb');
    $SQL = $isChap
        ? "select id,txt from $tbname where engs='$engs' and chap=$chap order by id"
        : "select id,txt from $tbname where engs='$engs' order by id";
    $result = db_exec($db_conn, $SQL);
    if (!$result) { echo '{"status":"fail"}'; exit; }          // 不要把 $SQL 回給使用者
    $recs = [];
    for ($i = 0, $n = db_NumRows($result); $i < $n; $i++) {
        $r = db_fetch_row($result, $i);
        $recs[] = ['id' => (int)$r[0], 'text' => trangb($r[1])];
    }
    echo '{"status":"success","record_count":' . count($recs)
       . ',"version":' . json_encode($version) . ',"engs":' . json_encode($engs)
       . ',"scope":"' . ($isChap ? 'chapter","chap":' . $chap : 'book"')
       . ',"record":' . json_encode($recs) . '}';
}
```

- 前端：`scope == 'chapter'` 以 `version|book|chap` 為 key 快取；`scope == 'book'` 以 `version|book`；沒有 `scope` (舊後端) 退回逐 id。
- **順便注意 (資安)**：`$version` 只擋了單引號就串進表名 (`'re'.$version`)，`version=` 可以塞任意字串當表名一部分；建議改成白名單 (`lcc csb cnet tcv …`) 或 `preg_match('/^[a-z0-9]+$/')`。`engs` 也只替換單引號，建議用參數化查詢。錯誤時 `"status":"Fail:'.$SQL.'"` 把 SQL 回給使用者，也建議拿掉。

## 待確認 (需要後端的人)

- 後端能否改 rt.php？(檔案不在本 repo。)
- 其他版本 (cnet 等) 的 `re$version` 表有沒有 `chap` 欄位？有就都能整章，沒有就回整本。
- 簡體 `gb=1` 整章轉換成本 (逐筆轉簡)。
- 一章注腳量上限 (詩篇、結)：應該不大 (數十筆)，不需分頁。
