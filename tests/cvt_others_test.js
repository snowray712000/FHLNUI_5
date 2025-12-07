/**
 * @typedef {import('./TpQUnit').TpQUnit} TpQUnit
 * @typedef {import('../index/DText.js').DText} DText
 */

import { cvt_others } from '../index/cvt_others.js';

const QUnit = /** @type {TpQUnit} */ (window.QUnit);

QUnit.module('cvt_others tests');

function makeRecord(book, chap, sec, text) {
  /** @type {[number, number, number, string]} */
  return [book, chap, sec, text];
}

function run(version, records) {
  /** @type {ReturnType<typeof cvt_others>} */
  const out = cvt_others(version, records);
  return out;
}

/**
 * @param {DText[]} dtexts 
 */
function concat_dtexw(dtexts) {
  let s = ''
  for (const dt of dtexts) {
    if (dt.children != null) {
      s += concat_dtexw(dt.children);
    } else {
      s += dt.w ?? '';
    }
  }
  return s;
}
QUnit.test('基本：回傳結構與型態 DTextsWithAddr', assert => {
  const records = [makeRecord(1, 1, 1, '純文字')];
  const out = run('ncv', records);
  assert.equal(Array.isArray(out), true, 'cvt_others 應回傳陣列');
  const one = out[0];
  assert.equal(one[0], 1, 'book 應保留');
  assert.equal(one[1], 1, 'chap 應保留');
  assert.equal(one[2], 1, 'sec 應保留');
  assert.equal(Array.isArray(one[3]), true, '第4欄應為 DText[]');
  assert.ok(one[3].length >= 1, '至少一個 DText');
  assert.equal(typeof one[3][0], 'object', 'DText 應為物件');
});

QUnit.test('換行：\\n 轉為 <br/> 並在 DOMParser 後成為 isBr', assert => {
  const txt = '行1\n行2';
  const out = run('ncv', [makeRecord(1, 1, 2, txt)]);
  const dtexts = out[0][3];
  const hasBr = dtexts.some(d => d.isBr === 1);
  assert.ok(hasBr, '應有 isBr 的 DText');
});

QUnit.test('原文字標：<WH0834> 轉換成可解析標記，最後輸出為 <834>', assert => {
  const txt = '<WH0834>';
  const out = run('ncv', [makeRecord(1, 1, 3, txt)]);
  const dtexts = out[0][3];
  const has834 = dtexts.some(d => d.w === '<834>');
  assert.ok(has834, 'WH0834 應轉成 <834> 文字節點');
});

QUnit.test('DOM：<u> 名字 => isName=1', assert => {
  const txt = '<u>名字</u>';
  const out = run('ncv', [makeRecord(1, 1, 4, txt)]);
  const dtexts = out[0][3];
  const hasName = dtexts.some(d => d.isName === 1 && d.w === '名字');
  assert.ok(hasName, '<u>內容</u> 應標記 isName');
});

QUnit.test('DOM：<span style="color:red">耶穌</span> => cssColor', assert => {
  const txt = '<span style="color:red">耶穌</span>';
  const out = run('ncv', [makeRecord(1, 1, 5, txt)]);
  const dtexts = out[0][3];
  const hasColor = dtexts.some(d => d.cssColor === 'red' && d.w === '耶穌');
  assert.ok(hasColor, 'span 顏色應被保留在 cssColor');
});

QUnit.test('KJV：<FI>bold<Fi> 需成對並解析為 isBold', assert => {
  const txt = '<FI>bold<Fi>';
  const out = run('kjv', [makeRecord(1, 1, 6, txt)]);
  const dtexts = out[0][3];
  const hasBold = dtexts.some(d => d.isBold === 1 && d.w === 'bold');
  assert.ok(hasBold, 'FI/Fi 需成對並作為粗體文字解析');
});

QUnit.test('KJV：<CM> 轉為自閉合並解析為文字 (未知標籤策略)', assert => {
  const txt = 'a<CM>b';
  const out = run('kjv', [makeRecord(1, 1, 7, txt)]);
  const dtexts = out[0][3];
  // replaceKJVToPair 將 <CM> -> <CM/>，DOMParser 會當元素；程式對 CM 標籤標記 isBold
  const hasCM = dtexts.some(d => d.isBold === 1 && d.w === '');
  assert.ok(hasCM, 'CM 應被解析，並以 isBold 表示(內容可能為空)');
});



QUnit.test('cnet_foot：參考語句應被轉為 #...| 格式', assert => {
  const txt = '羅1:1 （詩89:3；撒下7:5, 8）';
  const out = run('cnet_foot', [makeRecord(45, 1, 1, txt)]);

  const dtexts = out[0][3];
  const joined = concat_dtexw(dtexts);
  assert.ok(joined.includes('#羅1:1|'), '包含 #羅1:1|');

  assert.ok(joined.includes('#詩89:3;撒下7:5,8|'), '包含 #詩89:3;撒下7:5,8|');
});

