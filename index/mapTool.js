var mapTool = {
    init: function (ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    },
    registerEvents: function (ps) {
        $('#mapToolOnOffSwitch').change(
            function () {
                if ($(this).is(':checked')) {
                    // checked 是指開啟圓圈移到右邊. 那就應該是 出現「ON」
                    ps.ispos = true;
                    fhlLecture.render(ps, fhlLecture.dom);
                }
                else {
                    // 出現「Off」
                    ps.ispos = false;
                    fhlLecture.render(ps, fhlLecture.dom);
                }
                triggerGoEventWhenPageStateAddressChange(ps);
            });
    },
    render: function (ps, dom) {
        var html = "<div>" + gbText("地圖顯示", ps.gb) + ":</div>";
        html += '<div class="onOffSwitch">\
                              <input type="checkbox" name="mapToolOnOffSwitch" class="onOffSwitch-checkbox" id="mapToolOnOffSwitch">\
                              <label class="onOffSwitch-label" for="mapToolOnOffSwitch">\
                                  <span class="onOffSwitch-inner"></span>\
                                  <span class="onOffSwitch-switch"></span>\
                              </label>\
                          </div>';
        //html += '<span style="color: #770000;">施工中...</span>';
        dom.html(html);
        $('#mapToolOnOffSwitch').attr("checked", ps.ispos);
    }
};


(function(root){
    root.mapTool = mapTool
})(this)