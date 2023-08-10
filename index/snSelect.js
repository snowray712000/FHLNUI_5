var snSelect = {
    init: function (ps, dom) {
        this.dom = dom;
        this.render(ps, this.dom);
    },
    registerEvents: function (ps) {
        $('#snOnOffSwitch').change(
            function () {
                if ($(this).is(':checked')) {
                    ps.strong = 1;
                    pageState.strong = 1
                    fhlLecture.render(ps, fhlLecture.dom);
                }
                else {
                    ps.strong = 0;
                    pageState.strong = 0
                    fhlLecture.render(ps, fhlLecture.dom);
                }
                triggerGoEventWhenPageStateAddressChange(ps);
                updateLocalStorage()
            });
    },
    render: function (ps, dom) {
        var html = "<div>" + gbText("原文編號", ps.gb) + ":</div>";
        html += '<div class="onOffSwitch">\
                              <input type="checkbox" name="snOnOffSwitch" class="onOffSwitch-checkbox" id="snOnOffSwitch">\
                              <label class="onOffSwitch-label" for="snOnOffSwitch">\
                                  <span class="onOffSwitch-inner"></span>\
                                  <span class="onOffSwitch-switch"></span>\
                              </label>\
                          </div>';
        dom.html(html);
        $('#snOnOffSwitch').attr("checked", (ps.strong == 1) ? true : false);
    }
};

(function(root){
    root.snSelect = snSelect
})(this)