import { BigNumber } from 'bignumber.js'
import store from '../store.js'
import moment from 'moment'

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
    e.nativeEvent && e.nativeEvent.stopImmediatePropagation()
    cb()
  }
}

function dayToSeconds (val) {
  return val * 24 * 60 * 60
}

function equalWithPrecision (val1, val2) {
  if (!val1.eq(val2) && val1.toNumber() === val2.toNumber()) {
    return true
  }
  return false
}

var timestamp = 0
var env = process.env.REACT_APP_ENV
function currentTimestamp (sync = true) {
  function getTimestampFromBlockchain (sync) {
    if (sync) {
      window.web3.eth.getBlock('latest', (err, res) => {
        if (err) {
          console.error(err)
        } else {
          timestamp = res.timestamp
          store.dispatch({
            type: 'UPDATE_TIMESTAMP',
            timestamp
          })
        }
      })
      return timestamp
    } else {
      return new Promise(async (resolve, reject) => {
        window.web3.eth.getBlock('latest', (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.timestamp)
          }
        })
      })
    }
  }

  if (env === 'test') {
    return getTimestampFromBlockchain(sync)
  } else {
    timestamp = moment().utc().unix()
    if (sync) {
      return timestamp
    } else {
      return Promise.resolve(timestamp)
    }
  }
}

export {toStandardUnit, toBasicUnit, wrapWithTransactionInfo, stopPropagation, dayToSeconds, equalWithPrecision, currentTimestamp}
