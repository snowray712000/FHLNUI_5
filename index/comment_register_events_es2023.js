import { BibleConstant } from "./BibleConstant.es2023.js";
import { BookSelect } from "./BookSelect.es2023.js";
import { FhlInfo } from "./FhlInfo.es2023.js";
import { FhlLecture } from "./FhlLecture.es2023.js";
import { getBookFunc } from "./getBookFunc.es2023.js";
import { queryDictionaryAndShowAtDialogAsync } from "./queryDictionaryAndShowAtDialogAsync.es2023.js";
import { queryReferenceAndShowAtDialogAsync } from "./queryReferenceAndShowAtDialogAsync.es2023.js";
import { splitReference } from "./splitReference.es2023.js";
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js";
import { ViewHistory } from "./ViewHistory.es2023.js";

/**
 * ### fhlInfoContent 重構過來的
 */
export function comment_register_events() {
    $('#fhlInfoContent').off('click', '.sn').on('click', '.sn', ev => {
        let that = $(ev.target)
        let sn = that.attr('sn');
        let N = that.attr('tp') == 'H' ? 1 : 0 // 0 是新約 1 是舊約
        queryDictionaryAndShowAtDialogAsync({ sn, isOld: N == 1 })
    })

    // sn mouseenter mouseleave 事件
    $('#fhlInfoContent').off('mouseenter', '.sn').on('mouseenter', '.sn', function () {
        var r2 = $(this)
        var sn = r2.attr('sn')
        var N = r2.attr('tp') == 'H' ? 1 : 0
        ps.snAct = sn
        ps.snActN = N
        SN_Act_Color.s.act_add(sn, N)
    })
    $('#fhlInfoContent').off('mouseleave', '.sn').on('mouseleave', '.sn', function () {
        ps.snAct = ""
        ps.snActN = -1
        SN_Act_Color.s.act_remove()
    })

    $('#fhlInfoContent').off('click', '.commentJump').on('click', '.commentJump', ev => {
        const ps = TPPageState.s;
        const defaultAddress = { book: ps.bookIndex, chap: ps.chap, verse: ps.sec };

        const current_target = ev.currentTarget
        const dtexts = splitReference($(current_target).text(), defaultAddress)
        queryReferenceAndShowAtDialogAsync({
            addrs: dtexts[0].refAddresses,
            event: ev
        })
    })

    $('.commentSecBack, .commentSecNext').click(function () {
        // $('.commentSecBack, .commentSecNext, .commentJump').click(function () {
        var oldEngs = ps.engs;
        var oldChap = ps.chap;
        ps.engs = $(this).attr('engs');
        var idx = getBookFunc('indexByEngs', ps.engs);
        ps.chineses = BibleConstant.CHINESE_BOOK_ABBREVIATIONS[idx];
        ps.chap = $(this).attr('chap');
        ps.sec = $(this).attr('sec');
        triggerGoEventWhenPageStateAddressChange(ps);
        
        BookSelect.s.render();
        /*if(oldEngs!=ps.engs||oldChap!=ps.chap)
          fhlLecture.render(ps,fhlLecture.dom);*/
        FhlLecture.s.render();
        FhlInfo.s.render(ps);
        $('#fhlInfoContent').scrollTop(0);
        ViewHistory.s.render();
    });

    $('.commentBackground').click(function () {
        if (ps.chap != 0 && ps.chap != 0) {
            ps.commentBackgroundChap = ps.chap;
            ps.commentBackgroundSec = ps.sec;
            ps.engs = $(this).attr('engs');
            var idx = getBookFunc('indexByEngs', ps.engs);
            ps.chineses = BibleConstant.CHINESE_BOOK_ABBREVIATIONS[idx];
            ps.chap = $(this).attr('chap');
            ps.sec = $(this).attr('sec');
            fhlInfo.render(ps);
            $('#fhlInfoContent').scrollTop(0);
        } else {
            ps.chap = ps.commentBackgroundChap;
            ps.sec = ps.commentBackgroundSec;
            fhlInfo.render(ps);
        }
    });

    $('#commentScrollDiv').scroll(function () {
        $(this).addClass('scrolling');
        clearTimeout($.data(this, "scrollCheck"));
        $.data(this, "scrollCheck", setTimeout(function () {
            $('#commentScrollDiv').removeClass('scrolling');
        }, 350));
    });
}