/// <reference path='./../ijnjs/DAddress.d.ts' />
/// <reference path='./../ijnjs/DQsbParam.d.ts' />

import Enumerable from '../libs/jsdoc/linq.js';
import { isRDLocationEs6Js } from '../ijnjs/isRDLocation.es6.js'

export {qsbAsyncEs6Js}
function qsbAsyncEs6Js() {
    let isRDLocation = isRDLocationEs6Js()

    return qsbAsync;
    /**
     * qsb.php 取得交互參照經文
     * @param {DQsbParam} args
     * @returns {Promise<DQsbResult>}
     */
    function qsbAsync(args) {
        makeSureArgsValid();

        return new Promise((res, rej) => {
            $.ajax({
                url: cvtArgsToUrl(),
                success: a1 => {
                    res(JSON.parse(a1));
                },
                error: er => {
                    console.error(er);
                }
            });
        });
        function makeSureArgsValid() {
            if (args == null) { args = {}; }

            args.ver = args.ver != null ? args.ver : 'unv';
            args.isGb = args.isGb != null ? args.ver : 0;
            args.isSn = args.isSn != null ? args.isSn : 0;
            args.bookDefault = args.bookDefault != null ? args.bookDefault : 'Ro';

            if (false == Enumerable.from(['unv', 'kjv']).contains(args.ver)) {
                args.isSn = 0;
            }
        }
        function cvtArgsToUrl() {
            var gb = `gb=${(args.isGb === 0 ? '0' : '1')}`;
            var ver = `version=${args.ver}`;
            var strong = `strong=${args.isSn === 1 ? '1' : '0'}`;
            const engs = `engs=${args.bookDefault}`
            var url2 = `?qstr=${args.qstr}&${engs}&${strong}&${gb}&${ver}`;
            return (isRDLocation() ? 'https://bible.fhl.net' : '') + '/json/qsb.php' + url2;
        }
    }
}
