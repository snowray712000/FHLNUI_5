/// <reference path="../jsdoc/jquery.js" />
/// <reference path="../jsdoc/loadash.js" />
/// <reference path="../jsdoc/jquery-ui.js" />
/// <reference path="../ijnjs/ijnjs.d.js" />
/// <reference path="DPageState.d.js" />
var fhlMidBottomWindow = {
    dom$: $(),
    init: function (ps, dom$) {
        // 此處，每搜尋一次，只會呼叫一次
        this.dom$ = dom$;
        this.render(ps, dom$);
        this.registerEvents(ps);
    },
    updateMaxHeightOfResizableAndOfDom: function () {
        var mainWindow$ = $('#mainWindow')
        var fhlMidWindow$ = $('#fhlMidWindow')
        var fhlLecture$ = fhlMidWindow$.find('#fhlLecture')
        var lecMainTitle$ = fhlLecture$.find('#lecMainTitle')
        var fhlMidBottomWindow$ = fhlMidWindow$.find('#fhlMidBottomWindow')
        var limitHeight = mainWindow$.height() - (lecMainTitle$.height() + lecMainTitle$.offset().top)
        setTimeout(() => {
            fhlMidBottomWindow$.resizable("option", "maxHeight", limitHeight)
            fhlMidBottomWindow$.css('max-height', limitHeight + 'px')
        }, 0);
    },
    updateBottomOfLecture: function () {
        var fhlMidWindow$ = $('#fhlMidWindow')
        var fhlLecture$ = fhlMidWindow$.find('#fhlLecture')
        var fhlMidBottomWindow$ = fhlMidWindow$.find('#fhlMidBottomWindow')
        var isShow = $('#fhlMidBottomWindowControl').hasClass('selected')
        if (isShow == false) {
            fhlLecture$.css('bottom', '0')
            fhlLecture$.css('height', '')
        } else {
            fhlLecture$.css('bottom', fhlMidBottomWindow$.height() + 'px')
            fhlLecture$.css('height', '')
        }
    },
    registerEvents: function (ps) {
        var that = this
        var fhlMidBottomWindow$ = $('#fhlMidBottomWindow')
        var pre_search$ = fhlMidBottomWindow$.find('#pre_search')

        fhlMidBottomWindow$.resizable({
            handles: 'n',
            resize: _.debounce(function (event, ui) {
                that.updateMaxHeightOfResizableAndOfDom()
                that.updateBottomOfLecture()
            }, 200)
        });


    },
    /**
     * @param {DPageState} ps 
     * @param {JQuery<HTMLElement>} dom$ $('#fhlMidBottomWindow') 
     */
    render: function (ps, dom$) {
        dom$ = dom$ == undefined ? this.dom$ : dom$

        // 此處，每搜尋一次，都會呼叫一次
        if (dom$.find('#pre_search2').length == 0) {
            // 裡面那層，會被清空，有兩層才能維持 resizable 
            var pre_search$ = $('<div id="pre_search2"><div id="pre_search"></div></div>')
            var div_search_result$ = $('<div id="search_result2"><div id="search_result"></div></div>')
            var fhlMidBottomWindowContent$ = dom$.find('#fhlMidBottomWindowContent')

            fhlMidBottomWindowContent$.empty()
            pre_search$.appendTo(fhlMidBottomWindowContent$)
            div_search_result$.appendTo(fhlMidBottomWindowContent$)
            dom$.height($(window).height() * 0.33) // 雖然用 mainWindow 的 1/2 較合理，但起始的 mainWindow 是過高的，要 200ms 左右才是正確值

            pre_search$.resizable({
                handles: 'e',
                resize: _.debounce((event,ui)=>{
                    var cx = pre_search$.width()
                    div_search_result$.children().css("left",cx)
                },200)
            })
        }
    }
};

(function (root) {
    root.fhlMidBottomWindow = fhlMidBottomWindow
})(this)