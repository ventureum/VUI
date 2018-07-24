import Eth from 'ethjs'
import web3 from 'web3'
import moment from 'moment'
import { BigNumber } from 'bignumber.js'
import { getProvider } from './provider'
import { getRefundManager } from '../config'
import store from '../store'
import { toBasicUnit, equalWithPrecision } from '../utils/utils'

const big = (number) => new BigNumber(number)

class RefundManagerService {
  constructor () {
    this.address = null
    this.rm = null
  }

  async init () {
    /* important to check for provider in
     * init function (rather than constructor),
     * so that injected web3 has time to load.
     */
    this.eth = new Eth(getProvider())
    const accounts = await this.eth.accounts()
    this.rm = await getRefundManager(accounts[0])
    this.address = this.rm.address
    this.setUpEvents()

    store.dispatch({
      type: 'REFUND_MANAGER_CONTRACT_INIT'
    })
  }

  setUpEvents () {
    this.rm.allEvents()
      .watch((error, log) => {
        if (error) {
          console.error(error)
          return false
        }

        store.dispatch({
          type: 'REFUND_MANAGER_EVENT'
        })
      })
  }

  async getRefundInfo (hash, id) {
    let result = await this.rm.getRefundInfo.call(hash, id)
    return {
      canWithdraw: result[0],
      ethRefund: result[1],
      availableTime: result[2].toNumber()
    }
  }

  async refund (project, id, amount) {
    if (equalWithPrecision(toBasicUnit(big(amount)), project.balance)) {
      amount = project.balance
    } else {
      amount = toBasicUnit(big(amount))
    }
    await project.token.approve(this.address, amount.toString(10))
    await this.rm.refund(web3.utils.keccak256(project.projectName), id, amount.toString(10))
  }

  async withdraw (name, id) {
    await this.rm.withdraw(web3.utils.keccak256(name), id)
  }
}

export default new RefundManagerService()
