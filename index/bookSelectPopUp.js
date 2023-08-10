(function (root) {
    root.bookSelectPopUp = {
        init: function (ps, dom) {
            this.dom = dom;
            bookSelectName.init(ps, $('#bookSelectName'));
            bookSelectName.registerEvents(ps);
            this.dom.hide();
        },
        registerEvents: function (ps) {
            var that = this;
            this.dom.click(function (e) {
                e.stopPropagation();
            });
        }
    };
})(this)