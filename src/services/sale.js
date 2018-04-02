import Eth from 'ethjs'
import { getProvider } from './provider'
import { getSale } from '../config'
import store from '../store'

const big = (number) => new Eth.BN(number.toString(10))
const tenToTheNinth = big(10).pow(big(9))
const tenToTheEighteenth = big(10).pow(big(18))

class SaleService {
  constructor () {
    this.address = null
    this.sale = null
  }

  async init () {
    /* important to check for provider in
     * init function (rather than constructor),
     * so that injected web3 has time to load.
     */
    this.eth = new Eth(getProvider())
    const accounts = await this.eth.accounts()
    this.sale = await getSale(accounts[0])
    this.address = this.sale.address
    this.setUpEvents()

    store.dispatch({
      type: 'SALE_CONTRACT_INIT'
    })
  }

  setUpEvents () {
    this.sale.allEvents()
      .watch((error, log) => {
        if (error) {
          console.error(error)
          return false
        }

        store.dispatch({
          type: 'SALE_EVENT'
        })
      })
  }

  async purchaseTokens (tokenAmount) {
    await this.sale.purchaseTokens({value: big(tokenAmount).mul(tenToTheEighteenth)})
  }
}

export default new SaleService()