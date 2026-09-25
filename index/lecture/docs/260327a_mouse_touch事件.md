# Mouse / Touch / Pointer Events 發展與整理

## 一、三族事件概覽

### 1. Mouse Events（滑鼠，桌機時代）

最早的輸入事件，只針對滑鼠設計。

| 事件 | 時機 |
|------|------|
| `mousedown` | 按下按鍵 |
| `mousemove` | 移動游標 |
| `mouseup` | 放開按鍵 |
| `click` | down + up 在同元素完成 |
| `dblclick` | 雙擊 |
| `contextmenu` | 右鍵（或長按觸控） |
| `mouseenter` / `mouseleave` | 進出元素（**不冒泡**） |
| `mouseover` / `mouseout` | 進出元素（**冒泡**） |
| `wheel` | 滾輪 |

---

### 2. Touch Events（觸控，行動裝置時代）

Apple 在 iPhone（2007）推出後隨之制定，專門處理手指觸控，支援多點觸控。

| 事件 | 時機 |
|------|------|
| `touchstart` | 手指按下 |
| `touchmove` | 手指移動 |
| `touchend` | 手指離開螢幕 |
| `touchcancel` | 被系統中斷（來電、切換 App 等） |

**特點：**
- `e.touches` — 目前所有在螢幕上的手指
- `e.changedTouches` — 本次事件變化的手指
- 支援多點觸控（pinch-zoom、雙指手勢）
- 若要阻止瀏覽器預設捲動，需傳入 `{ passive: false }` 並呼叫 `e.preventDefault()`

---

### 3. Pointer Events（統一族，現代推薦）

Microsoft 2012 年提出，目標是**一套事件涵蓋所有輸入裝置**（滑鼠、觸控、手寫筆）。

| 事件 | 對應 Mouse / Touch |
|------|-------------------|
| `pointerdown` | mousedown / touchstart |
| `pointermove` | mousemove / touchmove |
| `pointerup` | mouseup / touchend |
| `pointercancel` | touchcancel |
| `pointerenter` / `pointerleave` | mouseenter / mouseleave |
| `gotpointercapture` / `lostpointercapture` | 搭配 `setPointerCapture()` 使用 |

**透過 `e.pointerType` 區分來源：**

```js
e.pointerType  // 'mouse' | 'touch' | 'pen'
e.pressure     // 壓感（0–1），手寫筆有值
e.tiltX / e.tiltY  // 手寫筆傾斜角
```

---

## 二、時間線

| 年份 | 事件 |
|------|------|
| 2007 | iPhone 發表，Apple 推出 Touch Events，行動瀏覽器開始支援 |
| 2012 | Microsoft 提出 Pointer Events 草案（IE10 專屬） |
| 2015 | W3C 正式發布 Pointer Events Level 1 |
| 2016 | Chrome / Firefox 正式支援 Pointer Events |
| 2017 | Safari 開始支援（拖最久） |
| 2019 | Safari 13 / iOS 13 完整支援；W3C 發布 Pointer Events Level 2 |
| 現在 | 全瀏覽器支援率 ~97%（Can I Use），可放心使用 |

> Safari 是最慢跟進的，這也是為何舊教材還在用 Touch Events——當年不得不用雙套寫法。

---

## 三、實務選擇建議

| 情境 | 建議 |
|------|------|
| 新專案，同時支援桌機＋觸控 | 用 **Pointer Events**，一套搞定 |
| 需要多點觸控（pinch、雙指縮放） | 必須用 **Touch Events** |
| 需相容 iOS 12 以下 | 用 Touch + Mouse 雙套，或加 polyfill |
| 2025 年起的新開發 | Pointer Events 完全夠用 |

---

## 四、常見陷阱：`touch-action: none`

觸控裝置上，瀏覽器預設會將 `pointermove` / `touchmove` 用於捲動頁面。
若不加以阻止，拖曳中途會觸發 `pointercancel`，導致拖曳中斷。

**解法（二選一）：**

```css
/* CSS 方式（推薦，Pointer Events 用這個） */
touch-action: none;
```

```js
// JS 方式（Touch Events 用這個）
element.addEventListener('touchmove', handler, { passive: false });
// 並在 handler 內呼叫 e.preventDefault()
```

---

## 五、範例：用 Pointer Events 改寫拖曳選取

原本 04/06 demo 需要分別寫 Mouse 和 Touch 兩套：

```js
// 舊寫法（雙套）
table.addEventListener('mousedown', ...);
document.addEventListener('mousemove', ...);
document.addEventListener('mouseup', ...);
table.addEventListener('touchstart', ...);
table.addEventListener('touchmove', ...);
table.addEventListener('touchend', ...);
```

改用 Pointer Events 可合併成一套：

```js
// 新寫法（單套）
table.addEventListener('pointerdown', e => {
  table.setPointerCapture(e.pointerId); // 確保 move/up 不會跑掉
  onDragStart(tdAt(e.clientX, e.clientY));
});
table.addEventListener('pointermove', e => {
  onDragMove(e.clientX, e.clientY);
});
table.addEventListener('pointerup', () => onDragEnd());
table.addEventListener('pointercancel', () => onDragEnd());
```

搭配 CSS `touch-action: none` 即可，不需要 `{ passive: false }` 的 workaround。
