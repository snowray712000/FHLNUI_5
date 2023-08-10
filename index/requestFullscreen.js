(root => {
    root.requestFullscreen = requestFullscreen
})(this)

function requestFullscreen() {
    $("#mainWindow").css({ top: "0px" });
    //$("#bookSelectPopUp").css({top: "0px"});
    var mainWindow = document.querySelector("#mainWindow");
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        if (mainWindow.requestFullScreen) {
            mainWindow.requestFullScreen().then(afterExit)
        } else if (mainWindow.webkitRequestFullScreen) {
            // safari, chrome, edge
            mainWindow.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT).then(afterExit)
        } else if (mainWindow.mozRequestFullScreen) {
            // firefox test
            mainWindow.mozRequestFullScreen().then(afterExit)
        } else if (mainWindow.msRequestFullscreen) {
            mainWindow.msRequestFullscreen().then(afterExit)
        }
    }
    return
    function afterExit() {
        $('#fullscreenControl').removeClass('selected')
        windowAdjust()
    }
}
