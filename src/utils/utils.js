import { BigNumber } from 'bignumber.js'
import store from '../store.js'
import moment from 'moment'
import toastr from 'toastr'
import bs58 from 'bs58'

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

function hashToByte32 (hash) {
  return '0x' + bs58.decode(hash).slice(2).toString('hex')
}

function byte32ToHash (input) {
  const hashHex = "1220" + input.slice(2)
  const hashBytes = Buffer.from(hashHex, 'hex');
  const hashStr = bs58.encode(hashBytes)
  return hashStr
}

function getReadableLength (seconds) {
    let result = {
      day: 0,
      hour: 0,
      minute: 0,
      second: 0
    }

    let oneMinute = 60
    let oneHour = 60 * oneMinute
    let oneDay = 24 * oneHour

    if (seconds >= oneDay) {
      result.day = Math.floor(seconds / oneDay)
      seconds = seconds % oneDay
    }
    if (seconds >= oneHour) {
      result.hour = Math.floor(seconds / oneHour)
      seconds = seconds % oneHour
    }
    if (seconds >= oneMinute) {
      result.minute = Math.floor(seconds / oneMinute)
      seconds = seconds % oneMinute
    }
    result.second = seconds
    return Object.keys(result)
      .filter(key => result[key] > 0)
      .reduce((str, key) => [str, result[key], key + '(s)'].join(' '), '')
  }

export {
  toStandardUnit,
  toBasicUnit,
  wrapWithTransactionInfo,
  stopPropagation,
  dayToSeconds,
  equalWithPrecision,
  currentTimestamp,
  wrapSend,
  hashToByte32,
  byte32ToHash,
  getReadableLength
}
