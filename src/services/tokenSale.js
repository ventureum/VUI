import Eth from 'ethjs'
import web3 from 'web3'
import { BigNumber } from 'bignumber.js'
import { getProvider } from './provider'
import { getTokenSale } from '../config'
import { toBasicUnit } from '../utils/utils'
import store from '../store'
import token from './token'

const big = (number) => new BigNumber(number)

class TokenSaleService {
  constructor () {
    this.address = null
    this.tokenSale = null
    this.account = null
  }

  async init () {
    /* important to check for provider in
     * init function (rather than constructor),
     * so that injected web3 has time to load.
     */
    this.eth = new Eth(getProvider())
    const accounts = await this.eth.accounts()
    this.account = accounts[0]
    this.tokenSale = await getTokenSale(accounts[0])
    this.address = this.tokenSale.address
    this.setUpEvents()

    store.dispatch({
      type: 'TOKEN_SALE_CONTRACT_INIT'
    })
  }

  setUpEvents () {
    this.tokenSale.allEvents()
      .watch((error, log) => {
        if (error) {
          console.error(error)
          return false
        }

        store.dispatch({
          type: 'TOKEN_SALE_EVENT'
        })
      })
  }

  async startTokenSale (name, rate, addr, token, amount) {
    let amountWei = toBasicUnit(big(amount)).toString(10)
    await token.approve(this.address, amountWei)
    await this.tokenSale.startTokenSale(web3.utils.keccak256(name), rate, addr, amountWei)
  }

  async stopTokenSale (name) {
    await this.tokenSale.finalize(web3.utils.keccak256(name))
  }

  async buyToken (name, amount, rate) {
    let vtxBase = await this.tokenSale.vtxBase.call()
    await token.approve(this.address, toBasicUnit(big(amount)).div(vtxBase))
    await this.tokenSale.buyTokens(web3.utils.keccak256(name), {value: toBasicUnit(big(amount)).div(rate).toString(10).replace(/\..*/, '')})
  }

  async getTokenInfo (name) {
    let info = await this.tokenSale.tokenInfo.call(web3.utils.keccak256(name))
    return {
      rate: info[0],
      totalTokenSold: info[1],
      totalEth: info[2],
      finalized: info[3],
      numTokenLeft: info[4]
    }
  }
}

export default new TokenSaleService()
