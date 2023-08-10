var imageTool = {
    init: function (ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    },
    registerEvents: function (ps) {
        $('#imageToolOnOffSwitch').change(
            function () {
                if ($(this).is(':checked')) {
                    // checked 是指開啟圓圈移到右邊. 那就應該是 出現「ON」
                    ps.ispho = true;
                    fhlLecture.render(ps, fhlLecture.dom);
                }
                else {
                    // 出現「Off」
                    ps.ispho = false;
                    fhlLecture.render(ps, fhlLecture.dom);
                }
                triggerGoEventWhenPageStateAddressChange(ps);
            });
    },
    render: function (ps, dom) {
        var html = "<div>" + gbText("圖片顯示", ps.gb) + ":</div>";
        html += '<div class="onOffSwitch">\
                              <input type="checkbox" name="imageToolOnOffSwitch" class="onOffSwitch-checkbox" id="imageToolOnOffSwitch">\
                              <label class="onOffSwitch-label" for="imageToolOnOffSwitch">\
                                  <span class="onOffSwitch-inner"></span>\
                                  <span class="onOffSwitch-switch"></span>\
                              </label>\
                          </div>';
        //html += '<span style="color: #770000;">施工中...</span>';
        dom.html(html);
        $('#imageToolOnOffSwitch').attr("checked", ps.ispho);
    }
};


(function(root){
    root.imageTool = imageTool
})(this)