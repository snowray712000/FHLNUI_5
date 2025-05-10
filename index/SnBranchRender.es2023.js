import { isRDLocation } from './isRDLocation.es2023.js'

export class SnBranchRender {
    static #s = null
    /** @returns {SnBranchRender} */
    static get s() {
        if (this.#s === null) {
            this.#s = new SnBranchRender();
        }
        return this.#s;
    }

    constructor() {
        this.book = 45; // 目前不會被變動
        this.chap = 0;
        this.isTitleChangeBack = false;

        $(document).on('InfoTitleChanged', (event, data) => {
            if (data.titleId === "fhlSnBranch") {
                this.isTitleChangeBack = true;
            }
        });
    }

    render(ps) {
        const dom2 = document.getElementById("fhlInfoContent");
        if (ps.bookIndex !== 45) {
            if (dom2) {
                dom2.innerHTML = "<p>尚未取得版權</p>";
            }
            return;
        }
        if (this.chap === ps.chap && this.book === ps.bookIndex && this.isTitleChangeBack === false) {
            // 目前還沒有直接切換到對應頁面，所以沒有切換
            // 這個保護會在從別的功能切回來時防止 render 生效
            return;
        }
        if (dom2) {
            this.book = ps.bookIndex;
            this.chap = ps.chap;
            this.isTitleChangeBack = false;

            const generateUrlSnTree = (chap) => {
                // 目前只購買了羅馬書，45，其它都沒有
                const chapStr = chap.toString().padStart(3, '0'); // 例如：016
                const baseUrl = isRDLocation() ? 'https://bible.fhl.net' : '';
                return [
                    `${baseUrl}/tree/45/45_${chapStr}.pdf`,
                    `${baseUrl}/tree/45/45_${chapStr}e.pdf`
                ];
            };

            const generatePdfHtml = (url) => {
                // 例如： "https://bible.fhl.net/tree/45/45_016.pdf"
                return `<object data="${url}" type="application/pdf" width="100%" height="48%">
<p>抱歉，您的瀏覽器不支持顯示 PDF。您可以下載文件：<a href="${url}">下載 PDF</a></p>
</object>`;
            };

            const urls = generateUrlSnTree(this.chap);
            dom2.innerHTML = generatePdfHtml(urls[0]) + generatePdfHtml(urls[1]);
        }
    }
}