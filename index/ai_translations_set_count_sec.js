import { DialogHtml } from "./DialogHtml.es2023.js"
import { TPPageState } from "./TPPageState.es2023.js"

export function ai_translations_set_count_sec(event) {
    let ps = TPPageState.s

    let htmlContent = `<ul>
        <li> 自動：以<code>段落</code>為單位(目前以「新譯本」分段) </li>
        <li> 設定值：設定取<code>多少節</code>。例如，設定 3，就會是 創1:1-3。</li>
        <li> 規則：不會跨書卷。</li>
        <li> 說明：愈多，AI 資料反而不夠精確。</li>
        <li> 說明：愈多，取得資料，愈慢。</li>
        </ul>
        <hr/>
        目前設定值：<select id="ai_is_auto_count_of_verse">
            <option value="-1">自動</option>
            <option value="0">設定值</option>
        </select>
        <br/>
        節數：<input type="number" id="ai_count_of_verse" value="3" min="1">` // 增加一個輸入框
        

    let position = { my: "right top", at: "right top", of: $(event.target) }

    let dlg = new DialogHtml()
    dlg.showDialog({
        html: `<div>${htmlContent}</div>`,
        getTitle: () => "設定「節數」",
        position: position,
        width: window.innerWidth * 0.3,
        registerEventWhenShowed: dlg => {
            // 初始化，取得目前值
            const is_auto = TPPageState.s.ai_is_auto_count_of_verse ?? 0
            
            const count_verse = TPPageState.s.ai_count_of_verse
            // #section_count 

            $('#ai_is_auto_count_of_verse').val(is_auto == 1 ? -1 : 0); // 初始化為當前狀態
            $('#ai_count_of_verse').val(count_verse);

            // 更新設定值時
            dlg.on('change', '#ai_is_auto_count_of_verse', function () {
                let ps = TPPageState.s
                const val = parseInt($(this).val());
                ps.ai_is_auto_count_of_verse = val == -1 ? 1 : 0 ;
                TPPageState.s.saveToLocalStorage()
            });
            dlg.on('change', '#ai_count_of_verse', function () {
                let ps = TPPageState.s
                let val = parseInt($(this).val());
                ps.ai_count_of_verse = val;
                TPPageState.s.saveToLocalStorage()
            });
            

        }
    })
}