// /// <reference path='../static/search_api/abvphp_api.js' />
// (function(root){
//     root.exportVersionDialogAsync = exportVersionDialogAsync
// })(this)
// function exportVersionDialogAsync() {
//     return new Promise((res, rej) => {
//         var cbDialogHide = function (vers) {
//             $('#fhlTopMenu').show()
//             $('#fhlToolBar').show()

//             var r1 = pageState.version
//             var isChanged = vers.length != r1.length || Enumerable.from(vers).any(a1 => r1.includes(a1) == false)

//             if (isChanged) {
//                 pageState.version = vers
//                 // pageState.cname = [] // 原本也有設 cname,  (好像沒有也沒關係, 注解先保留著好了)
//                 triggerGoEventWhenPageStateAddressChange(pageState);
//                 updateLocalStorage();
//                 fhlLecture.render(pageState, fhlLecture.dom);
//             }
//         }
//         var cbDialogShow = function (jq) {
//             $('#fhlTopMenu').hide()
//             $('#fhlToolBar').hide()
//         }
//         var getAbvResult = function () {                
//             var r1 = pageState.gb == 1 ? abvphp.g_bibleversionsGb : abvphp.g_bibleversions
//             var r2 = Enumerable.from(r1).select(a1 => ({ 'book': a1.value.book, 'cname': a1.key })).toArray()
//             return r2
//         }

        
//         Ijnjs.testThenDo(() => {
//             /**
//              * @type {BibleVersionDialog} dialogVersion
//             */
//             var dialogVersion = new Ijnjs.BibleVersionDialog("dialog-version", cbDialogHide, getAbvResult(), cbDialogShow)
            
//             res({ dialogVersion })
//         }, js => {
//             triggerAbvPhpInit()
//             return js.BibleVersionDialog != undefined && window.abvphp != undefined && window.abvphp.isReadyGlobalBibleVersions()
//         }, 33)
//         return 
//         function triggerAbvPhpInit(){
//             var isSendAbvphp = false 
//             if (window.abvphp != undefined && window.abvphp.isReadyGlobalBibleVersions() == false ){
//                 if ( isSendAbvphp == false ){
//                     window.abvphp.init_g_bibleversions()
//                     isSendAbvphp = true
//                 }
//             }
//         }
//     })
// }