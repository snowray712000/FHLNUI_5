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
import { TPPageState } from './TPPageState.es2023.js'
import { SN_Act_Color } from "./SN_Act_Color.es2023.js";
import { BibleConstantHelper } from "./BibleConstantHelper.es2023.js";

export function fix_addr_description(addrDescription, defaultAddr){
    // - 若只有 1:20，就要加書卷名
    // - 若是只有 30，並且是詩篇，就是整章
    // - 若有 30:5-10，也要加書卷名
    // - 詩篇 143 篇，很好測試
    
    // - 方法: 若是數字開始，就加書卷名。若沒有「:」符號，就加上章，但詩篇除外。
    if (/^\s*[0-9]/.test(addrDescription)){
        // - 若沒有「:」符號，就加上章，但詩篇除外。
        const book = defaultAddr.book
        const bookname = BibleConstantHelper.getBookNameArrayChineseShort()[book - 1]

        if (!addrDescription.includes(":")){
            if (book == 19){ // 詩篇
                return bookname + " " + addrDescription
            } else {
                const chap = defaultAddr.chap != 0 ? defaultAddr.chap : 1
                return bookname + " " + chap + " " + addrDescription;
            }
        }

        return bookname + " " + addrDescription;
    } else {
        return addrDescription; // 不是數字開頭，就不處理
    }
}

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
        const ps = TPPageState.s;

        var r2 = $(this) // 是 .sn 本身；原本 $(event) 取不到 sn、tp，註釋中 hover 不會變色
        var sn = r2.attr('sn')
        const tp = r2.attr('tp') // 'G' or 'H'
        // var N = r2.attr('tp') == 'H' ? 1 : 0
        ps.snAct = sn
        // ps.snActN = N
        ps.snActTp = tp

        SN_Act_Color.s.act_add(sn, tp)
    })
    $('#fhlInfoContent').off('mouseleave', '.sn').on('mouseleave', '.sn', function () {
        const ps = TPPageState.s;
        ps.snAct = ""
        // ps.snActN = -1
        ps.snActTp = ""
        SN_Act_Color.s.act_remove()
    })

    $('#fhlInfoContent').off('click', '.commentJump').on('click', '.commentJump', ev => {
        const ps = TPPageState.s;
        const defaultAddress = { book: ps.bookIndex, chap: ps.chap, verse: ps.sec };
        
        const current_target = ev.currentTarget
        let dtexts = splitReference($(current_target).text(), defaultAddress)

        // - 詩篇 30，與 一般的 31:4 之類的不一樣
        const bookAttr = $(ev.currentTarget)?.attr("book");
        if (bookAttr != null && dtexts[0]?.refAddresses == null ){
            const bookChap = $(ev.currentTarget)?.attr("chap") ?? 1;

            const refstr = BibleConstantHelper.getBookNameArrayChineseShort()[ps.bookIndex-1] + bookChap

            dtexts = splitReference(refstr, defaultAddress)
        }

        const fixedDescription = fix_addr_description(dtexts[0].w, defaultAddress)

        const paramsForDialog = {
            // addrsDescription: dtexts[0].w, // 會在詩篇 143 篇產生 Bug。
            addrsDescription: fixedDescription,
            addrs: dtexts[0].refAddresses,
            event: ev
        }

        queryReferenceAndShowAtDialogAsync(paramsForDialog)
    })

    // 註解: 下一處，上一處 的按鈕
    $('.commentSecBack, .commentSecNext').off('click').on('click', function(event){
        const ps = TPPageState.s;

        // - 仍有可能，按了之後，切到下一章。
        const old_book = ps.bookIndex
        const old_chap = ps.chap;
        
        const target = event.currentTarget
        const book = parseInt($(target).attr("book"))
        const chap = parseInt($(target).attr('chap'))
        const sec = parseInt($(target).attr('sec'))

        ps.bookIndex = book
        ps.chap = chap
        ps.sec = sec
        
        triggerGoEventWhenPageStateAddressChange(ps);

        // 就算同一章，也要 render，因為 activate 變了
        FhlLecture.s.render();
        FhlInfo.s.render(ps);
        BookSelect.s.render(); // title 換章也要變
        $('#fhlInfoContent').scrollTop(0);
        ViewHistory.s.render();
    })

    $('.commentBackground').off('click').on('click', function (event) {
        const ps = TPPageState.s;
        if (ps.chap != 0 && ps.chap != 0) {
            const target = event.currentTarget
            const book = parseInt($(target).attr("book"))

            ps.commentBackgroundChap = ps.chap;
            ps.commentBackgroundSec = ps.sec;
            ps.chap = 0 // 設為 0，是背景
            ps.sec = 0
            
            FhlInfo.s.render(ps)
            $('#fhlInfoContent').scrollTop(0);
        } else {
            ps.chap = ps.commentBackgroundChap;
            ps.sec = ps.commentBackgroundSec;
            FhlInfo.s.render(ps);
        }
    });
    $('#commentScrollDiv').off('scroll').on('scroll', function (event) {
        const ps = TPPageState.s;
        const target = event.currentTarget;

        $(target).addClass("scrolling")

        let scrollCheck = $(target).data('scrollCheck') // 第一次會 undefined
        if (!scrollCheck) {
            clearTimeout(scrollCheck)
        }

        scrollCheck = setTimeout(() => {
            $(target).removeClass("scrolling");
        }, 350);

        $(target).data('scrollCheck', scrollCheck);
    });
}