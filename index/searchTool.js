
(function (root) {
    root.searchTool = {
        init: function (ps, dom) {
            this.dom = dom;
            this.render(ps, this.dom);
        },
        registerEvents: function (ps) {
            var that = this;

            var $searchTrigger = $('[data-ic-class="search-trigger"]'),
                $searchInput = $('[data-ic-class="search-input"]'),
                $searchClear = $('[data-ic-class="search-clear"]');

            // 放大鏡，按下之後，事件。
            $searchTrigger.click(function () {
                var $this = $('[data-ic-class="search-trigger"]');

                // 2021-07 修改 by snow
                // 1. 展開 (按下放大鏡) 2. 開始搜尋 3. 縮起 (若沒有文字時)
                if ($this.hasClass('active') == false) {
                    $this.addClass('active');
                    $searchInput.focus();
                } else {
                    if ($searchInput.val().length > 0) {
                        $('.searchBtn').click()
                    } else {
                        // 不要隱藏，會防礙輸入 (滑鼠點過去，就縮起來)
                        // $this.removeClass('active');
                    }
                }

            });

            $searchInput.blur(function () {
                if ($searchInput.val().length > 0) {
                    return false;
                } else {
                    // 2021-07 mark by snow, 下面1行，滑鼠離開後，不要隱藏起來，保持著。(道仁提出)
                    // $searchTrigger.removeClass('active');
                }
            });

            $searchClear.click(function () {
                $searchInput.val('');
            });

            $searchInput.focus(function () {
                $searchTrigger.addClass('active');
            });

            $('.searchBtn').click(function () {
                //ps.leftBtmWinShow = true;
                triggerGoEventWhenPageStateAddressChange(ps);
                fhlMidBottomWindow.render(ps);
                //doSearch($('.searchBox').val(),"search",0);
                doSearch($('.searchBox').val(), ps);
                $searchInput.val('');
                // 2021-07 mark by snow, 下面2行，搜尋後，不要隱藏起來，保持著。(道仁提出)
                // $searchInput.blur();
                // $searchTrigger.removeClass('active');
                if (!$('#fhlMidBottomWindowControl').hasClass('selected')) {
                    $('#fhlMidBottomWindowControl').trigger("click");
                }
            });
        },
        render: function (ps, dom) {
            var html = "";/*&#x1f50d;*/
            html += ' <div class="wrapper">\
                      <div class="icon-search-container active" data-ic-class="search-trigger">\
                        <span class="search"><i class="fa fa-search fa-fw"></i></span>\
                        <input type="text" class="searchBox search-input" data-ic-class="search-input" placeholder="Search" on/>\
                        <span class="times-circle" data-ic-class="search-clear">×</span>\
                      </div>\
                      <span class="searchBtn">快速搜尋</span>\
                    </div>'
            dom.html(html);
        }
    };

})(this)

