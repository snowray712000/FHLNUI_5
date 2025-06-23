import { ViewHistory } from './ViewHistory.es2023.js';
import { DocEvent } from './DocEvent.es2023.js';
import { FhlLecture } from './FhlLecture.es2023.js';
import { BookSelect } from './BookSelect.es2023.js';
import { FhlInfo } from './FhlInfo.es2023.js';
import { TPPageState } from './TPPageState.es2023.js';
import { testThenDoAsync, testThenDo } from './testThenDo.es2023.js';
import { triggerGoEventWhenPageStateAddressChange } from './triggerGoEventWhenPageStateAddressChange.es2023.js';
import { assert } from './assert_es2023.js';
import { DocumentCustomListenerState } from './DocumentCustomListenerState_es2023.js';
import { ViewHistoryData } from './ViewHistoryData_es2023.js';
export function makeSure_ps_history_not_empty(){
    assert(TPPageState.s != null && TPPageState.s.history != null, "TPPageState.s.history is null");
    if (TPPageState.s.history.length == 0) {
        TPPageState.s.history = [{
            chineses: TPPageState.s.chineses,
            chap: TPPageState.s.chap,
            book: TPPageState.s.bookIndex
        }];
    }
}
function trigger_init() {
    const _datas = ViewHistoryData.s.datas;
    const _idx = ViewHistoryData.s.idx;

    testThenDoAsync({
        cbTest: () => DocumentCustomListenerState.s.vh_init.length > 0
    }).then(()=>{
        $(document).trigger('vh_init', { datas: _datas, idx: _idx });
    
        trigger_vh_idxchanged();
        trigger_vh_itemschanged();
    })
}
function trigger_vh_idxchanged() {
    const _datas = ViewHistoryData.s.datas;
    const _idx = ViewHistoryData.s.idx;
    $(document).trigger('vh_idxchanged', { datas: _datas, idx: _idx });
}
function trigger_vh_itemschanged() {
    const _datas = ViewHistoryData.s.datas;
    const _idx = ViewHistoryData.s.idx;
    $(document).trigger('vh_itemschanged', { datas: _datas, idx: _idx });
}
export function addViewHistoryEvents(){
    // viewHistory 主界面, 按下其中一個選項的時候, 觸發 idx changed
    ViewHistory.s.when_liclick(function (e, p1) {
        ViewHistoryData.s.idx = p1.idx;
        trigger_vh_idxchanged();
    })
    // viewHistory 主界面, 按下清除所有的時候, 觸發 items changed
    ViewHistory.s.when_clearall(function (e) {
        ViewHistoryData.s.datas = [ViewHistoryData.s.datas[0]];
        ViewHistoryData.s.idx = 0;
        trigger_vh_itemschanged();
    });

    // 當別的地方切換章節的時候, 要新增到 datas, 並觸發事件
    DocEvent.s.when_go(function (e, p1) {   
        
        // 初始化 
        if (ViewHistoryData.s.idx == -1) {
            ViewHistoryData.s.main_initial_async().then(()=>{
                trigger_init();
            })
            return;
        }

        // 更新清單資料
        ViewHistoryData.s.main_new_address(p1);
        
        // render
        trigger_vh_itemschanged();
    });

    // 當 history 改變的時候, 要儲存 ps (其實這個不知道放到哪個class較好, 就先放在這)
    DocEvent.s.when_vh_itemschanged(function (e, p1) {
        TPPageState.s.history = p1.datas;
        pageState.history = p1.datas;
        localStorage.setItem("fhlPageState", JSON.stringify(TPPageState.s));
    });
    function render3(){
        BookSelect.s.render();
        FhlLecture.s.render();
        FhlInfo.s.render(TPPageState.s);
    }
    function change_address_of_ps_via_vh_idxchanged() {
        const address = ViewHistoryData.s.current_address;
        
        let ps = TPPageState.s;
        ps.bookIndex = address.book;
        ps.chap = address.chap;
        ps.sec = address.sec || 1;
    }

    // 當 fhlLecture 中的 bclick 或 nclick 被按下的時候
    FhlLecture.s.when_bclick_or_nclick( () => {
        if (ViewHistoryData.s.idx < ViewHistoryData.s.datas.length - 1) {
            ViewHistoryData.s.idx++;
            trigger_vh_idxchanged();

            change_address_of_ps_via_vh_idxchanged()
            
            render3()
        }
    }, () => {
        if (ViewHistoryData.s.idx > 0) {
            ViewHistoryData.s.idx--;
            trigger_vh_idxchanged();

            change_address_of_ps_via_vh_idxchanged()

            render3()
        }
    });

    // 等待 ps.history ok 就觸發觸始化
    $(()=>{
        testThenDoAsync({
            cbTest: () => TPPageState.s != null && TPPageState.s.history != null            
        }).then(() =>{    
            // 有時候， history 壞掉了，一直都是空的，就要加一個預設的給它
            makeSure_ps_history_not_empty();

            triggerGoEventWhenPageStateAddressChange(TPPageState.s)
        })        
    })
}