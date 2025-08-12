
export async function copy_text_to_clipboard(text) {
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