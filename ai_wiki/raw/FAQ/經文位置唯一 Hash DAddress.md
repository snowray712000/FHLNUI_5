### ❓ 問題:
DAddress 表示經文位置，我印像中，有一段 code 可以讓經文 唯一。你可以幫我找是什麼 code 嗎，類似 book * 一個很大的數學，chap 乘一個，verse 也乘一個。絕對不會重複的。

### note

- [Hash_DAddress_es2023.js](Hash_DAddress_es2023.js)

---



---

# ai response

Hash_DAddress_es2023.js 這個檔名看起來就是。

找到了，在 [Hash_DAddress_es2023.js](index/Hash_DAddress_es2023.js) 這個檔案。

`Hash_DAddress.toHash(book, chap, sec)` 公式是：

```
hash = 1000000 * book + 1000 * chap + sec
```

也就是 book × 1,000,000 + chap × 1,000 + sec，可用在 `book/chap/sec` 三種傳參方式（分開參數、`{book,chap,sec}` 物件、或 `[book,chap,sec]` 陣列）。因為 chap 最多 150、sec 最多 176，都小於 1000，所以用千進位錯不了，保證唯一，最大值約 66,000,000，遠低於 int32 上限。

反向還原用 `Hash_DAddress.toAddress(hash)`，會回傳 `[book, chap, sec]`。