QUnit.test('csb_foot：書名加章節《以賽亞書》7:14 => #以賽亞書7:14|', assert => {
  const txt = '太1:23 《以賽亞書》7:14。';
  const out = run('csb_foot', [makeRecord(40, 1, 23, txt)]);
  const dtexts = out[0][3];
  const joined = dtexts.map(d => d.w ?? '').join('');
  assert.ok(joined.includes('#以賽亞書7:14|'), '包含 #以賽亞書7:14|');
});

QUnit.test('DOM：<br/> 應解析為 isBr', assert => {
  const txt = '上<br/>下';
  const out = run('ncv', [makeRecord(1, 2, 1, txt)]);
  const dtexts = out[0][3];
  const hasBr = dtexts.some(d => d.isBr === 1);
  assert.ok(hasBr, '<br/> 應成為 isBr 節點');
});

QUnit.test('DOM：多層標題 <h2><b>題目</b></h2> => isTitle1 與 isBold', assert => {
  const txt = '<h2><b>題目</b></h2>';
  const out = run('ncv', [makeRecord(1, 3, 1, txt)]);
  const dtexts = out[0][3];
  const hasTitleBold = dtexts.some(d => d.isTitle1 === 1 && d.isBold === 1 && d.w === '題目');
  assert.ok(hasTitleBold, 'h2 內 b 應同時帶出 isTitle1 與 isBold');
});

/**
 以下是補強各種「可能 input 情境」的 cvt_others 單元測試，參考 render_mode 1/2/3 與 parseBibleText 的需求，新增重點包括：
 - 原文 SN 標記含 T、小寫 a、以及花括號 I 的不同組合。
 - bhs 版本不應被誤處理（cvt_others 目前僅針對 kjv/cnet_foot/csb_foot特殊處理）。
 - SUBHEADING、FO 等非一般標籤的 DOM 解析。
 - 與 parseBibleText 的互通性：cvt_others 產出的 DText[].w 不應破壞後續 add_sn_text 的流程（避免殘留單標籤或不成對標籤）。

 - 建議補這些測試，是因為：

 - render_mode 1/2/3 會將 cvt_others 的產出再進一步格式化與套 SN 視覺邏輯；因此確保 cvt_others 的 DOM 拆解與標記是「穩定且無殘留不成對標籤」很重要。
 - parseBibleText 對 KJV 的大小寫修正、SN 標記轉 span.sn、強顯示隱藏等，都需要前置文字不被破壞。
 - bhs 的換行與顯示符號策略在 render 階段執行，cvt_others 不應變更 bhs 的特性，只要維持基本拆解即可。
 */

/* 1) SN 標記解析覆蓋更多情境：T(小括號)、a(字母後綴)、I(花括號) */
QUnit.test('SN：<WH08521a> 解析為 <8521a>', assert => {
  const out = run('ncv', [makeRecord(1, 1, 1, '<WH08521a>')]);
  const dtexts = out[0][3];
  assert.ok(dtexts.some(d => d.w === '<8521a>'), '含 a 後綴應保留於輸出文字');
});

QUnit.test('SN：<WTH08521I> 解析為 {(8521)}', assert => {
  const out = run('ncv', [makeRecord(1, 1, 2, '<WTH08521I>')]);
  const dtexts = out[0][3];
  assert.ok(dtexts.some(d => d.w === '{(8521)}'), '含 I 花括號應外包 {}');
});

QUnit.test('SN：<WTH08521aI> 解析為 {(8521a)}', assert => {
  const out = run('ncv', [makeRecord(1, 1, 3, '<WTH08521aI>')]);
  const dtexts = out[0][3];
  assert.ok(dtexts.some(d => d.w === '{(8521a)}'), 'a 與 I 同時存在時，仍需正確輸出');

  /* 2) T 標記：以小括號呈現而非尖括號 */
});
QUnit.test('SN：<WH08521> 與 <WTH08521T> 差異，T 應輸出為 (8521)', assert => {
  const out = run('ncv', [makeRecord(1, 1, 4, '<WH08521> <WTH08521T>')]);
  const dtexts = out[0][3];
  const joined = dtexts.map(d => d.w ?? '').join('');
  assert.ok(joined.includes('<8521>'), '一般 SN 用尖括號');
  assert.ok(joined.includes('(8521)'), 'T SN 用小括號');
});

