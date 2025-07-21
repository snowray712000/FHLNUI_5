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
    /**
     * 
     * @param {Event} event 
     */
    sephp.act_ref_button_click = function (event) {
        
        //console.log("act_ref_button_click not assign., 會傳入 engs, chap, sec, ver 資訊. 通常是用來切換章節");
        // console.error(event); // { engs: "1 Chr", chap: 1, sec: 27, ver="unv" }

        // target 的 parent 的 parent 的 dom 的 attr 有足夠資訊
        const target = $(event.target);
        const book = parseInt( target.attr("book") )
        const chap = parseInt( target.attr("chap") );
        const sec = parseInt( target.attr("sec") );
        const ver = target.attr("ver");

        const ps = TPPageState.s
        ps.bookIndex = book
        ps.chap = chap;
        ps.sec = sec
        
        triggerGoEventWhenPageStateAddressChange(ps);
        BookSelect.s.render();
        FhlLecture.s.render();
        FhlLecture.s.selectLecture(ps.book, ps.chap, ps.sec);
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
