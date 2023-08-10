/// <reference path="../jsdoc/linq.d.ts" />
/// <reference path="../ijnjs/ijnjs.d.ts" />
/// <reference path="../jsdoc/jquery.js" />
/// <reference path="../jsdoc/jquery-ui.js" />
/// <reference path="../jsdoc/jquery.ui.touch-punch.js" />

(function (root) {
    root.windowAdjust = windowAdjust
})(this)
function windowAdjust() {
    if (!document.mozFullScreen && !document.webkitIsFullScreen) {
        $("#mainWindow").css({ top: "40px" });
        //$("#bookSelectPopUp").css({top: "100px"});
    }

    /* for leftWindow height */
    var height = $(window).height() - $('#fhlTopMenu').height() - 12;
    if (document.mozFullScreen || document.webkitIsFullScreen)
        height += $('#fhlTopMenu').height();
    
    // mark by snow. 2021.08 用 top bottom 決定大小了
    // $('#fhlLeftWindow').css({ height: height + 'px' });

    // mark by snow. 2021.07
    // $('#viewHistory').css({ top: $('#fhlLeftWindow').height() - $('#viewHistory').height() - 12 + 'px' });
    // $('#versionSelect').css({ height: $('#fhlLeftWindow').height() - $('#settings').height() - $('#viewHistory').height() - 36 + 'px' });
    /* for MidWindow and fhlInfo height */
    //var mainWindow = document.querySelector("#mainWindow");
    height = $(window).height() - $('#fhlTopMenu').height() - $('#fhlToolBar').height() - 36 - 1;
    if (document.mozFullScreen || document.webkitIsFullScreen)
        height += $('#fhlTopMenu').height();

    // mark by snow. 2021.08 用 top bottom 決定大小了
    // $('#fhlMidWindow').css({
    //     height: height + 'px'
    // });
    // mark by snow. 2021.08 用 top bottom 決定大小了
    // $('#fhlInfo').css({
    //     height: height + 'px'
    // });

    /* for MidBottomWindow height */
    var fhlMidBottomWindow$ = $("#fhlMidBottomWindow")
    var lecMain$ = $('#lecMain')
    var isVisiblefhlMidBottomWindowControl = $("#fhlMidBottomWindowControl").hasClass('selected')
    if (isVisiblefhlMidBottomWindowControl)
        height -= ($("#fhlMidBottomWindow").height() + 12);

    // $('#fhlLecture').css({
    //     height: height + 'px'
    // });


    // add by snow. 2021.08
    // $('#fhlMidBottomWindow').css({ 'top': height + 12 + 'px' });
    // if ( isVisiblefhlMidBottomWindowControl ){
    //     if ( fhlMidBottomWindow$.is(':hide') ){
    //         fhlMidBottomWindow$.show()
    //         console.log(lecMain$.offset().top)
    //     }
    // } else {
    //     if ( fhlMidBottomWindow$.is(':visible') ){
    //         fhlMidBottomWindow$.hide()
    //     }
    // }

    /* for fhlMidWinow width */
    var width = $(window).width() - 24;

    if ($("#fhlLeftWindowControl").hasClass('selected'))
        width -= ($("#fhlLeftWindow").width() + 12);

    if ($('#fhlInfoWindowControl').hasClass('selected'))
        width -= ($("#fhlInfo").width() + 12);

    // mark by snow. 2021.08 別的地方算好了
    // $("#fhlMidWindow").css({
    //     'width': width + 'px'
    // });


    /* for fhlInfo width */
    // mark by snow. 2021.08 別的地方算好了
    // var fhlInfoLeft = 10;
    // if ($('#fhlInfoWindowControl').hasClass('selected')) {
    //     $('#fhlInfo').css({
    //         'left': $(window).width() - $('#fhlInfo').width() - 12 + 'px'
    //     });
    // }
    // else {
    //     $('#fhlInfo').css({
    //         'left': $(window).width() + 15 + 'px'
    //     });
    // }

    /*  */
    $('#lecMain').scrollTop($('#lecMain').scrollTop() + $('#lecMain').find('.lec.selected').position().top - 80);
}
