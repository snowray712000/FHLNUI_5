/**

### 前言
 
在聖經或譯本文字處理中，括號內的說明、補註或內嵌補充（包含中文全形「（）」或英文半形 "()"、甚至巢狀括號）需要被分出來以利後續的格式化、顏色/樣式處理、比對或比對版本差異。

### 特例

- RGB(...) 這類表示顏色的函式會被誤判為一般括號式標註，因此程式特地修正以避免把 rgb() 當成要拆分的「註解」括號。

### 特例
unv用, ncv 新譯本也用, 全型小括號

**/

import { splitStringByRegex } from './splitStringByRegex.es2023.js'

/**
 * @typedef {import('./cvt_others').DTextsWithAddr} DTextsWithAddr
 * @typedef {import('./DText').DText} DText
 */

/**
 * @param {DTextsWithAddr} dtexts_with_addr 
 */
export function add_parenttheses_unv_ncv(dtexts_with_addr) {
  // dtexts_with_addr 的格式是 [book, chapter, verse, children]
  // 我們要處理的是 children (dtexts_with_addr[3])
  const children = dtexts_with_addr[3];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.sn != null){
      continue; // 不處理 原文標註。因為 (5421) 會被誤判, 不過詩篇51 會有問題
    }

    const newChildren = processParentheses(child.w);

    if (newChildren.length > 1) {
      // 有分解出括號，需要替換
      children.splice(i, 1, ...newChildren.map(item => {
        return { ...child, ...item };
      }))

      i += newChildren.length - 1; // 調整索引
    }
  }

  // 移除占位用的空字串
  remove_w(children);
}

function remove_w(dtexts) {
  for (const dt of dtexts) {
    if (dt.w == '' && (dt.isParenthesesFW || dt.isParenthesesFW2 || dt.isParenthesesHW)) {
      delete dt.w; // 占位用的空字串不需要帶過去  
    }

    // 目前最多兩層，要再檢查一層
    if (dt.children) {
      remove_w(dt.children);
    }
  }
}


/**
 * 處理括號分解
 * @param {string} text 
 * @returns {DText[]} 處理後的結果
 */
function processParentheses(text) {
  // 使用複合正規表達式抓三種情況：兩層全型、單層全型、半型小括號
  const splitResult = splitStringByRegex(text, /(?:(（[^（]*)(（[^）]*）)([^）]*）))|(?:（([^）]+)）)|(?:\(([^\)]+)\))/g);

  if (splitResult == null || splitResult.length === 1) {
    return [{ w: text }];
  }


  fixColorStyleRGB(splitResult); // 修正 RGB 顏色函式被誤判的問題

  const result = [];

  for (const item of splitResult) {
    const parenthesesType = getTypeOfParentheses(item.exec);

    switch (parenthesesType) {
      case ParenthesesType.none:
        result.push({ w: item.w });
        break;

      case ParenthesesType.Two:
        // 兩層括號處理
        const result2 = createNestedParentheses(item);

        result.push(result2);
        break;

      case ParenthesesType.Full:
        // 全型括號
        const fullContent = item.exec[4];

        result.push({
          isParenthesesFW: 1,
          w: '',// 占位用，外面 copy 屬性時才不會被加上 .w
          children: [
            { w: "（", isParenthesesFW: 1 },
            { w: fullContent },
            { w: "）", isParenthesesFW: 1 }
          ]
        });

        break;

      case ParenthesesType.Half:
        // 半型括號
        const halfContent = item.exec[5];
        result.push({
          isParenthesesHW: 1,
          w: '',// 占位用，外面 copy 屬性時才不會被加上 .w
          children: [
            { w: "(", isParenthesesHW: 1 },
            { w: halfContent },
            { w: ")", isParenthesesHW: 1 }
          ]
        });
        break;
    }
  }

  return result;
}

/**
 *
 * @param {{w?:string;exec?:RegExpExecArray}} item
 * @returns {DText}
 */
function createNestedParentheses(item) {

  // console.log(item.exec[1]); // （後裔，子孫：
  // console.log(item.exec[2]); // （原文是兒子；下同）
  // console.log(item.exec[3]); // ）或 xxxx）

  const str1 = item.exec[1].substring(1); // 去掉最前面的 （
  const str2 = item.exec[2].substring(1, item.exec[2].length - 1); // 去掉最前面的 （ 和最後面的 ）
  const str3 = item.exec[3].substring(0, item.exec[3].length - 1); // 去掉最後面的 ）

  // 組合內層
  const inner2 = /** @type {DText[]} */[];
  inner2.push({ w: "（", isParenthesesFW2: 1 });
  if (str2.length > 0) {
    inner2.push({ w: str2 });
  }
  inner2.push({ w: "）", isParenthesesFW2: 1 });

  // 組合最外層
  const inner1 = /** @type {DText[]} */[];
  inner1.push({ w: "（", isParenthesesFW: 1 });
  if (str1.length > 0) {
    inner1.push({ w: str1 });
  }
  inner1.push({ isParenthesesFW2: 1, w: '', children: inner2 });
  if (str3.length > 0) {
    inner1.push({ w: str3 });
  }
  inner1.push({ w: "）", isParenthesesFW: 1 });

  const result2 = {
    isParenthesesFW: 1,
    w: '', // 占位用，外面 copy 屬性時才不會被加上 .w
    children: inner1
  };
  return result2;
}

/**
 * 判斷括號類型
 * @param {RegExpExecArray|undefined} exec 
 * @returns {number}
 */
function getTypeOfParentheses(exec) {
  if (exec === undefined) return ParenthesesType.none;
  if (exec[1] !== undefined) return ParenthesesType.Two;
  if (exec[4] !== undefined) return ParenthesesType.Full;
  return ParenthesesType.Half;
}
/**
 * 修正 RGB 顏色函式被誤判的問題
 * @param {Array} splitResult 
 */
function fixColorStyleRGB(splitResult) {
  // 處理像 <span style="color:rgb(195,39,43);"> 被切成三段的情況
  for (let i = splitResult.length - 1; i >= 0; i--) {
    if (isRgb(i)) {
      mergeI(i);
      // 移掉原本分割出來的後兩段
      splitResult.splice(i + 1, 2);
    }
  }

  function isRgb(i) {
    if (i + 2 >= splitResult.length) return false;
    if (!splitResult[i].w || !splitResult[i + 1].w || !splitResult[i + 2].w) return false;
    const r1a = /color:rgb$/.test(splitResult[i].w);
    const r2a = /^\(\d+,\d+,\d+\)$/.test(splitResult[i + 1].w);
    const r3a = /^;">/.test(splitResult[i + 2].w);
    return r1a && r2a && r3a;
  }

  function mergeI(i) {
    splitResult[i].w += splitResult[i + 1].w + splitResult[i + 2].w;
    splitResult[i].exec = undefined;
  }
}
/***/
const ParenthesesType = Object.freeze({
  none: 0,
  Half: 1, // 半型小括號
  Full: 2, // 全型小括號
  Two: 3, // 兩層，通常是全型
});

