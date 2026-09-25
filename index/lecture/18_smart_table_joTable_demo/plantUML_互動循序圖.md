# PlantUML 互動循序圖

這份文件放兩條最值得先討論的流程：初始載入，以及選取後複製。

## 1. 初始載入與注腳漸進更新

```plantuml
@startuml
title 18 smart table 初始載入流程

actor User
participant LecturePageView
participant LectureController
participant ScriptureRepository
participant ParagraphRepository
participant VerseLayoutService
participant LectureTableRenderer
participant FootnoteService

User -> LecturePageView : 開啟頁面
LecturePageView -> LectureController : init()
LectureController -> ParagraphRepository : loadParagraphData()
LectureController -> ScriptureRepository : loadChapter(book, chap, versions)
ParagraphRepository --> LectureController : paragraphData
ScriptureRepository --> LectureController : rspArr
LectureController -> VerseLayoutService : buildTableModel(rspArr, paragraphData, mode)
VerseLayoutService --> LectureController : tableModel + footWork
LectureController -> LectureTableRenderer : render(tableModel)
LectureTableRenderer --> LectureController : tableDom
LectureController -> LecturePageView : mount(tableDom)
LectureController -> FootnoteService : loadProgressively(footWork)
loop each verse with footnote
  FootnoteService --> LectureController : footnoteLoaded(record)
  LectureController -> LectureTableRenderer : patchVerse(record)
  LectureTableRenderer --> LecturePageView : update verse content
end

@enduml
```

### 討論重點

1. `FootnoteService` 只回報資料更新，不直接 query DOM。
2. `VerseLayoutService` 產出穩定 model，讓 mode 切換與 renderer 解耦。
3. `LectureController` 做流程協調，不做細部 DOM 拼裝。

## 2. 選取與複製

```plantuml
@startuml
title 18 smart table 選取與複製流程

actor User
participant TableSelector
participant SelectionPresenter
participant LectureController
participant CopyService
participant Clipboard
participant CtxMenu

User -> TableSelector : 拖曳或點選 table cell
TableSelector --> SelectionPresenter : selectioncommit(detail)
SelectionPresenter -> LectureController : updateSelection(detail)
LectureController --> SelectionPresenter : selectionState
SelectionPresenter -> CtxMenu : show(x, y, actions)
User -> CtxMenu : 點擊複製
CtxMenu --> SelectionPresenter : copy action
SelectionPresenter -> CopyService : buildCopyPayload(selectionModel)
CopyService -> Clipboard : write(html/plain)
Clipboard --> CopyService : success/fallback
CopyService --> SelectionPresenter : copyResult

@enduml
```

### 討論重點

1. `TableSelector` 應只輸出事件，不更新 badge 或 copyOutput。
2. `SelectionPresenter` 專心處理使用者回饋。
3. `CopyService` 專心處理資料匯出與 clipboard 寫入。