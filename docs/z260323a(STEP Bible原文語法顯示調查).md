# STEP Bible 原文語法顯示設計調查

來源：https://www.stepbible.org/
調查日期：2026-03-23

本文件描述 STEP Bible 的語法標色設計，供 AI 參考使用。

---

## 設計概念

STEP Bible 使用「多層視覺屬性」同時編碼不同語法維度，讓使用者一眼看出詞的語法特徵：

| 視覺屬性 | 編碼的語法維度 |
|---------|------------|
| 文字顏色 | 性別（Gender）、語氣（Mood） |
| 底線樣式 | 時態（Tense） |
| 字體粗細 | 數（Number：單數/複數） |

這三個維度同時疊加在同一個詞上，不互相干擾。

---

## Gender & Number（性數 開關：gennum2onoffswitch）

適用語言：希臘文（NT）、希伯來文（OT）

### 性別 → 文字顏色

| 性別 | 英文 | 預設顏色 |
|-----|------|---------|
| 陽性 | Masculine | 藍色（Blue） |
| 陰性 | Feminine | 紅色（Red） |
| 中性 | Neuter | 黑色（Black，即無特別標色） |

> 希伯來文只有陽性/陰性，無中性。

### 數 → 字體粗細

| 數 | 英文 | 樣式 |
|----|------|------|
| 單數 | Singular | Normal（一般粗細） |
| 複數 | Plural | **Bold（粗體）** |

> 希伯來文另有雙數（Dual），通常歸入複數或另設樣式。

---

## Greek Verbs（希臘文動詞 開關：verb2onoffswitch）

適用語言：希臘文新約（NT）

動詞同時帶有「時態底線」＋「語氣顏色」，兩者疊加。

### 時態（Tense）→ 底線樣式

| 時態 | 英文 | 底線樣式（概念） | UI 示意 |
|-----|------|----------------|--------|
| 現在式 | Present | 短虛線 | `--- ` |
| 未完成式 | Imperfect | 箭頭線 | `→→→` |
| 不定過去式 | Aorist | （可設定，預設空或特殊） | — |
| 完成式 | Perfect | 雙線 | `===` |
| 過去完成式 | Pluperfect | 雙線（變體） | `===` |
| 將來式 | Future | 點線 | `......` |

> 底線樣式由 CSS `text-decoration` 或 SVG 底線動畫實現，可設定顏色與動態效果。

### 語氣（Mood）→ 文字顏色

| 語氣 | 英文 | 說明 | 預設顏色 |
|-----|------|------|---------|
| 直述語氣 | Indicative | 陳述事實 | 黑色（Black） |
| 命令語氣 | Imperative | 命令 | 紅色（Red） |
| 假設語氣 | Subjunctive | 可能發生 | 橙色（Orange） |
| 願望語氣 | Optative | 希望發生 | 橙色（Orange，變體） |
| 分詞 | Participle | 動詞形容詞 | 可設定 |
| 不定詞 | Infinitive | 動詞基本形 | 可設定 |

> Subjunctive 與 Optative 在截圖中都顯示橙色，但細看有色調差異，可能是深橙 vs 淺橙。

### 語態（Voice）

| 語態 | 英文 | 說明 |
|-----|------|------|
| 主動語態 | Active | 主詞執行動作 |
| 中間語態 | Middle | 主詞為自身利益執行動作 |
| 被動語態 | Passive | 主詞接受動作 |

> Voice 在 STEP 中通常用底線顏色或背景色編碼（非主要強調維度）。

---

## Hebrew Verbs（希伯來文動詞 開關：verb2onoffswitch）

適用語言：希伯來文舊約（OT）

希伯來文動詞語法與希臘文不同，但顯示邏輯相似。

### 時態/體（Tense/Aspect）

| 類型 | 英文 | 說明 |
|-----|------|------|
| 完成體 | Perfect (Qatal) | 完成動作 |
| 未完成體 | Imperfect (Yiqtol) | 未完成/將來動作 |
| 連續完成體 | Consecutive Perfect (weQatal) | 接續前句的完成動作 |
| 連續未完成體 | Consecutive Imperfect (wayyiqtol) | 敘事過去式 |

### 語氣（Mood）

| 語氣 | 英文 | 說明 |
|-----|------|------|
| 命令式 | Imperative | 直接命令（第二人稱） |
| 意願式 | Jussive | 第三人稱的願望/許可 |
| 勸勉式 | Cohortative | 第一人稱的意願/決意 |

### 詞幹（Stem）— 相當於語態/強度

| 詞幹 | 希伯來名 | 說明 |
|-----|---------|------|
| 簡單主動 | Qal | 基本動作 |
| 加強主動 | Piel | 強調/反覆/使役 |
| 使役主動 | Hiphil | 使他人執行動作 |
| 簡單被動 | Niphal | 基本被動 |
| 加強被動 | Pual | Piel 的被動 |
| 使役被動 | Hophal | Hiphil 的被動 |
| 反身 | Hithpael | 自身執行或反身 |

### 性別與數（同 gennum）

| 屬性 | 值 |
|-----|---|
| 性別 | 陽性（M）/ 陰性（F） |
| 數 | 單數（Sg）/ 複數（Pl）/ 雙數（Du） |

### 構詞狀態（State，名詞動詞化時適用）

| 狀態 | 說明 |
|-----|------|
| Absolute | 獨立形式 |
| Construct | 與後接名詞連接（連讀形式） |

---

## 設計小結（給 AI 的重點）

1. **顏色 = 性別 + 語氣**（兩個維度各自獨立控制）
2. **底線樣式 = 時態**（每種時態有獨特線型）
3. **字重 = 單複數**（Bold = 複數）
4. 三層可同時疊加在同一個詞上，不衝突
5. NT（希臘文）與 OT（希伯來文）共用相同 UI 開關，但語法分類不同
6. 所有設定皆可自訂（顏色可換，線型可換），並有 ON/OFF 總開關

---

## 參考來源

- STEP Bible 官網：https://www.stepbible.org/
- STEPBible User Guide (grammar)：https://stepbibleguide.blogspot.com/p/grammar.html
- STEPBible Data - Greek Morphology Codes (TEGMC)：https://github.com/STEPBible/STEPBible-Data
- STEPBible Data - Hebrew Morphology Codes (TEHMC)：https://github.com/STEPBible/STEPBible-Data
