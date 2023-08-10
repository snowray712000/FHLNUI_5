/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/ijnjs/ijnjs.d.js" />
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />
/// <reference path="../libs/jsdoc/jquery.ui.touch-punch.js" />

(function (root) {
  root.windowControl = {
    init: function (ps, dom) {
      this.dom = dom;
      this.render(ps, this.dom);
      this.registerEvents(ps);
    },
    registerEvents: function (ps) {
      $('#windowControlIcon').click(function (e) {
        if ($(this).hasClass('selected')) {
          var that = $(this);
          that.animate({ left: '0px' });
          $("#windowControl").animate({ width: '30px' }, function () {
            that.removeClass('selected');
          });
          $("#windowControlButtons").animate({ opacity: 0 }, 100);
        }
        else {
          var that = $(this);
          that.animate({ left: '20px' });
          $("#windowControl").animate({ width: '350px' }, function () {
            that.addClass('selected');
          });
          $("#windowControlButtons").animate({ opacity: 1 }, 800);
        }
        e.stopPropagation();
      });
      $(document).click(function () {
        if ($('#windowControlIcon').hasClass('selected')) {
          //$('#windowControlIcon').trigger( "click" );
        }
      });


      $('#fhlLeftWindowControl').click(function () {
        if ($(this).hasClass('selected')) {
          coreInfoWindowShowHide(function () {
            fhlLecture.reshape(ps);
          }, false, undefined)
        }
        else {

          coreInfoWindowShowHide(function () {
            fhlLecture.reshape(ps);
          }, true, undefined)
        }

      });
      $('#fhlMidBottomWindowControl').click(function () {
        var this$ = $(this)
        var fhlMidBottomWindow$ = $('#fhlMidBottomWindow')
        if (this$.hasClass('selected')) {
          this$.removeClass('selected');
          // var fhlMidBottomWindowHeight = fhlMidBottomWindow$.height();
          // fhlMidBottomWindow$.animate({ top: $('#fhlMidWindow').height() + 15 + 'px', bottom: -fhlMidBottomWindowHeight - 15 + 'px' });
          // $("#fhlLecture").animate({ bottom: '0px', height: $("#fhlLecture").height() + fhlMidBottomWindowHeight + 12 + 'px' }, function () {
          //   this$.removeClass('selected');
          // });
          fhlMidBottomWindow$.hide()
          fhlMidBottomWindow.updateBottomOfLecture()
        }
        else {
          this$.addClass('selected');
          fhlMidBottomWindow$.show()
          // var fhlMidBottomWindowHeight = fhlMidBottomWindow$.height();
          // fhlMidBottomWindow$.animate({ top: $('#fhlMidWindow').height() - fhlMidBottomWindowHeight + 'px', bottom: '0px' });            
          // $("#fhlLecture").animate({ bottom: fhlMidBottomWindowHeight + 'px', height: $("#fhlLecture").height() - fhlMidBottomWindowHeight - 12 + 'px' }, function () {

          // });
          fhlMidBottomWindow.updateMaxHeightOfResizableAndOfDom()
          fhlMidBottomWindow.updateBottomOfLecture()
        }
      });

      $('#fhlInfoWindowControl').click(function () {
        if ($(this).hasClass('selected')) {
          coreInfoWindowShowHide(function () {
            fhlLecture.reshape(ps);
          }, undefined, false)
        } else {
          coreInfoWindowShowHide(function () {
            fhlLecture.reshape(ps);
          }, undefined, true)
        }
      });
      $('#fullscreenControl').on('click',function(){
        if ($(this).hasClass('selected')) {
          var that = $(this);
          setTimeout(function () { that.removeClass('selected'); }, 1);
        }
        else {
          var that = $(this);
          requestFullscreen();
          setTimeout(function () { that.addClass('selected'); }, 1);
        }
      })
      
      
      $('#windowControl').click(function (e) {
        e.stopPropagation();
      });
    },
    render: function (ps, dom) {
      var html = "<i id='windowControlIcon' class='fa fa-tv fa-fw selected'></i><div id='windowControlButtons'><span id='fhlLeftWindowControl' class='selected' ><i class='fa fa-wrench fa-fw'></i></span><span id='fhlMidBottomWindowControl'><i class='fa fa-search-plus fa-fw'></i></span><span id='fhlInfoWindowControl' class='selected'><i class='fa fa-file-text-o fa-fw'></i></span><space style='margin: 0px 10px; cursor: default; color: #D0D0D0;'>|</space><span id='fullscreenControl'><i class='fa fa-arrows-alt fa-fw'></i></span></div>";
      dom.html(html);
    }
  };

})(this)