/**
 * 設定面板的開關按鈕：按鈕本身就是標籤，開 = 亮、關 = 灰框 (不再有 ON / OFF)。見 docs/z261014b
 * 用 Bootstrap 的 btn-check + label.btn (同串珠工具列等其它按鈕的樣子，開 = 亮藍底)；checkbox 的 id 不變，原本的 change 事件、.prop('checked')、.trigger('change') 都照用；樣式見 fhl.css 的 .tgl-btn
 * @param {string} id checkbox 的 id @param {string} name 顯示的名稱 (已轉繁簡) @param {boolean} checked @param {string} [title] 滑鼠停上去的說明 (名稱縮短時補全) @param {''|'first'|'mid'|'last'} [pos] 合併成一組時的位置 (只影響圓角與疊框，見 fhl.css .grp-*)
 */
export const toggleBtnHtml = (id, name, checked, title = '', pos = '') =>
    `<input type="checkbox" class="btn-check" name="${id}" id="${id}" autocomplete="off"${checked ? ' checked' : ''}><label class="btn btn-sm btn-outline-secondary set-btn tgl-btn${pos ? ' grp-' + pos : ''}" for="${id}"${title ? ` title="${title}"` : ''}>${name}</label>`
