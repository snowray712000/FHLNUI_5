import { ai_get_bcvw } from "./ai_get_bcvw.js";

const RTL_RX = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/; // 希伯來/阿拉伯等
function is_hebrew(s) {
  return RTL_RX.test(s);
}
const LRM = "\u200E"; // Left-to-Right Mark 
const RLM = "\u200F"; // Right-to-Left Mark 

// * U+2066 LRI
// * U+2067 RLI
// * U+2068 FSI（根據內容自選方向）
// * U+2069 PDI（Pop Directional Isolate）

const RLI = "\u2067";
const PDI = "\u2069";

function isHebrew_jaWord(jaWord) {
  // ### 任一個是 hebrew 就是
  for (let i = 0; i < jaWord.length; i++) {
    const item = jaWord[i];
    if (item.w == '+' || item.w == 'w') continue;
    if (is_hebrew(item.w)) return true;
  }
  return false;
}

/**
 * @param {any} jaWord 
 * @param {number[]} address [book,chap,sec]
 * @param {0|1|2|3} tpAddress 3 need b, 2 need c, 1 need v, 0 need w
 * @returns 
 */
export function gen_prompt_word_include_wid(jaWord, address = [], tpAddress = 0) {
  // ### 產生 Parsing 上面那段 原文
  // - 先判定此是新約，還是舊約。
  const isHebrew = isHebrew_jaWord(jaWord);
  // - 下面 replace 過程要用的。
  // - 多一個空白，才能讓 wid 更好被判定為數字
  const new_line_symbolic = isHebrew ? ' ↪ ' : ' ↩ '

  let text = ''
  if (isHebrew) {
    text += RLI
  }
  for (let i1 = 0; i1 < jaWord.length; i1++) {
    const item = jaWord[i1];
    // - + 符號不顯示
    // - 先以聯式為主，以後再開啟切換
    if (item.w == '+') {
      continue
    }
    if (item.wu == 'w') {
      continue
    }

    // - 原文物件與非原文物件不用再加空白，因為符號的字串中，原本的空白都還存在
    if (item.wid) {
      const bcvwid = ai_get_bcvw(address, item.wid, tpAddress)
      text += `${bcvwid} \`${item.w}\``
    } else {
      // - 連字號，希伯來文會有的。前後要再加空白，使 ai 更易斷開單詞
      if (isHebrew && item.w.includes('־')) {
        item.w = item.w.replaceAll('־', ` ־ `)
      }
      // - 換行符號。
      text += item.w.replaceAll(/\r?\n\r?/g, new_line_symbolic)
    }
  }
  // - `1` 原文 模式，不需這個；但現在是 1 `原文` 模式，必需要這個，不然字尾的 ` 會跑錯位置
  if (isHebrew) {
    text += PDI
  }
  return text
}