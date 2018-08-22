import { BigNumber } from 'bignumber.js'
import store from '../store.js'
import moment from 'moment'
import toastr from 'toastr'

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
var source = process.env.REACT_APP_TIME_SOURCE
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

  if (source === 'blockchain') {
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

function wrapSend (target, contracts) {
  var handler = {
    get: function(obj, prop) {
      let oriVal = obj[prop]
      if (typeof oriVal === 'function') {
        let wrapper = function () {
          return oriVal.apply(obj, arguments).then(({ tx }) => {
            toastr.success('Follow transaction in Etherscan, Click this hash: <a style="color: blue; text-decoration: underline;" target="_blank" href="https://etherscan.io/tx/' + tx + '">' + tx + '</a>')
            return Promise.resolve(tx)
          })
        }
        let handler = {
          get: function(obj, prop) {
            return oriVal[prop]
          }
        }
        return new Proxy(wrapper, handler)
      } else {
        return oriVal
      }
    },
    set: function(obj, key, val) {
      obj[key] = val
      return val
    }
  }
  for (let i = 0; i < contracts.length; i++) {
    target['ori' + contracts[i]] = target[contracts[i]]
    target[contracts[i]] = new Proxy(target[contracts[i]], handler)
  }
}

export {
  toStandardUnit,
  toBasicUnit,
  wrapWithTransactionInfo,
  stopPropagation,
  dayToSeconds,
  equalWithPrecision,
  currentTimestamp,
  wrapSend
}
