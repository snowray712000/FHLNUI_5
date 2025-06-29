// /// <reference path="../libs/jsdoc/linq.d.ts" />
// /// <reference path="../libs/ijnjs/ijnjs.d.ts" />
// /// <reference path="../libs/jsdoc/jquery.js" />
// /// <reference path="../libs/jsdoc/jquery-ui.js" />

/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/ijnjs/ijnjs.d.ts" />
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/jquery-ui.js" />

import { Settings } from "./Settings.es2023.js";
import { ViewHistory } from "./ViewHistory.es2023.js";
import { LeftWindowTool } from "./LeftWindowTool.es2023.js";
import { FhlLecture } from "./FhlLecture.es2023.js";
import { triggerGoEventWhenPageStateAddressChange } from "./triggerGoEventWhenPageStateAddressChange.es2023.js";
import { TPPageState } from './TPPageState.es2023.js';
import { gbText } from './gbText.es2023.js';

export class FhlLeftWindow {
    static #s = null
    /** @returns {FhlLeftWindow} */
    static get s() { if (this.#s == null) this.#s = new FhlLeftWindow(); return this.#s; }

    init(ps) {
        if (ps == null) ps = TPPageState.s

        Settings.s.init(ps, $('#settings'));
        Settings.s.registerEvents(ps);

        ViewHistory.s.init(ps, $('#viewHistory'));
        initialVersionDialogAsync()

        this.registerEvents();
        return // init
        function initialVersionDialogAsync() {
            $('#versionSelect').hide()  // 不再使用，但又不知道它從哪初始
            return new Promise(res => {
                setTimeout(() => {
                    // 如果沒用 timeout 400, 來 hide, 只會 hide 一個
                    // 也就是我不知道它從哪時建立起來的. 
                    $('.ui-resizable-handle.ui-resizable-s').hide()
                    $('#versionSelect').hide()

                    // 初始化
                    renderVersionSelect2()
                    renderVersionSelect3()

                    initSetVersionDialogAsync()
                    LeftWindowTool.s.closeSettings()
                    res()
                }, 300);
            })
            function renderVersionSelect3() {
                $('<span>', {
                    id: 'versionSelect3',
                }).append($('<i class="bi-layout-three-columns"></i>'))
                    .prependTo($('#windowControlButtons'))
            }
            function renderVersionSelect2() {
                // <div id=versionSelect2><p>聖經版本選擇</</           
                var r1 = $('<div>', {
                    id: 'versionSelect2',
                }).append($('<p/>', {
                    text: gbText('聖經版本選擇', ps.gb)
                }))
                $('#settings').before(r1)
            }
            function initSetVersionDialogAsync() {
                var aa = {}

                testThenDoAsync({
                    cbTest: () => Ijnjs.BibieVersionDialog != undefined,
                    msg: '初始 Dialog 聖經版本選擇'
                }).then(() => {
                    {
                        var s = Ijnjs.BibieVersionDialog.s
                        s.setCallbackClosed(jo => {
                            const pageState = TPPageState.s

                            aa = jo
                            var vers = jo.selects
                            pageState.versionOffens = jo.offens
                            pageState.versionSets = jo.sets

                            if (vers.length == 0) {
                                return // 不作事
                            }

                            /** @type {string[]} */
                            var r1 = pageState.version
                            var isChanged = vers.length != r1.length ||
                                Enumerable.range(0, r1.length).any(i => r1[i] != vers[i]) // 順序交換，也是改變

                            if (isChanged) {
                                pageState.version = vers
                                // pageState.cname = [] // 原本也有設 cname,  (好像沒有也沒關係, 注解先保留著好了)
                                triggerGoEventWhenPageStateAddressChange(pageState)
                                FhlLecture.s.render(pageState)
                            }
                            pageState.saveToLocalStorage()
                            
                        })
                        s.setCallbackOpened(() => { })

                        testThenDoAsync(() => window.abvphp != null && window.abvphp.isReadyGlobalBibleVersions())
                            .then(() => {
                                s.setVersionsFromApi(getAbvResult())
                                function getAbvResult() {
                                
                                    var r1 = TPPageState.s.gb == 1 ? abvphp.g_bibleversionsGb : abvphp.g_bibleversions
                                    var r2 = Enumerable.from(r1).select(a1 => ({ 'na': a1.value.book, 'cna': a1.key })).toArray()
                                    return r2
                                }
                            })



                        $('#versionSelect2').on('click', open)
                        $('#versionSelect3').on('click', open)

                        return
                        function open() {
                            Ijnjs.BibieVersionDialog.s.open({
                                selects: TPPageState.s.version,
                                offens: TPPageState.s.versionOffens,
                                sets: TPPageState.s.versionSets,
                            })

                        }
                    }
                })
            }
        }
    }
    registerEvents() {
        $('#fhlLeftWindow').resizable({
            handles: 'e',
            maxWidth: 300,
            // minWidth: 170,
            resize: function (event, ui) {
                var currentWidth = ui.size.width;

                TPPageState.s.cxLeftWindow = currentWidth // add by snow. 2021.07
                TPPageState.s.saveToLocalStorage()

                var fhlMidWindowWidth;
                if ($('#fhlInfoWindowControl').hasClass('selected'))
                    fhlMidWindowWidth = $(window).width() - $("#fhlInfo").width() - currentWidth;
                else
                    fhlMidWindowWidth = $(window).width() - currentWidth + 12;

                $("#fhlMidWindow").css({
                    'width': fhlMidWindowWidth - 12 * 4 + 'px',
                    'left': currentWidth + 12 + 12 + 'px'
                });

                // add by snow. 2021.08
                // toolbar 已經移到最上面，不需要再因 left 改變，而改變 toolbar 的 left 了
                // $('#fhlToolBar').css({
                //     //'width': $(window).width()-$("#fhlLeftWindow").width()-36+'px',
                //     'left': currentWidth + 12 + 12 + 'px',
                //     'right': '12px'
                // });

                // snow add 2016-07
                FhlLecture.s.reshape(TPPageState.s);
            }
        });
        $('.ui-resizable-handle.ui-resizable-e').html('<span>☰</span>');
    }
}