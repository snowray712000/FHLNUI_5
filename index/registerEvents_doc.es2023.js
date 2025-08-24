
import { TPPageState } from "./TPPageState.es2023.js";
import { getBookFunc } from "./getBookFunc.es2023.js";
import { BookSelectChapter } from "./BookSelectChapter.es2023.js";

/**
 * @param {TPPageState} ps 
 */
export function registerEvents_doc(ps) {
    /* scrolling register */
    /*setTimeout(function() {
        $('div').scroll(function() {
            $(this).addClass('scrolling');
            clearTimeout( $.data( this, "scrollCheck" ) );
            $.data( this, "scrollCheck", setTimeout(function() {
                $('div').removeClass('scrolling');
            }, 350) );
        });
    }, 2000);*/ //等到其他function 跑完 (backup 用)
    /*shortcut register*/
    // 快速鍵
    $(document).on('keyup', 
        /**
         * @param {Event} e 
         */
        function (e) {
        if (e.altKey && e.shiftKey) {
            var maps = {
                'KeyS': () => {
                    assert( ps?.bookIndex != null )
                    const book = ps?.bookIndex
                    var position = $('#bookSelect').position();
                    position.left = '40%'; //$('#bookSelect').position().left;
                    position.top = '20%'; //$('#bookSelect').position().top+$('#bookSelect').height()+10;
                    
                    BookSelectChapter.s.init(ps, $('#bookSelectChapter'), book, position);
                    BookSelectChapter.s.registerEvents(ps);
                    //isBookSelectChapterPopUp=true;
                    //bookselectchapter.dom.hide();
                    BookSelectChapter.s.dom.show();
                    //alert(pageState.chineses);
                },
                'KeyF': () => {
                    $('[data-ic-class="search-trigger"]').trigger("click");
                    setTimeout(function () { $('[data-ic-class="search-clear"]').trigger("click"); }, 1);
                }, // 
                'Slash': () => $('#help').trigger("click"), // 反斜線 /
                'KeyC': () => $('#fhlInfoWindowControl').trigger('click'), // 
                'KeyZ': () => $('#fhlLeftWindowControl').trigger('click'), // 
                'KeyX': () => $('#fhlMidBottomWindowControl').trigger('click'), // 
                'KeyL': () => $('#fullscreenControl').trigger('click'), // 全螢幕
            }
            if (maps[e.code] != undefined) {
                maps[e.code]()
            }
            // console.log(e.code);
        }
    })
    
    // $(document).bind('keydown', 'esc', function () {
    //     $('#helpingPopUp').css({
    //         'visibility': 'hidden',
    //         'opacity': '0'
    //     });
    // });            
    // $(document).bind('keydown', 'ctrl+c', function () {
    //     var copyTextarea = document.querySelector('#test');
    //     //copyTextarea.style.backgroundColor = "red";
    //     copyTextarea.select();
    // });

    /*in search input*/
    $('[data-ic-class="search-input"]').on('keydown', 'alt+shift+f', function () {
        console.log(64);
        $('[data-ic-class="search-trigger"]').trigger("click");
        setTimeout(function () { $('[data-ic-class="search-clear"]').trigger("click"); }, 1);
    });
    $('[data-ic-class="search-input"]').on('keydown', 'esc', function () {
        console.log(69);
        $('[data-ic-class="search-input"]').val('');
        $('[data-ic-class="search-trigger"]').removeClass('active');
    });
    $('[data-ic-class="search-input"]').on('keydown', 'return', function () {
        console.log(74);
        $('.searchBtn').trigger("click");
    });
}

// (root => {
//     root.registerEvents = registerEvents
// })(this)