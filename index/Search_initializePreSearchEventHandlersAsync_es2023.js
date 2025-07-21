import { testThenDoAsync } from './testThenDo.es2023.js'

export function Search_initializePreSearchEventHandlersAsync() {
    testThenDoAsync({
        cbTest: () =>
            $('#pre_search').length > 0,
    }).then(() => {

        function trigger_pre_search_click(event) {
            const target = event.currentTarget;

            const books = JSON.parse($(target).attr('books')) // 若是單卷，則會是 [0]。
            const cnt = parseInt($(target).attr('cnt'));// 0 也是會有值
            const group_name = $(target).attr('group_name'); // group 會有，book 不會有。並且一定是繁體中文。
            const book_name = $(target).attr('book_name'); // book 會有，group 不會有。並且一定是繁體中文。

            const data = {
                jret2: Search_DataForGroupUi.s._record_ordered,
                books: books,
                cnt: cnt,
                group_name: group_name,
                book_name: book_name
            };
            sephp.pre_search_click({ data });
        }

        // 原版本，2個事件，被重構中，共用同一個
        $('#pre_search').on('click', '.presearch_div_button', trigger_pre_search_click);

        // 事件，搜尋結果的經文的事件。
        $("#search_result").off().on("click", ".address", function (event) {
            sephp.open_ref_click(event);
        }).on("click", "div.copy", function (event) {
            sephp.copy_text(event);
        }).on("click", "span.seSN", function (event) {
            sephp.sn_click(event);
        }).on('scroll', function (event) {
            if ($(this).scrollTop() + $(this).innerHeight() + 100 >= this.scrollHeight) {
                var re = sephp.continue_search();
                if (re != null)
                    sephp.create_dialog_search_result(re);
            }
        })
    });
}