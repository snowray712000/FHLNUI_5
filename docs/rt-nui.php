<?php
/**
 * rt-nui.php — rt.php + 「沒帶 id 就回整章」 (給 FHL NUI 前端用)
 * 規格：docs/z261010b(rt注腳-整章查詢-後端API規畫).md
 *
 *   rt-nui.php?engs=Hab&chap=2&version=lcc&gb=0        整章 (lcc / csb)；其他版本回整本
 *   rt-nui.php?engs=Hab&chap=2&version=lcc&gb=0&id=1   單筆，輸出與原 rt.php 相同
 *
 * 與原 rt.php 的差別：
 *   1. 沒帶 id (或 id 空白) → 整章/整本，多一個 "scope" 欄位 ("chapter" / "book")
 *   2. version / engs 只允許英數 (原本只取代單引號，version 會串進表名)
 *   3. 失敗時不把 SQL 回給使用者
 *   4. `${ARAW[0]}` 改 `{$ARAW[0]}` (PHP 8.2 起 deprecated，notice 會混進 JSON；輸出不變)
 *   5. json_encode 失敗 (壞 UTF-8) 時該筆回空字串，不讓整個回應壞掉
 * 其餘 (ncv 不公開判斷、csb 簡體用 regbcsb、trangb) 與原 rt.php 相同。
 */
if (($_REQUEST['version']!='ncv' /* && $_REQUEST['version']!='tcv95'*/) || stripos($_SERVER['HTTP_REFERER'],'fhl.net')>0)//新譯本不公開
    require('enable_ajax.php');
require('../new/config.php');
require('dbconfig.php');
require('lang.php');
require('../new/hmfont.php'); //要處理羅馬拼音


$version=trim($_REQUEST['version']);
if (strlen($version)==0) $version='tcv';
$hasId = isset($_REQUEST['id']) && trim($_REQUEST['id']) !== '';
$k=(int) $_REQUEST['id'];
$chap=(int)$_REQUEST['chap'];
$engs=trim($_REQUEST['engs']);
$GBCODE=(int) $_REQUEST['gb'];

// 白名單：之後會串進 SQL (表名、engs)。version 只許英數；engs 允許空白 ('1 Sam'、'1 John')
if (!preg_match('/^[A-Za-z0-9]{1,16}$/', $version) || !preg_match('/^[A-Za-z0-9 ]{1,12}$/', $engs)) {
    echo '{"status":"fail"}';
    exit;
}

 if ($version=='csb' && $GBCODE==1)
 	$tbname='regbcsb';
 else $tbname='re'.$version;

$isChap = ($version=='lcc'||$version=='csb'); // 只有這兩個版本的 id 每章重編，要用 chap 篩

// 整章查詢一定要有 chap，否則會回「空的整章」(scope=chapter、0 筆)，前端會誤以為這章沒注腳
if (!$hasId && $isChap && $chap<=0) {
    echo '{"status":"fail"}';
    exit;
}

// json_encode 遇到壞掉的 UTF-8 會回 false (輸出空字串 → 整個 JSON 壞掉)。
// 整章查詢時一筆壞資料不該拖垮整章，改成空字串。
function enc_text($s) {
    $j = json_encode(trangb($s));
    return $j === false ? '""' : $j;
}

if ($hasId) {
    // ---- 單筆：與原 rt.php 相同 ----
    if ($isChap)
        $SQL="select id,txt from $tbname where id=$k and engs='$engs' and chap=$chap ";
    else
        $SQL="select id,txt from $tbname where id=$k and engs='$engs'";
} else {
    // ---- 整章 (lcc/csb) 或整本 (其他版本) ----
    if ($isChap)
        $SQL="select id,txt from $tbname where engs='$engs' and chap=$chap order by id";
    else
        $SQL="select id,txt from $tbname where engs='$engs' order by id";
}
$db_conn=db_connect("dbname=$DBNAME");

        $result=db_exec($db_conn,$SQL);
   echo '{'."\n";
        if (!$result){
                        echo '"status":"fail"';
                        die('}');
        }
        echo '"status":"success",'."\n";
        $numrow=db_NumRows($result);
	echo '"record_count":'.$numrow.','."\n";
    	echo '"version":"'.$version.'",'."\n";
    	echo '"engs":"'.$engs.'"'."\n";
	if ($hasId) {
		if ($numrow>0){
    			$ARAW=@db_fetch_row($result,0);
			echo ',"record":[';
			echo( "{\"id\":{$ARAW[0]},\n\"text\":".enc_text($ARAW[1])."}]\n");
		}
	} else {
		// scope 讓前端分辨「新後端這章沒注腳」與「舊後端不認得整章查詢」
		echo ',"scope":"'.($isChap ? 'chapter' : 'book').'"'."\n";
		if ($isChap) echo ',"chap":'.$chap."\n";
		echo ',"record":[';
		for ($i=0; $i<$numrow; $i++) {
			$ARAW=@db_fetch_row($result,$i);
			if ($i>0) echo ",\n";
			echo( "{\"id\":{$ARAW[0]},\n\"text\":".enc_text($ARAW[1])."}");
		}
		echo "]\n"; // 沒注腳時是 []
	}
	echo '}';
?>
