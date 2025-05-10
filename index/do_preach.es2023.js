
export function do_preach(ps, dom) {
    var rRender_Preach;
    var r_Preach;

    var dom2 = document.getElementById("fhlInfoContent");
    if (dom2 != null) {
        r_Preach = React.createElement(preach_api.R.frame, {
            "engs": ps.engs,
            "chap": ps.chap,
            "sec": ps.sec,
            "onset": onset_Preach,
            "isgb": ps.gb
        });
        rRender_Preach = React.render(r_Preach, dom2);
    }
    return;
    function onset_Preach(engs, chap, sec) {
        rRender_Preach.setProps({ "engs": engs, "chap": chap, "sec": sec });
    }
}
