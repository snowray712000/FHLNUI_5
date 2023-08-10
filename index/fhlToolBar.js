(function (root) {
    var fhlToolBar = {
        init: function (ps) {
            //this.registerEvents();
            help.init(ps, $('#help'));
            windowControl.init(ps, $('#windowControl'));
            // windowControl.registerEvents(ps); // mark by snow. 2021.07 init 裡就有呼叫了                        
            bookSelect.init(ps, $('#bookSelect'));
            searchTool.init(ps, $('#searchTool'));
            searchTool.registerEvents(ps);
        }
    };
    
    root.fhlToolBar = fhlToolBar
})(this)