/**
 * 有聲聖經、講道分頁共用的小工具：建 DOM、font-awesome icon
 * @param {string} tag
 * @param {Record<string, any>} [attrs] class、text、on{事件} 以外的直接 setAttribute；null / false 略過
 * @param  {...(Node|string|null|false)} children
 */
export function el(tag, attrs = {}, ...children) {
    const re = document.createElement(tag)
    for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue
        if (k == 'class') re.className = v
        else if (k == 'text') re.textContent = v
        else if (k.startsWith('on')) re.addEventListener(k.slice(2), v)
        else re.setAttribute(k, v === true ? '' : v)
    }
    for (const c of children) if (c != null && c !== false) re.append(c)
    return re
}
/** @param {string} name font-awesome 4 名稱，例 play、pause */
export const icon = name => el('i', { class: `fa fa-${name}`, 'aria-hidden': 'true' })
