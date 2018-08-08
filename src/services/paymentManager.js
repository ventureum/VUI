import Eth from 'ethjs'
import web3 from 'web3'
import { BigNumber } from 'bignumber.js'
import { getProvider } from './provider'
import { getPaymentManager } from '../config'
import store from '../store'
import { toBasicUnit, equalWithPrecision } from '../utils/utils'

const big = (number) => new BigNumber(number)

class PaymentManagerService {
  constructor () {
    this.address = null
    this.pm = null
  }

  async init () {
    /* important to check for provider in
     * init function (rather than constructor),
     * so that injected web3 has time to load.
     */
    this.eth = new Eth(getProvider())
    const accounts = await this.eth.accounts()
    this.pm = await getPaymentManager(accounts[0])
    this.address = this.pm.address
    this.setUpEvents()

    store.dispatch({
      type: 'PAYMENT_MANAGER_CONTRACT_INIT'
    })
  }

  setUpEvents () {
    this.pm.allEvents()
      .watch((error, log) => {
        if (error) {
          console.error(error)
          return false
        }

        store.dispatch({
          type: 'PAYMENT_MANAGER_EVENT'
        })
      })
  }

  async getRestWeiLock (hash, id) {
    let result = await this.pm.getRestWeiLock.call(hash, id)
    return result
  }

  async withdraw (name, id) {
    await this.pm.withdraw(web3.utils.keccak256(name), id)
  }
}

export default new PaymentManagerService()
