import { BigNumber } from 'bignumber.js'

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

export {toStandardUnit, toBasicUnit}
