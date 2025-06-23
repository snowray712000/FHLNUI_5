/**
 * Assert a condition and throw an error with a message if the condition is false.
 * @param {function|boolean} cbTest - The condition to test, can be a function or a boolean.
 * @param {string|{toString:function}} msg - The error message to throw if the assertion fails.
 */
export function assert(cbTest, msg = null) {
    if (typeof cbTest === 'function') {
      if (false == cbTest()) {
        throw Error(getMsg())
      }
    } else if (typeof cbTest === 'boolean') {
      if (false == cbTest) {
        throw Error(getMsg())
      }
    }
    function getMsg() {
      if (msg != undefined) {
        return msg
      }
      if (typeof cbTest === 'function') {
        return 'assert ' + cbTest.toString()
      }
      return 'assert fail.'
    }
  }