/** w,sn,tp,tp2 */

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
 * @property {1} [isRef] 交互參照
 * @property {string} [refDescription] 交互參照內容
 * @property {import("../bible-address/DAddress").DAddress[]} [refAddresses] 交互參照內容，併排layout用
 * @property {1} [isBr] 換行, 新譯本 h3 與 非h3 交接觸
 * @property {1} [isHr] hr/, 原文字典，不同本用這個隔開.
 * @property {string} [key] 搜尋時，找到的keyword，例如「摩西」
 * @property {number} [keyIdx0based] 搜尋時，找到的keyword，例如「摩西 亞倫」, 摩西, 0, 這可能是上色要用到
 * @property {'ol' | 'ul'} [listTp]
 * @property {number} [listLevel] 1是第一層, 0就是純文字了
 * @property {number[]} [listIdx] 當時分析的層數
 * @property {1 | 0} [isListStart] 若出現這個, html 就要加 <li>
 * @property {1 | 0} [isListEnd] 若出現這個, html 就要加 </li>
 * @property {1 | 0} [isOrderStart] 若出現這個, html 就要加 </ol> 或 </ul>
 * @property {1 | 0} [isOrderEnd] 若出現這個, html 就要加 </ol> 或 </ul>
 * @property {number} [idxOrder] idxOrder, 有這個 html 繪圖可以更加漂亮, 交錯深度之類的
 * @property {string} [class] twcb orig dict 出現的, 它原本就是 html 格式, 若巢狀, 愈前面的 class 愈裡層
 * @property {import("./DFoot").DFoot} [foot] rt.php?engs=Gen&chap=4&version=cnet&id=182 真的缺一參數不可,試過只有id不行  和合本 2010 版, 是只有 text ([4.1]「該隱」意思是「得」。) csb: 中文標準譯本 cnet: NET聖經中譯本
 * @property {0 | 1} [isName] 私名號。底線
 * @property {0 | 1} [isBold] 粗體。和合本2010、<b></b>
 * @property {0 | 1} [isGODSay] 紅字。耶穌說的話，會被標紅色。有些版本這麼作。
 * @property {0 | 1} [isOrigNotExist] 虛點點。和合本，原文不存在，為了句子通順加上的翻譯。
 * @property {string} [cssColor] rgb(195,39,43) 中文標準譯本 csb ， 紅字，是用 span style css color rgb(x,x,x)
 * @property {DText[]} [children] 仿 ios 版本  title, FW, order list, 都可能用, 與 tpContain 使用
 * @property {string} [tpContain] 配合 children 的，容器當初的 tp 是什麼，是 h1 還是 h2 還是 h3，又或著是 ) 還是 全型 )，又或著是 Fi 之類的
 */

export {};