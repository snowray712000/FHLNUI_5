/**
 * @typedef {import('./TpQUnit').TpQUnit} TpQUnit
 */

const QUnit = /** @type {TpQUnit} */ (window.QUnit);
QUnit.module('render_dtexts_test');

import {render_dtexts } from './../index/render_dtexts.js';

// <span class="reference">1 </span><span class="isTitle1">神的信實 </span><span>這樣說來，</span><span class="isName">猶太</span><span>人有什麼優越呢？割禮有什麼益處呢？</span><span class="reference">2 </span><span>在各方面都有很多。首要的，是神的話語確實委託給他們了。</span>

// ...existing code...
QUnit.test('render_dtexts 會根據 DText flag 加 class 並輸出 reference', assert => {
    const dtexts_with_addr = [
        [1, 1, 1, [
            { w: '神的信實', isTitle1: 1 },
            { w: '猶太', isName: 1 },
            { w: '人有什麼優越呢？' },
        ]]
    ];

    const html = render_dtexts(dtexts_with_addr, 'ver');
    // console.log(html); // <span class="reference">1 </span><span class="isTitle1">神的信實</span><span class="isName">猶太</span><span>人有什麼優越呢？</span>

    // 抓出 .isTitle1, 內容會是 '神的信實'
    const jhtml = $(html)
    assert.equal(jhtml[0].textContent, '1 ');
    assert.equal(jhtml[1].textContent, '神的信實');
    assert.equal(jhtml[1].className, 'isTitle1');
    assert.equal(jhtml[2].textContent, '猶太');
    assert.equal(jhtml[2].className, 'isName');
    assert.equal(jhtml[3].textContent, '人有什麼優越呢？');
    assert.equal(jhtml[3].className, '');    
});