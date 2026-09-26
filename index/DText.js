// @ts-check

/** w,sn,tp,tp2 */

/**
 * @typedef {import("./DFoot.js").DFoot} DFoot
 */
/**
 * @typedef {Object} DAddressObject
 * @property {number} [book] 1-based book id
 * @property {number} [chap] 1-based chap number
 * @property {number} [verse] 1-based sec number ... 有的部分是用 verse，有的地方是用 sec。沒有統一，很抱歉。
 */

/**
 * @typedef {Array<number>} DAddressArray 例如 [1,1,1]，皆為 1-based
 */

/**
 * @typedef {DAddressObject | DAddressArray} DAddress
 * 若是 object 就是 {book:1, chap:1, verse:1}；
 * 若是 Array<number> 就是 [1,1,1]；皆為 1based。
 */

/**
 * 用於 註釋 資料中的 Table
 * 或許會問: DText 指接存一個 string 叫 joTable ，將原本的文字存起來就好了。為何還要展開成一個物件。因為 若 Cell 中的文字，應該要先分析過，不再是 .text 而是 DText[] 才對。
 * @typedef {object} DTableCell
 * @property {number} r 0based row index
 * @property {number} c 0based col index
 * @property {number} [rowSpan]
 * @property {number} [colSpan]
 * @property {DText[]} [content]
 */
/**
 * 用於 註釋 資料中的 Table
 * 用在 註釋資料 中的 joTable 資料。
 * @typedef {object} DTable
 * @property {number} rows
 * @property {number} cols
 * @property {DTableCell[]} cells
 */

/**
 * @typedef {object} DText
 * @property {string} [w]
 * @property {string} [sn] 不含 H 或 G, 且數字若有零會去頭
 * @property {'H' | 'G'} [tp] H, Hebrew G, Greek
 * @property {'WG' | 'WTG' | 'WAG' | 'WTH' | 'WH'} [tp2] T, time
 * @property {0 | 1} [isSnActived] 是否等於目前 active sn
 * @property {1 | 0} [isCurly] 花括號
 * @property {1} [isMerge] 此節是 'a', 且無法與上節合併時, 會顯示 '併入上節' 並且加上 isMerge=1, 若已與上節合併, 會修正上節的 verses, 並將此節 remove 掉
 * @property {1} [isParenthesesFW] 和合本 小括號(全型 FullWidth), 用在注解(或譯....), 或是標題時(大衛的詩)
 * @property {1} [isParenthesesHW] 和合本 小括號(半型 HalfWidth), cbol時
 * @property {1} [isParenthesesFW2] 和合本 小括號(全型), 連續2層括號, 內層 新譯本 詩3:1
 * @property {any} [sobj] sobj 的資料, 地圖與相片
 * @property {boolean} [isMap]
 * @property {boolean} [isPhoto]
 * @property {1} [isTitle1] 新譯本是 h3；和合本2010 h2
 * 
 * @property {1} [isRef] 交互參照
 * @property {string} [refDescription]  交互參照內容, 例如「創1:1,5,7-9;2:3-1」... refDescription 與 refAddresses 擇一即可, 最後以 qsb api 仍然要計算出 refDescription 來去取得資料. 
 * @property {DAddress[]} [refAddresses] 交互參照內容, 例如「[{book:1,chap:1,verse:1},{...}...]」... refDescription 與 refAddresses 擇一即可, 最後以 qsb api 仍然要計算出 refDescription 來去取得資料. 
 * 
 * @property {1} [isBr] 換行, 新譯本 h3 與 非h3 交接觸
 * @property {1} [isHr] hr/, 原文字典，不同本用這個隔開.
 * @property {string} [key] 搜尋時，找到的keyword，例如「摩西」
 * @property {number} [keyIdx0based] 搜尋時，找到的keyword，例如「摩西 亞倫」, 摩西, 0, 這可能是上色要用到
 * @property {'ol' | 'ul'} [listTp]
 * @property {number} [listLevel] 1 是第一層, 0就是純文字了
 * @property {number[]} [listIdx] 當時分析的層數
 * @property {1 | 0} [isListStart] 若出現這個, html 就要加 <li>
 * @property {1 | 0} [isListEnd] 若出現這個, html 就要加 </li>
 * @property {1 | 0} [isOrderStart] 若出現這個, html 就要加 </ol> 或 </ul>
 * @property {1 | 0} [isOrderEnd] 若出現這個, html 就要加 </ol> 或 </ul>
 * @property {number} [idxOrder] idxOrder, 有這個 html 繪圖可以更加漂亮, 交錯深度之類的
 * @property {string} [class] twcb orig dict 出現的, 它原本就是 html 格式, 若巢狀, 愈前面的 class 愈裡層
 * @property {import("./DFoot.js").DFoot} [foot] rt.php?engs=Gen&chap=4&version=cnet&id=182 真的缺一參數不可,試過只有id不行  和合本 2010 版, 是只有 text ([4.1]「該隱」意思是「得」。) csb: 中文標準譯本 cnet: NET聖經中譯本
 * @property {0 | 1} [isName] 私名號。底線
 * @property {0 | 1} [isBold] 粗體。和合本2010、<b></b>
 * @property {0 | 1} [isGODSay] 紅字。耶穌說的話，會被標紅色。有些版本這麼作。
 * @property {0 | 1} [isOrigNotExist] 虛點點。和合本，原文不存在，為了句子通順加上的翻譯。
 * @property {'w' | 'u'} [wu] 新約原文 + 韋式 + 聯式 + 中，屬於韋式 w 或聯式 u (cvt_others_wu_plus.js)
 * @property {0 | 1} [ispun] punctuation 標點符號，分離出來的標點符號節點
 * @property {string} [cssColor] rgb(195,39,43) 中文標準譯本 csb ， 紅字，是用 span style css color rgb(x,x,x)
 * 
 * @property {DText[]} [children] 仿 ios 版本  title, FW, order list, 都可能用, 與 tpContainer 使用 ... inline children ... 想像一下，繪圖時，文字內容是「請看 #創1:1| 的資料」。這一行，但是裡面的有交互參照，也就是可以理解，一段文字，基本是由 DText[] 所組成的。所以這個 children 不是與「清單」的那種「children」是同樣的。所以會有另一個 children，專門用來放 inline children 的，這樣在「註釋」資料才能夠表達出來。(通常有 children 就不會有 w 了)
 * @property {string} [tpContainer] 配合 children 的，容器當初的 tp 是什麼，是 h1 還是 h2 還是 h3，又或著是 ) 還是 全型 )，又或著是 Fi 之類的
 * 
 * @property {DText[]} [childrenlist] - 這是要作「ol ul li」相關用的。
 * @property {string} [rawTable] - 若有資料是 table，但又不是 joTable 則是用這個。
 * @property {DTable} [joTable] 若有表格資料，則會放在這裡
 * @property {string} [marker] - 這是用在 ordered list 的，像是「1. 2. (一) (二)」等等。
 */

export { };