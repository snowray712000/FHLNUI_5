/**
 * CtxMenu — 自訂右鍵選單元件
 *
 * 使用方式：
 *   const menu = new CtxMenu(document.getElementById('ctx-menu'));
 *   menu.show(x, y, [
 *     { label: '複製', onClick: fn },
 *     { label: '---' },                   // separator
 *     { label: '其他', onClick: fn, disabled: true },
 *   ]);
 *   menu.hide();
 */
export class CtxMenu {
  #el;
  #removeListeners = null;

  constructor(el) {
    this.#el = el;
  }

  show(x, y, items) {
    const el = this.#el;

    // 重建 items
    el.innerHTML = '';
    for (const item of items) {
      if (item.label === '---') {
        const sep = document.createElement('div');
        sep.className = 'separator';
        el.appendChild(sep);
        continue;
      }
      const div = document.createElement('div');
      div.className = 'item' + (item.disabled ? ' disabled' : '');
      div.textContent = item.label;
      if (!item.disabled && item.onClick) {
        div.addEventListener('click', () => { this.hide(); item.onClick(); });
      }
      el.appendChild(div);
    }

    // 定位
    el.style.left    = x + 'px';
    el.style.top     = y + 'px';
    el.style.display = 'block';

    // 超出視窗時反向
    const r = el.getBoundingClientRect();
    if (r.right  > window.innerWidth)  el.style.left = (x - r.width)  + 'px';
    if (r.bottom > window.innerHeight) el.style.top  = (y - r.height) + 'px';

    // 自動關閉監聽：用 setTimeout 延後，避免觸發 show() 的那個 click 事件立刻關掉選單
    const onClickOutside = e => { if (!el.contains(e.target)) this.hide(); };
    const onEsc          = e => { if (e.key === 'Escape') this.hide(); };
    this.#removeListeners = () => {
      document.removeEventListener('click',  onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
    setTimeout(() => {
      document.addEventListener('click',  onClickOutside);
      document.addEventListener('keydown', onEsc);
    }, 0);
  }

  hide() {
    this.#el.style.display = 'none';
    this.#removeListeners?.();
    this.#removeListeners = null;
  }
}
