// 檢查 .html 是否需要更新 (會在 document.ready 之後作)
function checkHtmlVersion(){
    render()
    checkVersionAndSetText()
    
    
    return
    function checkVersionAndSetText() {
        getLastVersion(ver => {
            var r1 = '更新至 ' + ver
            if (ver == window.currentSWVer) {
                r1 = '手動更新' // 已最新
            }
            $('#force-reload button').text(r1)

            return
        })
        return
        function getLastVersion(cb) {
            $.ajax({
                url: './app_versions.json',
                dataType: 'text',
                cache: false,
                /**             
                 * @param {string} jo 
                 */
                success: (jo) => {
                    try {
                        /** @type {{"nui":{"last":string}}} */
                        var r1 = JSON.parse(jo)
                        cb(r1["nui"]["last"])
                    } catch (error) {
                        alert('當檢查是否更新，發生錯誤\n. ' + error)
                    }
                },
                error: (err) => {
                    alert('當檢查是否更新，發生錯誤\n. ' + err.status + ' ' + err.statusText + ' ' + err.responseText)
                }
            })
        }
    }
    function render() {
        var r1 = $('#title')
        // var r3 = $('<button onclick="window.location.reload(true)">檢查更新</button>')
        // r3.css({ "border": "0", "background-color": "rgba(0,0,0,0)", "text-decoration": "underline", "color": "blue", "font-size": "0.7rem" })
        // r3.appendTo(r1)

        var url = '' // action 不加路徑，就等於「自己網址」
        if (location.port != ""  && window.location.port != 80) { // 應該是 dev 版本
            url = 'https://bkbible.fhl.net/NUI/index.html' // live server extension, 無法支援 post 方法
        }
        var r2 = $('<form action=' + url + ' method="POST" id="force-reload"></form>')
        r2.css({ "display": "inline-block", "font-size": "0.7rem" })
        var r3 = $('<button type="button">檢查更新</button>')
        r3.css({ "border": "0", "background-color": "rgba(0,0,0,0)", "text-decoration": "underline", "color": "blue" })
        r3.attr('onclick',"try {window.location.reload(true);} catch (er) { $(this).parent().submit(); }")       
        r3.appendTo(r2)
        r2.appendTo(r1)
        return;    
    }
}

(function(root){
    root.checkHtmlVersion = checkHtmlVersion
})(this)