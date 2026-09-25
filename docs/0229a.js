/**
 * @typedef {import('./../index/DText.js').DText} DText
 * @typedef {import('./../index/DText.js').DAddress} DAddress
 * @typedef {import('./../index/tsks/TpTsks.js').TskBlock} TskBlock
 */

// 目標: 將 dtexts 繪圖

// 方法: 使用過去有的流程

// dtext ref 交互參照 規則
// - html 相關的 class 是 .ref
// - 使用的是 attr ( 'addr-desc' ) 
// - 或是使用 attr ( 'data-addrs' ) ... 但回傳值會被 JSON.parse( ) ... 內容應該是 jaArray, 是 [{book,chap,verse},... ] 的集合
// - 若能使用 addr-desc 較好，因為 data-addrs 最終也會被轉去 addr-desc 方式，再配合 qsb.php 來取得資料

// dtext sn Strong Number 規則
// - html 相關的 class 是 .sn
// - 會使用 attr ( 'tp' ) 來區分 H 或 G
// - 會使用 attr ( 'sn' ) 來區分 SN

// isTitle1 的規則
// - html 相關的 class 是 .isTitle1

// dtext childrenlist 清單 規則 (即 ul li 結構)
// - if exist childrenlist, 就會有一個 ul li 結構.
/**
 * @param {DText} dtext
 */
function presudo_render_list_dtexts(dtext) {
    assert(() => dtext.childrenlist != null)

    const $list = $(`<ul class="c-list"></ul>`);
    for (const child of dtext.childrenlist) {
        const $li = render_li(child);
        $list.append($li);
    }
    return $list;

    /**
     * @param {DText} child 
     */
    function render_li(child) {
        const $li = $('<li class="c-li hanging-indent"></li>');
        if (dt?.marker) {
            $li.append($('<span class="c-marker"></span>').text(dt.marker + ' '));
        }

        // 通常 children 與 w 是 二選一 ... children 是較複雜的內容時 ... w 是較單純的內容時
        if (null != child?.children && Array.isArray(child.children) && child.children.length > 0) {
            const $text = $('<span class="c-text"></span>');
            for (const t of child.children) {
                const $t = $('<span></span>');
                // ...
                $li.append($t);
            }
        } else if (null != child?.w) {
            const $text = $('<span class="c-text"></span>');
            $text.text(child.w);
            $li.append($text);
        }
        return $li;
    }
}

// --- summary block case 1 ---

const case1 =
    [
        {
            w: "章本總覽", isTitle1: 1,
            childrenlist: [
                {
                    marker: "●",
                    children: [
                        { w: "1-2", isRef: 1, refDescription: "創1:1-2" },
                        { w: "God creates heaven and earth;" },
                    ]
                },
                {
                    marker: "●",
                    children: [
                        { w: "3-5", isRef: 1, refDescription: "創1:3-5" },
                        { w: "the light;" },
                    ]
                }
            ]
        }
    ]

