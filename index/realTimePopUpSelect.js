var realTimePopUpSelect = {
    init: function (ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    },
    registerEvents: function (ps) {
        $('#realTimeOnOffSwitch').change(
            function () {
                if ($(this).is(':checked')) {
                    ps.realTimePopUp = 1;
                    fhlLecture.render(ps, fhlLecture.dom);
                    fhlInfo.render(ps, fhlInfoContent.dom);
                }
                else {
                    ps.realTimePopUp = 0;
                    fhlLecture.render(ps, fhlLecture.dom);
                    fhlInfo.render(ps, fhlInfoContent.dom);
                }
                triggerGoEventWhenPageStateAddressChange(ps);
            });
    },
    render: function (ps, dom) {
        var html = "<div>" + gbText("即時顯示", ps.gb) + ":</div>";
        html += '<div class="onOffSwitch">\
                              <input type="checkbox" name="realTimeOnOffSwitch" class="onOffSwitch-checkbox" id="realTimeOnOffSwitch">\
                              <label class="onOffSwitch-label" for="realTimeOnOffSwitch">\
                                  <span class="onOffSwitch-inner"></span>\
                                  <span class="onOffSwitch-switch"></span>\
                              </label>\
                          </div>';
        dom.html(html);
        $('#realTimeOnOffSwitch').attr("checked", (ps.realTimePopUp == 1) ? true : false);
    }
};


(function(root){
    root.realTimePopUpSelect = realTimePopUpSelect
})(this)