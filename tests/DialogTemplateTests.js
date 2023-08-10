/// <reference path="../FHL.linq.js" />
/// <reference path="../FHL.tools.js" />
/// <reference path="../FHL.BibleConstant.js" />
/// <reference path="../index/DialogTemplate/ParsingReference.js" />

var NSDict = NSDict || {};
// NS: name space
// Dict: Strong number Dictionary

// data-dict: {sn,isold,level}
NSDict.addToggleAndTargetToDictQueryClick = function addToggleAndTargetToDictQueryClick(level) {
    NSDict.findPrsingTableSnClassAndLetItCanClick(level, $('#dict-table'));
};

NSDict.findPrsingTableSnClassAndLetItCanClick = function findPrsingTableSnClassAndLetItCanClick(level, container) {
    level = level === undefined ? 0 : level;
    console.log(level);

    /// <summary> 當 dict-table 建好時, 就可呼叫這個內容 </summary>
    var r1 = container.find('.parsingTableSn');
    for (const it1 of r1) {
        var r2 = $(it1);

        r2.attr('data-toggle', 'modal');
        r2.attr('data-target', '#SnDictDialog' + (level));

        var jo = {
            sn: r2.attr('k'),
            idold: parseInt(r2.attr('n')),
            level: level,
        }
        r2.attr('data-dict', JSON.stringify(jo));
    }
};

/**
 * 
 * @param {string} ref 
 * @param {number} book 
 */
function generateReferenceHtml(ref, book) {
    var r1 = FHL.ParsingReferenceToAddresses(ref, book);
    var r2 = FHL.ParsingAddressesToReferenceLink(r1);

    console.log(r2);
    
    var r3 = fromApi({ qstr: r2 });

    var r4 = '<div>' + r3.record.map(generateEachRecord).join('') + '</div>';
    return r4;
    /**
     * 
     * @param {{bible_text:string,chap:number,sec:number,chineses:string}} a1 
     */
    function generateEachRecord(a1, i1) {
        var r1 = $('<span class="one-verse"></span>');
        if (i1 % 2 === 1) {
            r1.addClass('odd')
        }

        var r2 = $('<span class="bible-text"></span>');
        r2.text(a1.bible_text);
        r1.append(r2);
        r1.append('(');

        // var r3 = $('<span class="bible-address"></span>');
        var r3 = $('<span class="reference"></span>');
        r3.attr('ref', a1.chineses + a1.chap); // 點擊看整章(上下文)
        r3.attr('book', FHL.getIdFromName(a1.chineses));
        r3.attr('chap', a1.chap);
        r3.text(a1.chineses + a1.chap + ':' + a1.sec);
        r1.append(r3);
        r1.append(')');

        var r1a = $('<span></span>');
        r1a.append(r1)
        return r1a.html();

        // <span class="one-verse odd">
        // <span class="bible-text">主人說：『不必，恐怕薅稗子，連麥子也拔出來。</span>
        // <span class="bible-address">太 13:29</span>

        // '<span class="reference" ref="' + it1.ref + '" book="' + it1.book + '" chap="' + it1.chap + '">' + it1.w + '</span>';
    }

    /**     
     * @param {{ver:string,isGb:0|1,isSn:0|1},qstr:string} args 
     * @returns {{record:{bible_text:string,chap:number,sec:number,chineses:string}[]}}
     */
    function fromApi(args) {
        args.ver = args.ver !== undefined ? args.ver : 'unv';
        args.isGb = args.isGb !== undefined ? args.ver : 0;
        args.isSn = args.isSn !== undefined ? args.isSn : 0;
        if (false === FHL.linq_contains(['unv', 'kjv'], args.ver)) {
            args.isSn = 0;
        }
        var gb = `gb=${(args.isGb === 0 ? '0' : '1')}`;
        var ver = `version=${args.ver}`;
        var strong = `strong=${args.isSn === 1 ? '1' : '0'}`;
        var url2 = `?qstr=${args.qstr}&${strong}&${gb}&${ver}`;


        var re;
        var er;
        $.ajax({
            url: (FHL.isLocalHost() ? 'http://bible.fhl.net' : '') + '/json/qsb.php' + url2,
            async: false,
            success: function(aa) {
                re = JSON.parse(aa);
            },
            error: function(aa) {
                er = aa;
            }
        });
        if (er !== undefined) {
            console.error(er + ' 當 qsb.php ' + qsb);
            return undefined;
        }
        return re;
    }

    console.log(r2);
    return '';

}