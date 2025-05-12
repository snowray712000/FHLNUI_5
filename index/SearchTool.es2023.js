import { FhlMidBottomWindow } from "./FhlMidBottomWindow.es2023.js";
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js";
import { doSearch } from "./doSearch.es2023.js";

export class SearchTool {
    static #s = null
    /** @returns {SearchTool} */
    static get s() { if (!this.#s) this.#s = new SearchTool(); return this.#s; }

    dom = null;
    init(ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    }
    registerEvents(ps) {
        var $searchTrigger = $('[data-ic-class="search-trigger"]'),
            $searchInput = $('[data-ic-class="search-input"]'),
            $searchClear = $('[data-ic-class="search-clear"]');

        // 一定展開，不再縮起來 (王道仁提出 2021-07)
        if ($searchTrigger.hasClass('active') == false) {
            $searchTrigger.addClass('active');
        }

        // 放大鏡，按下之後，事件
        $searchTrigger.on('click', function (e) {
            if ($searchInput.val().length > 0) {
                // 使用 trigger 取代 click
                $('.searchBtn').trigger('click');
            }
        })

        // searchInput，按下 Enter 後，觸發搜尋
        $searchInput.on('keypress', function (e) {
            if (e.which === 13) {
                // 使用 trigger 取代 click
                $('.searchBtn').trigger('click');
            }
        })

        // 使用 searchClear.on 取代過時的 searchClear.click
        $searchClear.on('click', function (e) {
            $searchInput.val('')
        })

        $('.searchBtn').on('click', function (e) {
            //ps.leftBtmWinShow = true;
            triggerGoEventWhenPageStateAddressChange(ps);
            FhlMidBottomWindow.s.render(ps);
            doSearch($('.searchBox').val(), ps);

            if (!$('#fhlMidBottomWindowControl').hasClass('selected')) {
                $('#fhlMidBottomWindowControl').trigger("click");
            }
        });
    }
    render(ps, dom) {
        var html = "";/*&#x1f50d;*/
        html += ' <div class="wrapper">\
                      <div class="icon-search-container active" data-ic-class="search-trigger">\
                        <span class="search"><i class="fa fa-search fa-fw"></i></span>\
                        <input type="text" class="searchBox search-input" data-ic-class="search-input" placeholder="Search" on/>\
                        <span class="times-circle" data-ic-class="search-clear">×</span>\
                      </div>\
                      <span class="searchBtn">快速搜尋</span>\
                    </div>'
        dom.html(html);
    }
}

// (function (root) {
//     root.searchTool = {
//         init: function (ps, dom) {
//             this.dom = dom;
//             this.render(ps, this.dom);
//         },
//         registerEvents: function (ps) {
//             var $searchTrigger = $('[data-ic-class="search-trigger"]'),
//                 $searchInput = $('[data-ic-class="search-input"]'),
//                 $searchClear = $('[data-ic-class="search-clear"]');

//             // 一定展開，不再縮起來 (王道仁提出 2021-07)
//             if ($searchTrigger.hasClass('active') == false) {
//                 $searchTrigger.addClass('active');
//             }

//             // 放大鏡，按下之後，事件
//             $searchTrigger.on('click', function (e) {
//                 if ($searchInput.val().length > 0) {
//                     // 使用 trigger 取代 click
//                     $('.searchBtn').trigger('click');
//                 }
//             })

//             // searchInput，按下 Enter 後，觸發搜尋
//             $searchInput.on('keypress', function (e) {
//                 if (e.which === 13) {
//                     // 使用 trigger 取代 click
//                     $('.searchBtn').trigger('click');
//                 }
//             })

//             // 使用 searchClear.on 取代過時的 searchClear.click
//             $searchClear.on('click', function (e) {
//                 $searchInput.val('')
//             })

//             $('.searchBtn').on('click', function (e) {
//                 //ps.leftBtmWinShow = true;
//                 triggerGoEventWhenPageStateAddressChange(ps);
//                 fhlMidBottomWindow.render(ps);
//                 doSearch($('.searchBox').val(), ps);

//                 if (!$('#fhlMidBottomWindowControl').hasClass('selected')) {
//                     $('#fhlMidBottomWindowControl').trigger("click");
//                 }
//             });
//         },
//         render: function (ps, dom) {
//             var html = "";/*&#x1f50d;*/
//             html += ' <div class="wrapper">\
//                       <div class="icon-search-container active" data-ic-class="search-trigger">\
//                         <span class="search"><i class="fa fa-search fa-fw"></i></span>\
//                         <input type="text" class="searchBox search-input" data-ic-class="search-input" placeholder="Search" on/>\
//                         <span class="times-circle" data-ic-class="search-clear">×</span>\
//                       </div>\
//                       <span class="searchBtn">快速搜尋</span>\
//                     </div>'
//             dom.html(html);
//         }
//     };

// })(this)

