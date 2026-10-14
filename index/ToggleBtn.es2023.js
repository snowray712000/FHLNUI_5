/**
 * 設定面板的開關按鈕：按鈕本身就是標籤，開 = 亮、關 = 灰框 (不再有 ON / OFF)。見 docs/z261014b
 * 裡面仍是 checkbox (id 不變)，原本的 change 事件、.prop('checked')、.trigger('change') 都照用；樣式見 fhl.css 的 .tgl-btn
 * @param {string} id checkbox 的 id @param {string} name 顯示的名稱 (已轉繁簡) @param {boolean} checked
 */
export const toggleBtnHtml = (id, name, checked) =>
    `<label class="tgl-btn"><input type="checkbox" class="tgl-input" name="${id}" id="${id}"${checked ? ' checked' : ''}><span>${name}</span></label>`
