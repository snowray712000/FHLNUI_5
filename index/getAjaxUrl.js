(root => {
    root.getAjaxUrl = getAjaxUrl
    root.dev_stwcbhdic = dev_stwcbhdic
    root.dev_sbdag = dev_sbdag
    root.isLocalHost = isLocalHost
})(this)

function getAjaxUrl(func, ps, idx) {
    var paramArr = ["engs", "chineses", "chap", "sec", "version",
        "strong", "gb", "book", "N", "k"];
    var urlParams = {
        sc: [0, 2, 3, 6, 7], // sc
        qb: [1, 2, 4, 5, 6], // qb: query bible
        qp: [0, 2, 3, 6], // qp: query parsing
        sd: [6, 8, 9], // cbol 字典 
        sbdag: [6, 8, 9], // 字典，浸宣，新約
        stwcbhdic: [6, 8, 9], // 字典，浸宣，舊約
    };

    if (isLocalHost() && func in ['sbdag','stwcbhdic']) {
        // api 限制，本地端測試時，回傳假資料
        func = "sd"
    }

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

        if (func == 'qb') {
            // 一定加上 strong=1 2025/2/11
            ret = ret.replace('strong=0', 'strong=1');
        }

        console.log(ret); //https://bkbible.fhl.net/json/qp.php?engs=Rom&chap=16&sec=27&gb=0
        return ret;
    };

    return getFullAjaxUrl(func, ps, idx);
}

