/**
 * matchGlobalWithCapture(reg, str)
 * - 目的：以 global 模式執行正規表達式，收集所有 RegExpExecArray（包含 index 與 capture groups）
 * - 回傳：RegExpExecArray[] (每個元素為一次 exec 的結果)
 *
 * 注意事項：
 * - 請傳入已經帶 global flag 的 RegExp (例如 /.../g)。若不是 global，會直接丟錯。
 * - 函式在結束前會把 reg.lastIndex 還原為 0，避免影響外部使用同一個 RegExp 的情況。
 * - 為了避免某些引擎或 pattern 在遇到空字串 match 時造成無窮迴圈，我在迴圈內做了空 match 的防護（若 match[0] === ''，會把 lastIndex 向前推進 1）。
 */

/**
 * Collect all RegExpExecArray results for a global RegExp on a string.
 * @param {RegExp} reg - must have global flag (g)
 * @param {string} str
 * @returns {RegExpExecArray[]}
 */
export function matchGlobalWithCapture(reg, str) {
  if (!(reg instanceof RegExp)) {
    throw new TypeError('matchGlobalWithCapture: first argument must be a RegExp');
  }
  if (!reg.global) {
    throw new Error('matchGlobalWithCapture: RegExp must have the global (g) flag');
  }

  const results = [];
  // ensure start from beginning
  reg.lastIndex = 0;

  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = reg.exec(str)) !== null) {
    results.push(m);

    // 防護：若 match 為空字串，避免停在同一位置造成無窮迴圈
    // ECMAScript 規範會在某些情況自動前進 lastIndex，但為保險兼容性，這裡再檢查一次
    if (m[0].length === 0) {
      // 保證 lastIndex 至少 +1，不讓迴圈停住（但也不要超過字串長度）
      reg.lastIndex = Math.min(reg.lastIndex + 1, str.length);
    }
  }

  // reset lastIndex to original start (0) for caller convenience
  reg.lastIndex = 0;
  return results;
}