/* 3) 換行符：cvt_others 先轉 <br/>，DOM 後產出 isBr，避免 parseBibleText 再度處理衝突 */
QUnit.test('換行：混合 SN 與換行，仍應得到 isBr 節點', assert => {
  const out = run('ncv', [makeRecord(1, 1, 5, '詞1\n<WTH0834>\n詞3')]);
  const dtexts = out[0][3];
  assert.ok(dtexts.some(d => d.isBr === 1), '換行應轉為 isBr');

  /* 4) SUBHEADING/FO 等少見標籤，確認 DOM 解析路徑 */
});
QUnit.test('DOM：<SUBHEADING>標題</SUBHEADING> => isBold=1', assert => {
  const out = run('ncv', [makeRecord(1, 1, 6, '<SUBHEADING>標題</SUBHEADING>')]);
  const dtexts = out[0][3];
  assert.ok(dtexts.some(d => d.isBold === 1 && d.w === '標題'), 'SUBHEADING 應當作粗體解析');
});

QUnit.test('DOM：<FO>小標</FO> => isTitle1=1', assert => {
  const out = run('ncv', [makeRecord(1, 1, 7, '<FO>小標</FO>')]);
  const dtexts = out[0][3];
  assert.ok(dtexts.some(d => d.isTitle1 === 1 && d.w === '小標'), 'FO 應視為標題');

  /* 5) bhs 版本：cvt_others 不應做 kjv/cnet/csb 特殊處理，僅維持基本 DOM 拆解 */
});
QUnit.test('bhs：僅基本拆解，不做 KJV/cnet/csb 的特殊處理', assert => {
  const out = run('bhs', [makeRecord(1, 1, 8, '詞A\n<WH0123> 詞B')]);
  const dtexts = out[0][3];

  assert.ok(dtexts.some(d => d.isBr === 1), 'bhs 換行仍應轉為 isBr');
  assert.ok(dtexts.some(d => d.w === '<123>'), 'SN 應正常轉為 <123>');

  /* 6) KJV：包含 RF/CM/FO 的成對修正與 DOM 後標記 */
});
QUnit.test('KJV：<RF>內文<Rf> 與 <CM> 與 <Fo> 修正為成對並解析', assert => {
  const txt = '<RF>參考<Rf> 中段<CM> 結尾<FO>尾</Fo>';
  const out = run('kjv', [makeRecord(1, 1, 9, txt)]);
  const dtexts = out[0][3];
  const hasRF = dtexts.some(d => d.isBold === 1 && d.w === '參考');
  const hasCM = dtexts.some(d => d.isBold === 1 && d.w === '');
  const hasFO = dtexts.some(d => d.isTitle1 === 1 && d.w === '尾');
  assert.ok(hasRF, 'RF/Rf 成對後應解析為粗體文字');
  assert.ok(hasCM, 'CM 轉為自閉合後仍會產生元素(內容可能空)');
  assert.ok(hasFO, 'Fo/Fo 成對後解析為 isTitle1');

  /* 7) 樣式色彩：span 顏色支援，供後續 parseBibleText 的視覺處理 */
});
QUnit.test('DOM：<span style="color:#00AAFF">文字</span> => cssColor', assert => {
  const out = run('ncv', [makeRecord(1, 1, 10, '<span style="color:#00AAFF">文字</span>')]);
  console.log(out);
  
  const dtexts = out[0][3];
  // 過程會將 #00AAFF 轉為 rgb(0, 170, 255)
  assert.ok(dtexts.some(d => d.cssColor === 'rgb(0, 170, 255)' && d.w === '文字'), '應保留 cssColor');

  /* 8) 安全性：未識別標籤保留 outerHTML，避免破壞 parseBibleText 的後續 add_sn_text 流程 */
});
QUnit.test('DOM：未知標籤保留 outerHTML，不應造成單閉合或不成對', assert => {
  const out = run('ncv', [makeRecord(1, 1, 11, '<xyz>內容</xyz>')]);
  const dtexts = out[0][3];
  assert.ok(dtexts.some(d => typeof d.w === 'string' && d.w.includes('<xyz>')), '未知標籤保留 outerHTML');

  /* 9) 參照正規化：addReference 基本不崩潰且能維持 DText[] 結構 (不檢查具體轉換內容，僅確認穩定性) */
});
QUnit.test('參照：含中文書名與節位文字，不崩潰且維持 DText[] 結構', assert => {
  const out = run('ncv', [makeRecord(40, 1, 1, '見 太 1:1-3；路 2:4')]);
  const dtexts = out[0][3];
  assert.ok(Array.isArray(dtexts), 'addReference 結束仍為 DText[]');
  assert.ok(dtexts.length >= 1, '維持至少一個 DText 節點');
});