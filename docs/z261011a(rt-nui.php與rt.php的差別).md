# rt-nui.php 與 rt.php 的差別

`docs/rt-nui.php` 是給後端放到 `/json/` 的新檔，由原本的 `rt.php` 改來：**帶 `id` 的行為不變，沒帶 `id` 時改成回整章（或整本）**。規格與動機見 [z261010b(rt注腳-整章查詢-後端API規畫).md](z261010b(rt注腳-整章查詢-後端API規畫).md)。

> 沒有 PHP 環境，rt-nui.php 只對照 rt.php 全文逐行檢查過，還沒實際執行。上線後請照最後的「驗證」跑一次。

## 一句話

| | rt.php | rt-nui.php |
|---|---|---|
| 帶 `id` | 回該筆 | **同左，輸出逐字相同** |
| 沒帶 `id` | `success`、0 筆、沒有 `record` | 整章 / 整本，多 `scope`、`record` 永遠是陣列 |
| version / engs | 只把 `'` 換成 `''` | 白名單格式，不符回 `fail` |
| 失敗 | `"status":"Fail:<SQL>"`（把 SQL 給使用者） | `"status":"fail"` |

## 新增功能：整章 / 整本

`rt-nui.php?engs=Hab&chap=2&version=lcc&gb=0`（省略 `id`）

```json
{
"status":"success",
"record_count":3,
"version":"lcc",
"engs":"Hab"
,"scope":"chapter"
,"chap":2
,"record":[{"id":1,"text":"…"},
{"id":2,"text":"…"},
{"id":3,"text":"…"}]
}
```

- **lcc / csb**：這兩個版本的注腳 id **每章重編**，所以用 `chap` 篩（`scope:"chapter"`，並附 `chap`）。
- **其他版本（cnet、tcv…）**：id 在**整本書內連號**，`chap` 本來就沒作用，所以回整本（`scope:"book"`，不附 `chap`）。實測 cnet 雅各書 `id=46` 搭配 `chap=1` 或 `chap=5` 都回同一筆。
- `scope` 是給前端偵測用：新前端對舊後端送整章查詢，會得到「success、0 筆、沒有 scope」，和新後端「這章真的沒注腳」（`scope` 存在、`record: []`）長得不同。
- 整章查詢 lcc / csb 沒帶 `chap`（或 ≤ 0）→ `fail`，避免回「空的整章」被誤判成沒注腳。
- `ORDER BY id`，所以順序固定。
- `gb=1` 的處理與 rt.php 相同：csb 用 `regbcsb` 表，其餘每筆過 `trangb()`。

## 順手修的

1. **白名單**：`version` 只許 `[A-Za-z0-9]{1,16}`（它會串進表名 `'re'.$version`）；`engs` 許 `[A-Za-z0-9 ]{1,12}`（書名有空白：`1 Sam`、`1 John`，雅各書是 `James` 不是 `Jas`）。原本只擋單引號。
2. **不回 SQL**：查詢失敗不再 `"status":"Fail:..."` 把整句 SQL 吐出去。
3. **`${ARAW[0]}` → `{$ARAW[0]}`**：PHP 8.2 起 `${}` 字串插值 deprecated，若 display_errors 開著 notice 會混進 JSON。輸出內容不變。
4. **壞 UTF-8**：`json_encode` 失敗會回 false（印成空字串，整個 JSON 壞掉）。改成 `enc_text()`，該筆回 `""`。單筆時也用它，正常資料輸出不變。

## 完全沒動的

`ncv` 不公開的 Referer 判斷、`require` 那幾行、`version` 空白預設 `tcv`、`csb`+`gb=1` 用 `regbcsb`、`trangb()`、輸出的手拼 JSON 格式與換行、`id=1,2` → `(int)` 取 1、`id=0` 回 0 筆。

## 已知、刻意保留的小地方

- `stripos($_SERVER['HTTP_REFERER'], …)`：沒帶 Referer 時 PHP 8.1+ 會有 notice／deprecated。原本就有，沒動。
- `id` 空白（`id=`）原本等於 `id=0` → 0 筆；現在視為沒帶 → 整章。前端沒人依賴舊行為。
- 整本（非 lcc / csb）沒有分頁；注腳量不大，預期可一次載入。

## 完整 diff（rt.php → rt-nui.php）

