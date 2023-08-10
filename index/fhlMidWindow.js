(function(root){
    root.fhlMidWindow = {
        init: function (ps, dom) {
            this.dom = dom;
            fhlLecture.init(pageState, $('#fhlLecture'));
            fhlMidBottomWindow.init(pageState, $('#fhlMidBottomWindow'));
            this.render(ps, dom);
        },
        render: function (ps, dom) {
            var width = $(window).width() - $("#fhlLeftWindow").width() - $("#fhlInfo").width() - 12 * 4;
            $("#fhlMidWindow").css({
                'width': width + 'px'
            });
        }
    }
})(this)