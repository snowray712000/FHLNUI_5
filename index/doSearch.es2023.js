/// <reference path="../jsdoc/jquery.js" />
/// <reference path="../jsdoc/jquery-ui.js" />
/// <reference path="../jsdoc/sephp.d.js" />
/// <reference path="../ijnjs/ijnjs.d.js" />
/// <reference path="DPageState.d.js" />

import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js'
import { FhlInfo } from './FhlInfo.es2023.js';
import { FhlLecture } from './FhlLecture.es2023.js';
import { BookSelect } from './BookSelect.es2023.js';
import { BibleConstant } from './BibleConstant.es2023.js';
import { TPPageState } from './TPPageState.es2023.js';

export function doSearch(keyword, ps, isAll) {
    /// <summary> 新版本 (2015.08.01, 搜尋</summary>
    /// <param type="string" name="keyword" parameterArray="false">Ex: #賽 21:1| or 3478 or 當把</param>
    /// <param type="bool" name="isAll" parameterArray="false">SN搜尋的時候,它若是在新約的時候,click,就只找新約,default:true</param>
    $('#fhlMidBottomWindowTitle').html('搜尋：' + keyword);
    if (isAll == undefined)
        isAll = true;

    sephp.act_sn_button_click = function (pdata) {
        //console.log('ex: {engs: "Dan",keyword: "03478",ver: "unv"}');
        $('.searchBox').val(pdata.data.keyword);
    };

    // 2015.07.29(三)
    sephp.act_ref_button_click = function (pdata) {
        const ps = TPPageState.s

        /// <summary> 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節</summary>
        // console.log("act_ref_button_click not assign., 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節");
        var idx = getBookFunc("indexByEngs", pdata.data.engs);
        ps.chineses = BibleConstant.CHINESE_BOOK_ABBREVIATIONS[idx];
        ps.engs = BibleConstant.ENGLISH_BOOK_ABBREVIATIONS[idx];
        ps.chap = pdata.data.chap;
        ps.sec = pdata.data.sec;
        triggerGoEventWhenPageStateAddressChange(ps);
        BookSelect.s.render(ps, BookSelect.s.dom);
        FhlLecture.s.render(ps, FhlLecture.s.dom);
        FhlLecture.s.selectLecture(ps.engs, ps.chap, ps.sec);
        FhlInfo.s.render(ps);
    }; //設定按下查詢之後的空白圓圈圈要作的事

    var issn = false;
    if (ps.strong == 1)
        issn = true;
    var isgb = false;
    if (ps.gb == 1)
        isgb = true;    
    sephp.node_pre_search = document.getElementById("pre_search");
    sephp.node_search_result = document.getElementById("search_result");

    sephp.search(keyword, issn, isgb, ps.version, ps.engs, isAll);

    {//卷軸與介面.2015.07.29(三)        
        $('#pre_search').scroll(function () {
            $(this).addClass('scrolling');
            clearTimeout($.data(this, "scrollCheck"));
            $.data(this, "scrollCheck", setTimeout(function () {
                $('#pre_search').removeClass('scrolling');
            }, 350));
        });
        $('#search_result').scroll(function () {
            $(this).addClass('scrolling');
            clearTimeout($.data(this, "scrollCheck"));
            $.data(this, "scrollCheck", setTimeout(function () {
                $('#search_result').removeClass('scrolling');
            }, 350));
        });
    }//卷軸與介面.

}

// (function (root) {
//     root.doSearch = doSearch
// })(this)
// function doSearch(keyword, ps, isAll) {
//     /// <summary> 新版本 (2015.08.01, 搜尋</summary>
//     /// <param type="string" name="keyword" parameterArray="false">Ex: #賽 21:1| or 3478 or 當把</param>
//     /// <param type="bool" name="isAll" parameterArray="false">SN搜尋的時候,它若是在新約的時候,click,就只找新約,default:true</param>
//     $('#fhlMidBottomWindowTitle').html('搜尋：' + keyword);
//     if (isAll == undefined)
//         isAll = true;

//     sephp.act_sn_button_click = function (pdata) {
//         //console.log('ex: {engs: "Dan",keyword: "03478",ver: "unv"}');
//         $('.searchBox').val(pdata.data.keyword);
//     };

//     // 2015.07.29(三)
//     sephp.act_ref_button_click = function (pdata) {
//         /// <summary> 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節</summary>
//         // console.log("act_ref_button_click not assign., 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節");
//         var idx = getBookFunc("indexByEngs", pdata.data.engs);
//         ps.chineses = book[idx];
//         ps.engs = bookEng[idx];
//         ps.chap = pdata.data.chap;
//         ps.sec = pdata.data.sec;
//         triggerGoEventWhenPageStateAddressChange(ps);
//         bookSelect.render(pageState, bookSelect.dom);
//         fhlLecture.render(pageState, fhlLecture.dom);
//         fhlLecture.selectLecture(ps.engs, ps.chap, ps.sec);
//         fhlInfo.render(pageState);
//     }; //設定按下查詢之後的空白圓圈圈要作的事

//     var issn = false;
//     if (ps.strong == 1)
//         issn = true;
//     var isgb = false;
//     if (ps.gb == 1)
//         isgb = true;    
//     sephp.node_pre_search = document.getElementById("pre_search");
//     sephp.node_search_result = document.getElementById("search_result");

//     sephp.search(keyword, issn, isgb, ps.version, ps.engs, isAll);

//     {//卷軸與介面.2015.07.29(三)        
//         $('#pre_search').scroll(function () {
//             $(this).addClass('scrolling');
//             clearTimeout($.data(this, "scrollCheck"));
//             $.data(this, "scrollCheck", setTimeout(function () {
//                 $('#pre_search').removeClass('scrolling');
//             }, 350));
//         });
//         $('#search_result').scroll(function () {
//             $(this).addClass('scrolling');
//             clearTimeout($.data(this, "scrollCheck"));
//             $.data(this, "scrollCheck", setTimeout(function () {
//                 $('#search_result').removeClass('scrolling');
//             }, 350));
//         });
//     }//卷軸與介面.

// }