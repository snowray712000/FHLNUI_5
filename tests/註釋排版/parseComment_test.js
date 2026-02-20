/**
 * @typedef {import('../TpQUnit.js').TpQUnit} TpQUnit
 */
const QUnit = /** @type {TpQUnit} */ (window.QUnit);

import { parseComment } from './../../index/comments/parseComment.js';

function renderNode(node, depth){
    // 通常是 array
    if ( Array.isArray(node) ) {
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            
        }
    } else {
        console.error(node);
    }
}

QUnit.module('parseComment', function () {

    QUnit.test('parseComment_main', assert => {

        const com_text = `壹、導言─道成肉身的顯明 1:1-2:11 
  一、序言（ 1:1-18 ）
    （一）太初有道、道就是神（道與神同在）。 1:1-2 
          ●「太初」：SG 746，「開始」、「起源」。七十士譯本用此字來翻
                      譯 創 1:1 的「起初」SH 7225。`

        const tree = parseComment(com_text);
        console.log(tree);
        
        // const html1 = renderCommentBasic(tree)
        // console.log(html1);

        const html2 = renderNode(tree, 0)
        console.log(html2);
        

        assert.ok(true)
    });

});

