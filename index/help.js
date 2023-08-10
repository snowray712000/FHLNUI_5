
(function (root) {
    root.help = {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
            helpingPopUp.init(ps, $('#helpingPopUp'));
        },
        registerEvents: function (ps) {
            this.dom.on('click', function () {
                // console.log($(this)) // div #help
                if ($('#helpingPopUp').css('opacity') == 1) {
                    $('#helpingPopUp').css({
                        'visibility': 'hidden',
                        'opacity': '0'
                    });
                } else {
                    $('#helpingPopUp').css({
                        'visibility': 'visible',
                        'opacity': '1'
                    });
                }
            });
        },
        render: function (ps, dom) {
            var html = "";
            html += '?';
            dom.html(html);
            this.registerEvents(ps);
        }
    };
})(this)