function renderTsk(ps) {
    if (ps.titleId == "fhlInfoTsk") {
        var dom2 = document.getElementById("fhlInfoContent");
        if (dom2 != null) {
            var pfn_search_sn = function (sn) {
                doSearch(sn, ps, false);
            };

            var jret = tsk.tskapi(ps.engs, ps.chap, ps.sec, ps.gb ? true : false);
            var r = React.createElement(tsk.R.frame, {
                txt_ori: jret.record[0].com_text,
                default_book: ps.engs,
                chap: ps.chap,
                verse: ps.sec,
                default_version: "unv",
                isSN: ps.strong == 1 ? true : false,
                isGB: ps.gb ? true : false,
                cy: $(dom2).height(),
                pfn_search_sn: pfn_search_sn,
                fontSize: ps.fontSize, //
            });
            React.render(r, dom2);
            var renderobj = React.render(r, dom2);
        }
    }
}
(root => {
    root.renderTsk = renderTsk
})(this)