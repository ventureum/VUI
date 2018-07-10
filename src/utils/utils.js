import { BigNumber } from 'bignumber.js'
import store from '../store.js'

const big = (number) => new BigNumber(number.toString(10))
const tenToTheEighteenth = big(10).pow(big(18))

function toStandardUnit (val) {
  if (!val) return new BigNumber(0)
  return val.div(tenToTheEighteenth)
}

function toBasicUnit (val) {
  if (!val) return new BigNumber(0)
  return val.times(tenToTheEighteenth)
}

function wrapWithTransactionInfo (name, cb, data) {
  return function (e) {
    e && e.preventDefault && e.preventDefault()
    store.dispatch({
      type: 'SHOW_TRANSACTION_INFO',
      name,
      cb: () => {
        cb(data)
      }
    })
  }
}

function stopPropagation (cb) {
  return function (e) {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    cb()
  }
}

export {toStandardUnit, toBasicUnit, wrapWithTransactionInfo, stopPropagation}
