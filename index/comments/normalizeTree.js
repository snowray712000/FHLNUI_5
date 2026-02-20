let __idCounter = 0;

function genId() {
    __idCounter++;
    return 'n' + __idCounter;
}
/**
 * 將 token tree 轉換為附帶唯一 id、文字、類型與子節點的結構，並為帶有 marker 或表格的節點補 metadata。
 * @param {Array<{token?:object,text?:string,children?:Array}>} tree
 * @returns {Array<{id:string,w:string,type:string,marker?:string,children:Array,meta?:object}>}
 */
export function normalizeTree(tree) {

    // 每次 normalize 都重置，讓同一份輸入得到穩定 id（較利於測試/比對）
    __idCounter = 0;

    function walk(node) {

        const t = node?.token || {};

        const doc = {
            id: genId(),
            w: node?.text ?? '',
            type: detectType(t),
            children: []
        };

        if (t.marker) {
            doc.marker = t.marker;
        }

        // 舊表格：維持原樣
        if (t.kind === 'table') {
            doc.meta = {
                format: 'raw',
                rawBlock: t.raw ?? null,
                rawLines: t.lines ?? t.raw?.lines ?? []
            };
        }

        // 新表格：joTable（標準 JSON）
        if (t.kind === 'joTable') {
            doc.meta = {
                format: 'joTable',
                joTable: t.joTable ?? null
            };
        }

        if (node?.children?.length) {
            doc.children = node.children.map(walk);
        }

        return doc;
    }

    return (tree || []).map(walk);
}

function detectType(token) {

    if (!token) return 'text';

    if (token.kind === 'note') return 'note';

    if (token.kind === 'lex') return 'lex';

    // ✅ 不管 raw table 或 joTable，DocNode.type 都是 'table'（下游最省事）
    if (token.kind === 'table') return 'table';
    if (token.kind === 'joTable') return 'joTable'; // ✅ 改這行：下游分流用

    if (token.kind === 'ordered') return 'item';

    return 'text';
}