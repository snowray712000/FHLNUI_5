// TODO: 還沒完整重構
import { isRDLocation } from './isRDLocation.es2023.js';
import { TPPageState } from './TPPageState.es2023.js';
import { BibleConstantHelper } from './BibleConstantHelper.es2023.js';

/**
 * @typedef {Object} DQsbParam
 * @property {string} qstr - 查詢字串（例如經文或關鍵字），必填
 * @property {'unv'|'kjv'} [ver='unv'] - 聖經版本代號，預設 'unv'
 * @property {0|1} [isGb=0] - 是否使用簡體（0 = 否, 1 = 是），依 PageState 的 gb
 * @property {0|1} [isSn=0] - 是否包含 Strong 編號（0 = 否, 1 = 是），預設 1，若譯本不是 unv kjv rcuv，則強制為 0
 * @property {string} [bookDefault='Ro'] - 預設書卷，採用英文縮寫。依 PageState 的 bookIndex
 */

/**
 * qsb.php 取得交互參照經文
 * 
 * qstr 是唯一必填參數
 * ver 預設 'unv'； isGb 預設，依設定； isSn 預設 1，若譯本不是 unv kjv rcuv，則強制為 0； bookDefault 預設，依 ps 的 bookIndex
 * 錯誤處理會往上丟
 * @param {DQsbParam} args
 * @returns {Promise<DQsbResult>}
 */
export async function qsbAsync(args) {
    makeSureArgsValid();

    const url = cvtArgsToUrl();
    const response = await fetch(url);
    return await response.json();

    function makeSureArgsValid() {
        if (args == null) { args = {}; }

        args.ver = args.ver != null ? args.ver : 'unv';
        args.isGb = args.isGb != null ? args.isGb : TPPageState.s.gb;
        args.isSn = args.isSn != null ? args.isSn : 1;
        args.bookDefault = args.bookDefault != null ? args.bookDefault : get_default_book_engs();

        if (['unv', 'kjv', 'rcuv'].indexOf(args.ver) < 0) {
            args.isSn = 0;
        }
    }

    function cvtArgsToUrl() {
        const gb = `gb=${(args.isGb == 0 ? '0' : '1')}`;
        const ver = `version=${args.ver}`;
        const strong = `strong=${args.isSn == 1 ? '1' : '0'}`;
        const engs = `engs=${args.bookDefault}`;
        const params = `?qstr=${args.qstr}&${engs}&${strong}&${gb}&${ver}`;

        // const domain = isRDLocation() ? "https://bible.fhl.net" : ""
        const domain = isRDLocation() ? "http://127.0.0.1:5600" : ""
        const endpoint = '/json/qsb.php'
        return domain + endpoint + params;
    }
}

function get_default_book_engs() {
    const ps = TPPageState.s
    return BibleConstantHelper.getBookNameArrayEnglishNormal()[ps.bookIndex - 1]
}