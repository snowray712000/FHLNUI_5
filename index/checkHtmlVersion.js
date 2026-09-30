// 檢查 .html 是否需要更新 (會在 document.ready 之後作)
// ES module（原本由 index.js 以 ijnjs 下載成文字後 eval）
import { TopBar } from './TopBar.es2023.js'
export function checkHtmlVersion(){
    render()
    checkVersionAndSetText()
    
    
    return
    function checkVersionAndSetText() {
        getLastVersion(ver => {
            var r1 = '更新至 ' + ver
            const hasNew = ver != window.currentSWVer
            if (!hasNew) {
                r1 = '手動更新' // 已最新
            }
            // 寬的時候是版本號旁的 ⟳ (有新版才顯示文字)，窄的時候在 ⋮ 選單
            $('#force-reload .fr-text').text(r1)
            $('#force-reload button').attr('title', r1)
            TopBar.s.setReloadText(r1, hasNew)

            return
        })
        return
        function getLastVersion(cb) {
            // 與啟動時的 testIsLastVersionAsync 共用同一次下載
            AppVersion.s.getVersionsTextAsync().then(
                /**
                 * @param {string} jo
                 */
                (jo) => {
                    try {
                        /** @type {{"nui":{"last":string}}} */
                        var r1 = JSON.parse(jo)
                        cb(r1["nui"]["last"])
                    } catch (error) {
                        alert('當檢查是否更新，發生錯誤\n. ' + error)
                    }
                },
                (err) => {
                    alert('當檢查是否更新，發生錯誤\n. ' + err)
                })
        }
    }
    function render() {
        var url = '' // action 不加路徑，就等於「自己網址」
        if (location.port != ""  && window.location.port != 80) { // 應該是 dev 版本
            url = 'https://bkbible.fhl.net/NUI/index.html' // live server extension, 無法支援 post 方法
        }
        var r2 = $('<form action=' + url + ' method="POST" id="force-reload"></form>')
        var r3 = $('<button type="button" title="檢查更新"><i class="bi bi-arrow-clockwise"></i><span class="fr-text"></span></button>')
        r3.attr('onclick',"try {window.location.reload(true);} catch (er) { $(this).parent().submit(); }")       
        r3.appendTo(r2)
        r2.appendTo($('#appVer'))
        return;    
    }
}

window.checkHtmlVersion = checkHtmlVersion // 維持舊的全域介面