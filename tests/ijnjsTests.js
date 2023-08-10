/// <reference path="../libs/jsdoc/require.js" />
/// <reference path="../libs/jsdoc/jquery.js" />
/// <reference path="../libs/jsdoc/linq.d.ts" />
/// <reference path="../libs/jsdoc/lodash.d.js" />
/// <reference path="../libs/ijnjs/ijnjs.d.js" />

testThenDoAsync(() => window.Ijnjs != undefined).then(() => {
  console.log(Ijnjs)
})
// testThenDoAsync({
//   cbTest: () => window.Ijnjs != undefined,
//   msg: 'html.js'
// }).then(() => {

//   console.log(Ijnjs)

//   var r1 = Ijnjs.matchGlobalWithCapture(/aa/ig,'aaAafowiajeifowAAfwojeigA')
//   console.log(r1)

// })