function isLocalHost(){
    return document.location.hostname === '127.0.0.1' || document.location.hostname === 'localhost';
}
function dev_sbdag(){
    dic_text = get_dic_text().replace(/\r/g, `\\r`).replace(/\n/g,`\\n`).replace(/\"/g,`\\"`)
    return `{
        "status":"success",
        "record_count":1,
        "record":[{"sn":"00011","dic_text":"${dic_text}"}]
        }`

    function get_dic_text(){
        return `\u1f08\u03b2\u03c1\u03b1\u1f71\u03bc, \u1f41 \u4eba\u540d\u3000\u7121\u8b8a\u683c\r\n\uff08\u05d0\u05b7\u05d1\u05b0\u05e8\u05b8\u05d4\u05b8\u05dd H85\u300c<span class=\"exp\">\u591a\u4eba\u4e4b\u7236<\/span>\u300d\uff09\u300c<span class=\"exp\">\u4e9e\u4f2f\u62c9\u7f55<\/span>\u300d\u3002\u51fa\u73fe\u65bc\u8036\u7a4c\u7684\u5bb6\u8b5c\u4e2d\uff0c#\u592a1:1,2,17;\u8def3:34|\u3002\u662f\u4ee5\u8272\u5217\u6c11\u65cf\u7684\u7236\uff0c\u4ea6\u70ba\u57fa\u7763\u5f92\u9019\u771f\u4ee5\u8272\u5217\u4eba\u7684\u7236\uff0c#\u592a3:9;\u8def1:73;3:8;\u7d048:39,53,56;\u5f927:2;\u7f854:1;\u96c52:21|\u3002\u56e0\u6b64\uff0c\u4ee5\u8272\u5217\u767e\u59d3\u7a31\u70ba\u4e9e\u4f2f\u62c9\u7f55\u7684\u5f8c\u88d4\uff0c#\u7d048:33,37;\u7f859:7;11:1;\u6797\u5f8c11:22;\u52a03:29;\u4f862:16|\u3002\u662f\u5f97\u8499\u61c9\u8a31\u8005\uff0c#\u5f923:25;7:17;\u7f854:13;\u52a03:8,14,16,18;\u4f866:13|\u3002\u6eff\u6709\u4fe1\u5fc3\uff0c#\u7f854:3|\uff08#\u527515:6|\uff09#\u7f854:9,12,16;\u52a03:6|\uff08#\u527515:6|\uff09,#\u52a03:9;\u96c52:23|\u3002\u6b64\u8655\u4e26\u7a31\u4e4b\u70ba\u795e\u7684\u670b\u53cb\uff08\u53c3#\u8cfd41:8;\u4ee3\u4e0b20:7;\u4f463:35|;\u53c3#\u51fa33:11|\uff09;\u5728\u4f86\u4e16\u5177\u6709\u986f\u8d6b\u5730\u4f4d\uff0c#\u8def16:22|\u4ee5\u4e0b\uff08\u898b \u03ba\u1f79\u03bb\u03c0\u03bf\u03c2 G2859\u4e00\uff09\uff0c\u4ee5\u6492\u3001\u96c5\u5404\u548c\u773e\u5148\u77e5\u4ea6\u540c\uff0c#\u8def13:28|\u3002\u795e\u88ab\u63cf\u8ff0\u70ba\u4e9e\u4f2f\u62c9\u7f55\u3001\u4ee5\u6492\u3001\u96c5\u5404\u7684\u795e\uff08#\u51fa3:6|\uff09#\u592a22:32;\u53ef12:26;\u8def20:37;\u5f923:13;7:32|\u3002\u4ed6\u8207\u4ee5\u6492\u3001\u96c5\u5404\u4e00\u540c\u5728\u795e\u570b\u4e2d\u5750\u5e2d\uff0c#\u592a8:11|\u3002`
    }
}
function dev_stwcbhdic(){
    // 將字串中的特殊字符進行轉義

    dic_text = get_dic_text().replace(/\r/g, `\\r`).replace(/\n/g,`\\n`).replace(/\"/g,`\\"`)

    return `{
"status":"success",
"record_count":1,
"record":[{"sn":"07225","dic_text":"${dic_text}"}]
}`

    function get_dic_text(){ 
        // return `\uff1e\r<div class=\"idt\">\u55ae`
        return `\u30107225\u3011\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea\r\uff1c\u97f3\u8b6f\uff1e re'shiyth \r\uff1c\u8a5e\u985e\uff1e \u540d\u3001\u9670 \r\uff1c\u5b57\u7fa9\uff1e \u8d77\u521d\u3001\u982d\u4e00\u500b\u3001\u521d\u719f\u7684\u679c\u5b50 \r\uff1c\u5b57\u6e90\uff1e \u4f86\u6e90\u540cHB7218 \r\uff1c\u795e\u51fa\uff1e 2097e #\u52751:1|\r\uff1c\u8b6f\u8a5e\uff1e \u521d\u719f\u768410 \u99965 \u8d77\u982d4 \u8d77\u521d3 \u9996\u51483 \u521d2 \u521d\u719f\u4e4b\u72692 \u958b\u7aef2 \u4e00\u5927\u534a1 \u4e0a\u7b49\u76841 \u5148\u524d1 \u521d\u719f1 \u521d\u719f\u4e4b1 \u521d\u719f\u7684\u679c\u5b501 \u5f37\u58ef1 \u6700\u597d\u76841 \u70ba\u9996\u76841 \u751f1 \u7f8e\u597d\u76841 \u8d771 \u982d\u4e00\u6bb51 \u982d\u751f1 \u982d\u751f\u76841 \u6625\u5b631 (47) \r\uff1c\u89e3\u91cb\uff1e\r<div class=\"idt\">\u55ae\u9670\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea#\u753333:21|\uff1b\u55ae\u9670\u9644\u5c6c\u5f62\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea#\u527510:10|\uff1b\u05e8\u05b5\u05e9\u05c1\u05b4\u05d9\u05ea#\u753311:12|\u3002\u55ae\u96703\u55ae\u967d\u8a5e\u5c3e\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea\u05d5\u05b9#\u50b37:8|\uff1b\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05ea\u05d5\u05b9#\u4f2f42:12|\u3002\u55ae\u96703\u55ae\u9670\u8a5e\u5c3e\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea\u05b8\u05d4\u05bc#\u4f559:10|\u3002\u55ae\u96703\u8907\u967d\u8a5e\u5c3e\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea\u05b8\u05dd#\u6c1118:12|\u3002\u55ae\u96702\u55ae\u967d\u8a5e\u5c3e\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea\u05b0\u05da\u05b8#\u4f2f8:7|\u3002<\/div>\r<div class=\"idt\">1. <span class=\"exp\">\u8d77\u521d<\/span>\u3002<span class=\"bibtext\">\u570b\u7684<span class=\"exp\">\u8d77\u982d<\/span><\/span>\uff0c#\u527510:10|\uff1b<span class=\"bibtext\">\u6b72<span class=\"exp\">\u9996<\/span>\u5230\u5e74\u7d42<\/span>\uff0c#\u753311:12|\uff1b\u5373\u4f4d\u4e4b<span class=\"exp\">\u521d<\/span>\uff0c#\u803626:1;27:1;28:1;49:34|\uff1b<span class=\"bibtext\"><span class=\"exp\">\u8d77\u521d<\/span>\u6307\u660e\u672b\u5f8c\u7684\u4e8b<\/span>\uff0c#\u8cfd46:10|\uff1b<span class=\"bibtext\">\u4e8b\u60c5\u7684<span class=\"exp\">\u8d77\u982d<\/span><\/span>\uff0c#\u50b37:8|\uff1b<span class=\"bibtext\">\u7531<span class=\"exp\">\u4f60<\/span>\u800c\u8d77<\/span>\uff0c#\u5f4c1:13|\uff1b<span class=\"bibtext\">\u5206\u722d\u7684<span class=\"exp\">\u8d77\u982d<\/span><\/span>\uff0c#\u7bb417:14|\uff1b<span class=\"bibtext\">\u667a\u6167\u7684<span class=\"exp\">\u958b\u7aef<\/span><\/span>\uff0c#\u8a69111:10|\uff1b<span class=\"bibtext\">\u77e5\u8b58\u7684<span class=\"exp\">\u958b\u7aef<\/span><\/span>\uff0c#\u7bb41:7|\uff1b<span class=\"bibtext\"><span class=\"exp\">\u8d77\u521d<\/span>\u96d6\u7136\u5fae\u5c0f<\/span>\uff0c#\u4f2f8:7|\uff1b<span class=\"bibtext\">\u6bd4<span class=\"exp\">\u5148\u524d<\/span>\u66f4\u591a<\/span>\uff0c#\u4f2f42:12|\uff1b<span class=\"bibtext\"><span class=\"exp\">\u8d77\u521d<\/span>\u795e\u5275\u9020<\/span>\uff0c#\u52751:1|\uff1b<span class=\"bibtext\">\u5f37\u58ef\u7684\u6642\u5019<span class=\"exp\">\u751f<\/span>\u7684<\/span>\uff0c#\u527549:3;\u753321:17|\uff1b<span class=\"exp\">\u982d\u751f\u7684<\/span>\uff0c#\u8a6978:51;105:36|\uff1b<span class=\"bibtext\">\u6240\u9020\u7684\u7269\u4e2d\u70ba<span class=\"exp\">\u9996<\/span><\/span>\uff0c#\u4f2f40:19|\uff1b<span class=\"bibtext\">\u9020\u5316\u7684<span class=\"exp\">\u8d77\u982d<\/span><\/span>\uff0c#\u7bb48:22|\uff1b\u56db\u5b63\u7684\u9996\u5b63\uff0c<span class=\"bibtext\"><span class=\"exp\">\u6625\u5b63<\/span><\/span>\uff0c#\u4f559:10|\uff1b<span class=\"bibtext\">\u8af8\u570b\u4e4b<span class=\"exp\">\u9996<\/span><\/span>\uff0c#\u6c1124:20|\u3002<\/div>\r<div class=\"idt\">2. <span class=\"exp\">\u9996\u5148<\/span>\u3002\u521d\u719f\u4e4b\u7269\uff0c#\u51fa23:19;34:26;\u753326:2,10;\u7d5044:30|\u3002\u838a\u7a3c\uff0c#\u522923:10|\uff1b\u4e94\u7a40\uff0c#\u753318:4;\u4ee3\u4e0b31:5|\uff1b\u9ea5\u5b50\uff0c#\u6c1115:20,21;\u7d5044:30|\uff1b\u679c\u5b50\uff0c#\u5c3c10:37|\uff1b\u7f8a\u6bdb\uff0c#\u753318:4|\uff1b\u571f\u7522\uff0c#\u7bb43:9|\uff1b\u4ee5\u8272\u5217\u662f\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea \u05ea\u05bc\u05b0\u05d1\u05d5\u05bc\u05d0\u05b8\u05ea\u05b9\u05d4<span class=\"exp\">\u521d\u719f\u7684\u679c\u5b50<\/span>\uff0c#\u80362:3;\u52292:12;\u6c1118:12;\u5c3c12:44;\u7d5048:14|\u3002<\/div>\r<div class=\"idt\">3. <span class=\"exp\">\u9996\u9818<\/span>\u3002<span class=\"bibtext\">\u5217\u570b\u4e4b<span class=\"exp\">\u9996<\/span><\/span>\uff0c#\u64696:1|\uff1b<span class=\"bibtext\"><span class=\"exp\">\u70ba\u9996\u7684<\/span>\u6b0a\u529b<\/span>\uff0c#\u803649:35|\uff1b\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea \u05d1\u05bc\u05b0\u05e0\u05b5\u05d9 \u05e2\u05b7\u05de\u05bc\u05d5\u05b9\u05df<span class=\"bibtext\"><span class=\"exp\">\u4e00\u5927\u534a<\/span>\u4e9e\u636b\u4eba<\/span>\uff0c#\u4f4611:41|\uff1b\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea \u05de\u05b7\u05e9\u05c2\u05b0\u05d0\u05d5\u05b9\u05ea\u05b5\u05d9\u05db\u05b6\u05dd<span class=\"bibtext\"><span class=\"exp\">\u521d\u719f\u7684<\/span>\u571f\u7522<\/span>\uff0c#\u7d5020:40|\uff1b<span class=\"bibtext\"><span class=\"exp\">\u4e0a\u7b49\u7684<\/span>\u6cb9<\/span>\uff0c#\u64696:6|\uff1d\u4e0a\u597d\u7684\u90e8\u4efd\uff0c<span class=\"bibtext\"><span class=\"exp\">\u982d\u4e00\u6bb5<\/span>\u5730<\/span>\uff0c#\u753333:21|\uff1b<span class=\"bibtext\"><span class=\"exp\">\u7f8e\u597d\u7684<\/span>\u796d\u7269<\/span>\uff0c#\u6492\u4e0a2:29|\uff1b<span class=\"bibtext\"><span class=\"exp\">\u6700\u597d\u7684<\/span>\u725b\u7f8a<\/span>\uff0c#\u6492\u4e0a15:21|\uff1b<span class=\"bibtext\">\u667a\u6167\u70ba<span class=\"exp\">\u9996<\/span><\/span>\uff0c#\u7bb44:7|\u3002<\/div>
        `
    }
}