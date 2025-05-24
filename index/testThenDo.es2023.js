  /**
   * @param {{cbDo:()=>{};cbTest:()=>boolean;ms?:number;msg?:string;cntMax?:number;cbErr?:(err:any)=>{}}} args 
   */
  export function testThenDo(args) {
    if (typeof args != 'object') { throw new Error('call testThen Do, args already use {}') }

    var ms = args.ms == undefined ? 333 : args.ms
    var test = args.cbTest == undefined ? () => true : args.cbTest
    var msg = args.msg == undefined ? '' : args.msg
    var cbErr = args.cbErr == undefined ? () => { } : args.cbErr
    var cbDo = args.cbDo == undefined ? () => { } : args.cbDo

    var cntMax = args.cntMax == undefined ? 50 : args.cntMax
    var cnt = 0

    var fnOnce = once;
    try {
      once()
    } catch (error) {
      cbErr(error)
    }

    return
    function once() {
      if (test()) {
        cbDo()
      } else {
        cnt += 1
        if (cnt > cntMax) {
          console.log('wait limit max count. ' + cntMax)
          cbErr(new Error('wait limit max count.' + cntMax))
        } else {
          console.log('wait ' + msg)
          setTimeout(() => {
            fnOnce()
          }, ms)
        }
      }
    }
  }


  /**
   * @param {{cbTest:()=>boolean;ms?:number;msg?:string;cntMax?:number}} args 
   */
  export function testThenDoAsync(args) {
    ifArgsIsUndefined()
    ifArgsIsCallbackTest()

    if (typeof args != 'object') { throw new Error('call testThen Do, args already use {}') }
    return new Promise((res, rej) => {
      args.cbDo = () => res()
      args.cbErr = (err) => res(err)
      testThenDo(args)
    })
    function ifArgsIsUndefined(){
      if (args == undefined){        
        args = {
          cbTest: () => window.Ijnjs != undefined
        }
      }
    }
    function ifArgsIsCallbackTest() {
      if (typeof args == 'function') {
        // 太常只傳 cbTest 了
        cbTest = args
        args = {
          cbTest: cbTest,
          msg: cbTest.toString()
        }
      }
    }
  }