(root => {
    root.getAjaxUrl = getAjaxUrl
})(this)

function getAjaxUrl(func, ps, idx) {
    var paramArr = ["engs", "chineses", "chap", "sec", "version",
        "strong", "gb", "book", "N", "k"];
    var urlParams = {
        sc: [0, 2, 3, 6, 7],
        qb: [1, 2, 4, 5, 6],
        qp: [0, 2, 3, 6],
        sd: [6, 8, 9]
    };

    if (func == 'qb') {
        // add by snow. 2021.07
        var r1 = Enumerable.from(bookEng).indexOf(ps.engs);
        var r2 = ps.gb == 1 ? bookGB : book;
        ps.chineses = r2[r1];
    }

    var getFullAjaxUrl = function (func, ps, idx) {
        var ret = fhl.urlJSON + func + ".php?";
        if (fhl.urlJSON === undefined) {
            ret = '/json/' + func + '.php?';
        }
        for (var i = 0; i < urlParams[func].length; i++) {
            var paramKey = paramArr[urlParams[func][i]];
            if (paramKey == "version") {
                ret += paramKey;
                ret += "=";
                ret += encodeURIComponent(ps[paramKey][idx]);
                ret += "&";
            } else {
                ret += paramKey;
                ret += "=";
                ret += encodeURIComponent(ps[paramKey]);
                ret += "&";
            }
        };

        ret = ret.substring(0, ret.length - 1);
        //console.log(ret); //https://bkbible.fhl.net/json/qp.php?engs=Rom&chap=16&sec=27&gb=0
        return ret;
    };

    return getFullAjaxUrl(func, ps, idx);
}
