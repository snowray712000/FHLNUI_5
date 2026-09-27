## DialogHtml

### ❤ 非常好用

它是基於 jquery-ui，重點是它被我包的很好用。

### ❗ 初始位置

有些 dialog，會想接近「滑鼠」目前位置。(通常是很小的 dialog，一些選擇項)。

#### 👆 操作

- `let position = { my: "right top", at: "right top", of: $(jo.event.target) }`
- 類似這種，它是相對於某個 dom。所以不用去計算，超方便。

#### 👏 意外之喜

- 情境
  - 如果滑鼠很靠近右邊，應該要用 right top、反之，用 left top。
    - 如果要用程式去 if，用 right，或用 left，就很麻煩。
- 自動調整
  - 其實，如果我們視窗 width 過大，但是放不下時，它會自動從 right top 調成 left top 之類的。同樣，雖然我們設 top，但有可能自動被調整為 bottom，這點超讚。

#### 👆 初始大小 width

- 不好
  - 因為它單位是 px，沒辦法用 em 之類的
- 通常
  - 我使用 window.innerWidth * 0.8，類似這樣的，按比例設定。
- 優點
  - 通常 dialog 的 height，會是 auto 的
