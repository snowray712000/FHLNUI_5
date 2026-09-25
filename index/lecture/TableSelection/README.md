# TableSelection

這個目錄是把 table 選取互動整理成一組可拆、可搬、可逐步整合的模組。

## 目錄

- core：低依賴核心，優先考慮跨專案搬移
- shared：第二層模組共用的小工具
- renderers：選取結果的視覺呈現
- adapters：把選取結果轉成其他輸出格式
- ui：面板、選單等 UI bridge 或 presenter
- demo：最小整合驗證頁

## 目前檔案

- core/TableSelectionController.js
- core/SelectionState.js
- core/SelectionMath.js
- core/CellLocator.js
- shared/SelectionCells.js
- renderers/SelectionClassRenderer.js
- adapters/ClipboardAdapter.js
- ui/SelectionStatusPresenter.js
- demo/table_selection_demo.html

## 推薦閱讀順序

如果要理解設計理由，先看 [docs/TableSelection/01_核心概念與心智模型.md](../../../docs/TableSelection/01_核心概念與心智模型.md) 到 [docs/TableSelection/09_目前骨架的取捨與下一步.md](../../../docs/TableSelection/09_目前骨架的取捨與下一步.md)。

## 最小使用方式

```js
import { TableSelectionController } from './core/TableSelectionController.js';
import { SelectionClassRenderer } from './renderers/SelectionClassRenderer.js';
import { ClipboardAdapter } from './adapters/ClipboardAdapter.js';
import { SelectionStatusPresenter } from './ui/SelectionStatusPresenter.js';

const selector = new TableSelectionController(tableEl, {
  autoDestroyWhenDisconnected: true,
});

new SelectionClassRenderer(selector, tableEl);
new ClipboardAdapter(selector, tableEl);
new SelectionStatusPresenter(selector, {
  modeBadge,
  statusDetail,
});
```

## 搬移建議

若要搬到別的專案，優先搬這些：

- core/TableSelectionController.js
- core/SelectionState.js
- core/SelectionMath.js
- core/CellLocator.js

依新專案需求再決定是否一起搬：

- shared/SelectionCells.js
- renderers/SelectionClassRenderer.js
- adapters/ClipboardAdapter.js
- ui/SelectionStatusPresenter.js

## 現階段定位

這不是最終完整元件，而是一條已可執行的模組化路徑。

目前最重要的價值是：

- 核心不再黏在 demo 裡
- 第二層模組已可協作
- 跨專案搬移邊界已經清楚

## 目前的選取語意

- `single`：拖曳仍停留在同一個 cell，保留單格選取
- `crossed`：一旦跨出起始 cell，就由 controller 接管多格選取

視覺層目前只分「是否跨 cell」，所以 crossed 一律使用同一種高亮樣式。