```diff
@@ -1,4 +1,19 @@
 <?php
+/**
+ * rt-nui.php — rt.php + 「沒帶 id 就回整章」 (給 FHL NUI 前端用)
+ * 規格：docs/z261010b(rt注腳-整章查詢-後端API規畫).md
+ *
+ *   rt-nui.php?engs=Hab&chap=2&version=lcc&gb=0        整章 (lcc / csb)；其他版本回整本
+ *   rt-nui.php?engs=Hab&chap=2&version=lcc&gb=0&id=1   單筆，輸出與原 rt.php 相同
+ *
+ * 與原 rt.php 的差別：
+ *   1. 沒帶 id (或 id 空白) → 整章/整本，多一個 "scope" 欄位 ("chapter" / "book")
+ *   2. version / engs 只允許英數 (原本只取代單引號，version 會串進表名)
+ *   3. 失敗時不把 SQL 回給使用者
+ *   4. `${ARAW[0]}` 改 `{$ARAW[0]}` (PHP 8.2 起 deprecated，notice 會混進 JSON；輸出不變)
+ *   5. json_encode 失敗 (壞 UTF-8) 時該筆回空字串，不讓整個回應壞掉
+ * 其餘 (ncv 不公開判斷、csb 簡體用 regbcsb、trangb) 與原 rt.php 相同。
+ */
 if (($_REQUEST['version']!='ncv' /* && $_REQUEST['version']!='tcv95'*/) || stripos($_SERVER['HTTP_REFERER'],'fhl.net')>0)//新譯本不公開
     require('enable_ajax.php');
 require('../new/config.php');
@@ -7,26 +22,58 @@
 require('../new/hmfont.php'); //要處理羅馬拼音
 
 
-$version=str_replace("'","''",trim($_REQUEST['version']));
+$version=trim($_REQUEST['version']);
 if (strlen($version)==0) $version='tcv';
+$hasId = isset($_REQUEST['id']) && trim($_REQUEST['id']) !== '';
 $k=(int) $_REQUEST['id'];
 $chap=(int)$_REQUEST['chap'];
-$engs=str_replace("'","''",$_REQUEST['engs']);
+$engs=trim($_REQUEST['engs']);
 $GBCODE=(int) $_REQUEST['gb'];
 
+// 白名單：之後會串進 SQL (表名、engs)。version 只許英數；engs 允許空白 ('1 Sam'、'1 John')
+if (!preg_match('/^[A-Za-z0-9]{1,16}$/', $version) || !preg_match('/^[A-Za-z0-9 ]{1,12}$/', $engs)) {
+    echo '{"status":"fail"}';
+    exit;
+}
+
  if ($version=='csb' && $GBCODE==1)
  	$tbname='regbcsb';
  else $tbname='re'.$version;
- if ($version=='lcc'||$version=='csb')
+
+$isChap = ($version=='lcc'||$version=='csb'); // 只有這兩個版本的 id 每章重編，要用 chap 篩
+
+// 整章查詢一定要有 chap，否則會回「空的整章」(scope=chapter、0 筆)，前端會誤以為這章沒注腳
+if (!$hasId && $isChap && $chap<=0) {
+    echo '{"status":"fail"}';
+    exit;
+}
+
+// json_encode 遇到壞掉的 UTF-8 會回 false (輸出空字串 → 整個 JSON 壞掉)。
+// 整章查詢時一筆壞資料不該拖垮整章，改成空字串。
+function enc_text($s) {
+    $j = json_encode(trangb($s));
+    return $j === false ? '""' : $j;
+}
+
+if ($hasId) {
+    // ---- 單筆：與原 rt.php 相同 ----
+    if ($isChap)
         $SQL="select id,txt from $tbname where id=$k and engs='$engs' and chap=$chap ";
- else
+    else
         $SQL="select id,txt from $tbname where id=$k and engs='$engs'";
+} else {
+    // ---- 整章 (lcc/csb) 或整本 (其他版本) ----
+    if ($isChap)
+        $SQL="select id,txt from $tbname where engs='$engs' and chap=$chap order by id";
+    else
+        $SQL="select id,txt from $tbname where engs='$engs' order by id";
+}
 $db_conn=db_connect("dbname=$DBNAME");
 
         $result=db_exec($db_conn,$SQL);
    echo '{'."\n";
         if (!$result){
-                        echo '"status":"Fail:'.$SQL.'"';
+                        echo '"status":"fail"';
                         die('}');
         }
         echo '"status":"success",'."\n";
@@ -34,10 +81,23 @@
 	echo '"record_count":'.$numrow.','."\n";
     	echo '"version":"'.$version.'",'."\n";
     	echo '"engs":"'.$engs.'"'."\n";
-	if ($numrow>0){
-    		$ARAW=@db_fetch_row($result,0);
+	if ($hasId) {
+		if ($numrow>0){
+    			$ARAW=@db_fetch_row($result,0);
+			echo ',"record":[';
+			echo( "{\"id\":{$ARAW[0]},\n\"text\":".enc_text($ARAW[1])."}]\n");
+		}
+	} else {
+		// scope 讓前端分辨「新後端這章沒注腳」與「舊後端不認得整章查詢」
+		echo ',"scope":"'.($isChap ? 'chapter' : 'book').'"'."\n";
+		if ($isChap) echo ',"chap":'.$chap."\n";
 		echo ',"record":[';
-		echo( "{\"id\":${ARAW[0]},\n\"text\":".json_encode(trangb($ARAW[1]))."}]\n");
+		for ($i=0; $i<$numrow; $i++) {
+			$ARAW=@db_fetch_row($result,$i);
+			if ($i>0) echo ",\n";
+			echo( "{\"id\":{$ARAW[0]},\n\"text\":".enc_text($ARAW[1])."}");
+		}
+		echo "]\n"; // 沒注腳時是 []
 	}
 	echo '}';
 ?>
```

## 驗證（上線後）

```bash
# 1. 整章：要有 "scope":"chapter" 與 record 陣列
curl 'https://<host>/json/rt-nui.php?engs=Hab&chap=2&version=lcc&gb=0'
# 2. 整本：cnet 要 "scope":"book"，id 為整本連號
curl 'https://<host>/json/rt-nui.php?engs=James&chap=5&version=cnet&gb=0'
# 3. 帶 id：與舊 rt.php 逐字相同
diff <(curl -s '…/rt.php?engs=Hab&chap=2&version=lcc&id=1&gb=0') \
     <(curl -s '…/rt-nui.php?engs=Hab&chap=2&version=lcc&id=1&gb=0')
# 4. 帶空白的書名、簡體
curl 'https://<host>/json/rt-nui.php?engs=1%20Sam&chap=1&version=csb&gb=1'
# 5. 沒注腳的章：record_count 0、record []、scope 存在
```
