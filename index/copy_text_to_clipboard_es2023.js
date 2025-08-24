/**
 * ### copy text
 * - 原本很單純，但 safari 在安全性有限制，所以要改寫成這樣。
 * - 手勢 到 copy 字，中間不能有 await。若真的有 await 的必要，就要像下面一樣，在 write 過程呼叫取資料的非同步。
 * @param {*Function} text_getter_async 
 * @returns 
 */
export async function copy_text_to_clipboard(text_getter_async) {
    // 在使用者手勢中呼叫本函式！
    const canAsyncWrite = !!(navigator.clipboard?.write && window.ClipboardItem && window.isSecureContext);

    if (canAsyncWrite) {
        try {
            const type = 'text/plain';
            const item = new ClipboardItem({
                // 延遲提供資料：瀏覽器會等待這個 Promise 拿到 Blob
                [type]: (async () => {
                    const t = await text_getter_async();
                    return new Blob([t], { type });
                })()
            });
            await navigator.clipboard.write([item]); // 這一行要在手勢回呼中被呼叫
            return true;
        } catch (err) {
            // 失敗則走退回策略
            console.warn('clipboard.write 延遲寫入失敗，改用退回策略：', err);
        }
    }

    // 退回策略：先取到字串，再用既有 copy 函式（在 Safari 若無手勢，可能失敗）
    const text = await text_getter_async();
    try {
        return await copy_text_to_clipboard_old(text);
    } catch {
        return false;
    }
}

async function copy_text_to_clipboard_old(text) {
    // 似乎就是不能 document load 那種訊息用，但 button click 可以的
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(text);
            // console.log('文字已成功複製到剪貼簿:', text);
        } catch (err) {
            console.error('複製到剪貼簿失敗:', err);
        }
    } else {
        // 回退到舊方法
        const copyTextarea = document.createElement('textarea');
        copyTextarea.value = text;
        document.body.appendChild(copyTextarea);
        copyTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(copyTextarea);
        console.warn('使用舊方法複製文字:', text);
    }
}