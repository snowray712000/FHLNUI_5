

比較務實的做法是先回答這幾個問題：

這個功能入口收到的是什麼資料型態，誰呼叫它。
它需要查哪些外部資料，哪些是同步、哪些是非同步。
最終輸出是 DOM、table model、copy data，還是事件。
哪些欄位是必要的，哪些可以由 service 補齊。
哪些 input 其實是 UI 狀態，不該混進 domain/service。

---

