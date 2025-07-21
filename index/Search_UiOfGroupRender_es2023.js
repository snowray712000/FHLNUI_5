import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";
import { Search_DataForGroupUi } from "./Search_DataForGroupUi_es2023.js";
import { gbText } from "./gbText.es2023.js";

export class Search_UiOfGroupRender {
    /**
     * @param {Search_DataForGroupUi} data_of_ui 
     * @returns 
     */
    main(data_of_ui) {
        let div_groups = $('<div id="div_groups"></div>');

        const cnt_of_group = data_of_ui.calc_cnt_of_group(); // 只需算一次，較有效率
        for (const [group_name, cnt] of Object.entries(cnt_of_group)) {
            let div_group = this._gen_group_name(group_name, cnt);
            div_groups.append(div_group);

            let div_books = this._gen_books_in_group(group_name, data_of_ui);
            div_groups.append(div_books);
        }
        return div_groups;
    }
    gen_textarea_for_copy(){
        // textarea 每次都要重新建, 改用 jQuery
        let textarea = $('<textarea></textarea>');
        textarea.attr('id', 'sephp_copy_id');
        textarea.css('position', 'fixed');
        textarea.css('z-index', '-10000');
        textarea.css('opacity', '0.0');//若只有這個,沒有z-index是不行的.可能會在點選的時候擋到人家. 也不能用display:none, 會copy失效
        return textarea;
    }
    _gen_group_name(group_name, cnt_of_group) {
        // <div class="group_name presearch_div_button presearch_div_exist selected" group_name="整卷聖經">整卷聖經(74)</div>
        let div_group = $('<div class="group"></div>')
            .addClass("group_name")
            .attr("group_name", group_name) // 固定用 繁體
            .attr("cnt", cnt_of_group)
            .attr("books", JSON.stringify( fhl.g_book_group[group_name] || [])); // 0based [0,1,2,3,4]

        if (cnt_of_group > 0) {
            div_group.addClass("presearch_div_button presearch_div_exist");
            div_group.text(`${gbText(group_name)}(${cnt_of_group})`);
        } else {
            div_group.addClass("invisible");
            div_group.text(`${gbText(group_name)}`);
        }

        return div_group;
    }
    _gen_books_in_group(group_name, data_of_ui) {
        // <div class="invisible book" book_name="創">創</div>
        // <div class="invisible book presearch_div_button presearch_div_exist" book_name="出">出(6)</div>  
        let div_books = $('<div class="div_books"></div>'); // .div_books 會是 display: none
        let book_ids = fhl.g_book_group[group_name] || [] // 0based

        const na = BibleConstantHelper.getBookNameArrayChineseShort()
        const naBig5 = BibleConstantHelper.getBookNameArrayChineseShort(false);
        for (const book_id of book_ids) {
            const cnt = data_of_ui._cnt_of_book[book_id] || 0;

            // let div_book = $('<div class="book invisible"></div>')
            let div_book = $('<div class="book"></div>')
                .attr("book_name", naBig5[book_id]) // 一定是繁體
                .attr("cnt", cnt) // 就算是 0 也要顯示 0
                .attr("books", `[${book_id}]`); // 0based
            if (cnt > 0) {
                div_book.addClass("presearch_div_button presearch_div_exist");
                div_book.text(`${na[book_id]}(${cnt})`);
            } else {
                div_book.text(`${na[book_id]}`);
                div_book.css('display', 'none'); // 若沒有經文，則隱藏
            }

            div_books.append(div_book);
        }

        return div_books;
    }
}