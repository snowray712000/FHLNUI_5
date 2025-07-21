import { assert } from './assert_es2023.js';
import { Search_continue_search } from './Search_continue_search_es2023.js'
/**
 * 定義型別別名
 * @typedef {import('./Search_Types_es2023').OneSeRecord} OneSeRecord
 */

function get_last_group_name() {
    const last_selected_group = $('#div_groups .group_name.selected').first();
    const last_group_name = last_selected_group.attr('group_name');
    return last_group_name;
}
function get_last_book_name() {
    const last_selected_group = $('#div_groups .book.selected')
    if (last_selected_group.length === 0) {
        return null; // 沒有選擇書卷
    }

    return last_selected_group.first().attr('book_name');;
}

/** 
 * @typedef {-1|0|1|2|3} TpClicking  -1 未知 0 點擊_同個分類 1 點擊_不同分類 2 點擊_同個書卷 3 點擊_不同書卷 */
let tpClicking = -1
const TpClicking_UNKNOWN = -1;
const TpClicking_SAME_GROUP = 0;
const TpClicking_DIFFERENT_GROUP = 1;
const TpClicking_SAME_BOOK = 2;
const TpClicking_DIFFERENT_BOOK = 3;

/**
 * @param {*} pdata 
 * @param {string | null} last_group_name 
 * @param {string | null} last_book_name 
 * @returns {TpClicking}
 */
function get_clicking_type(pdata, last_group_name, last_book_name) {
  if (pdata.data.group_name != null ){
    if (pdata.data.group_name == last_group_name) {
        return TpClicking_SAME_GROUP; // 點擊同個分類
    } else {
        return TpClicking_DIFFERENT_GROUP; // 點擊不同分類
    }
  } else {
    if (pdata.data.book_name == null) {
        console.warn("不太可能發生，有空請檢查");
        return TpClicking_UNKNOWN;
    }
    
    if (last_book_name == null || last_book_name != pdata.data.book_name) {
        return TpClicking_DIFFERENT_BOOK; // 點擊不同書卷
    } else {
        return TpClicking_SAME_BOOK; // 點擊同個書卷
    }
  }
}

/**
 * @param {string | null} group_name 
 * @returns {JQuery<HTMLElement>}
 */
function get_div_books_of_group_name(group_name) {
    // <div.group_name[group_name="整卷聖經"]></div>
    // <div.div_books></div>
    // 因為，結構長得像這樣，所以要用 .next()
    return $(`.group_name[group_name="${group_name}"]`).next('.div_books');
}

/**
 * 
 * @param {*} pdata 
 * @param {string | null} last_group_name 
 * @param {TpClicking} tpClicking 
 * @returns 
 */
function set_group_selection(pdata, last_group_name, tpClicking) {
    if (tpClicking != TpClicking_SAME_GROUP && tpClicking != TpClicking_DIFFERENT_GROUP) {
        return;
    }

    assert (pdata.data.group_name != null, "group_name should not be null");
    const group_name = pdata.data.group_name;
    if ( tpClicking == TpClicking_DIFFERENT_GROUP ){
        // 將之前的 select 取消
        $(".group_name.selected").removeClass("selected");
        // 將現在的 selected 起來
        $(`.group_name[group_name="${group_name}"]`).addClass("selected");

        // 將之前的 .div_books 隱藏
        get_div_books_of_group_name(last_group_name).css('display', '');
        // 將現在的 .div_books 顯示 (整卷聖經、舊約、新約，太多所以不展開，但第二次點擊的話，還是可以展開)
        if ( group_name != "整卷聖經" && group_name != "舊約" && group_name != "新約" ){
            get_div_books_of_group_name(group_name).css('display', 'block');
        }
    } else {
        assert ( tpClicking == TpClicking_SAME_GROUP, "tpClicking should be SAME_GROUP");
        // 從目前的 selected 再 click 一次，將其隱藏 (例如，書卷太長了，不方便點擊下一個 群組)
        const div_books = get_div_books_of_group_name(group_name);
        
        if (div_books.css('display') == 'block') {
            div_books.css('display', '');
            // div_books.slideUp(300)
        } else {
            div_books.css('display', 'block');
            // div_books.slideDown(300);
        }
    }
}

/**
 * 
 * @param {*} pdata 
 * @param {string | null} last_group_name 
 * @param {string | null} last_book_name 
 * @param {TpClicking} tpClicking 
 * @returns 
 */
function change_book_highlight(pdata, tpClicking) {
    if ( tpClicking == TpClicking_DIFFERENT_GROUP ){
        // 將之前的 .selected 取消 (之前的，可能不存在)
        $(".div_books .book.selected").removeClass("selected");
    }
    
    if ( tpClicking != TpClicking_SAME_BOOK && tpClicking != TpClicking_DIFFERENT_BOOK ) {
        return;
    }

    const book_name = pdata.data.book_name
    if ( tpClicking == TpClicking_DIFFERENT_BOOK ) {
        // 將之前的 .selected 取消 (之前的，可能不存在)
        $(".div_books .book.selected").removeClass("selected");
        // 將現在的 .selected 起來
        $(`.div_books > .book[book_name="${book_name}"]`).addClass("selected");
    }
}
function start_search_and_render_result(pdata){
    /** @type {OneSeRecord[]} */
    const record = pdata.data.jret2
    /** @type {number[]} 若是單卷書，則是 length = 1 的陣列 0based*/
    var books = pdata.data.books;
    
    // scroll 到最上面
    $(sephp.node_search_result).scrollTop(0)
    sephp.node_search_result.innerHTML = '<i class="fa fa-spinner fa-pulse center"></i>'; // 加載中，圖示
    
    // 產生一份新的，並且只包含 books 的
    const record2 = record.filter( a1 => books.includes(a1.ibook))
    sephp.Lq_ret_group = record2
    sephp.cnt_search = 0; // 目前已經有 0 筆資料具有 bible_text
    
    const re = Search_continue_search();
    if (re != null && re.length > 0) {
        sephp.node_search_result.innerHTML = "";
        sephp.create_dialog_search_result(re);
    }
}

export function Search_pre_search_click(pdata) {
    const last_group_name = get_last_group_name();
    const last_book_name = get_last_book_name();
    const tpClicking = get_clicking_type(pdata, last_group_name, last_book_name);

    set_group_selection(pdata, last_group_name, tpClicking);
    change_book_highlight(pdata, tpClicking);

    if ( tpClicking == TpClicking_DIFFERENT_BOOK || tpClicking == TpClicking_DIFFERENT_GROUP ) {
        start_search_and_render_result(pdata);
    }
}//pre_search_click