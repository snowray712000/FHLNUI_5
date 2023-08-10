/// <reference path="../jsdoc/jquery.js" />
/// <reference path="../jsdoc/linq.d.ts" />
/// <reference path="../ijnjs/ijnjs.d.ts" />
//// <reference path="../ijnjs/ijn-dialog-base.js" />
//// <reference path="../ijnjs/bible-version-dialog-picker.js" />

Ijnjs.testThenDo(()=>{
  initDialogAndShow()
})

function initDialogAndShow(){
  var dialog1 = new Ijnjs.BibleVersionDialog(
    'version-dialog',
    function(vers){
      console.log(vers);
    },[
    {book:'cbol',cname:'簡體中文取代'},
    {book:'cbol2',cname:'模擬新版本上線'}
    ])
  
  setTimeout(() => {
    dialog1.show(['esv'])
  }, 100);

  window.dialog1 = dialog1
}