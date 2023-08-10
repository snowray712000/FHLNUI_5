
var versionSelect = {
    init: function (ps, dom) {
        this.dom = dom;
        var that = this;

        ajaxUrl = fhl.urlJSON + "uiabv.php?gb=" + ps.gb;
        if (fhl.urlJSON === undefined) {
            ajaxUrl = "/json/uiabv.php?gb=" + ps.gb;
        }
        $.ajax({
            url: ajaxUrl
        }).done(function (d, s, j) {
            if (j) {
                //console.log(j.responseText);
                var jsonObj = JSON.parse(j.responseText);
                that.data = jsonObj;
            }
            that.render(ps, dom, that.data);
        });
        var versionSelectHeight = $('#fhlLeftWindow').height() - $('#settings').height() - $('#viewHistory').height() - 36;
        $('#versionSelect').css({ height: versionSelectHeight + 'px' });
    },
    registerEvents: function (ps) {
        var that = this;

        this.dom.find('li').click(function (e) {
            $(this).toggleClass('selected');
            if ($(this).hasClass('selected')) {
                insertVersion(ps, $(this));
            } else {
                var idx = ps.version.indexOf($(this).attr('book'));
                ps.version.splice(idx, 1);
                ps.cname.splice(idx, 1);
            }
            //Set Default version?
            if (ps.version.length == 0) {
                var o = that.dom.find('li:eq(0)');
                $(o).addClass("selected");
                ps.version.push(o.attr('book'));
                ps.cname.push(o.attr('cname'));
            }

            triggerGoEventWhenPageStateAddressChange(ps);
            fhlLecture.render(ps, fhlLecture.dom);
            e.stopPropagation();
        });

        $('#versionSelectScrollDiv').scroll(function () {
            $(this).addClass('scrolling');
            clearTimeout($.data(this, "scrollCheck"));
            $.data(this, "scrollCheck", setTimeout(function () {
                $('#versionSelectScrollDiv').removeClass('scrolling');
            }, 350));
        });
        return
        function insertVersion(ps, dom) {
            var book = dom.attr('book');
            var cname = dom.attr('cname');
            var versionIdx = getVersionIdx(book);
            var inserted = false;
            //console.log('book='+book+",cname="+cname+",idx="+versionIdx);
            for (var i = 0; i < ps.version.length; i++) {
                if (versionIdx < getVersionIdx(ps.version[i])) {
                    ps.version.splice(i, 0, book);
                    ps.cname.splice(i, 0, cname);
                    inserted = true;
                    break;
                }
            }
            if (inserted == false) {
                ps.version.push(book);
                ps.cname.push(cname);
            }
            return

            function getVersionIdx(book) {
                return $('#versionSelect').find("li[book=" + book + "]").index();
            }

        }

    },
    render: function (ps, dom, data) {
        var that = this;
    }
};

