import Eth from 'ethjs'
import web3 from 'web3'
import { getProvider } from './provider'
import { getRegulatingRating } from '../config'
import store from '../store'

class RegulatingRatingService {
  constructor () {
    this.address = null
    this.account = null
    this.rs = null
  }

  async init () {
    /* important to check for provider in
     * init function (rather than constructor),
     * so that injected web3 has time to load.
     */
    this.eth = new Eth(getProvider())
    const accounts = await this.eth.accounts()
    this.rr = await getRegulatingRating(accounts[0])
    this.address = this.rr.address
    this.account = accounts[0]
    this.setUpEvents()

    store.dispatch({
      type: 'REGULATING_RATING_CONTRACT_INIT'
    })
  }

  setUpEvents () {
    this.rr.allEvents()
      .watch((error, log) => {
        if (error) {
          console.error(error)
          return false
        }

        store.dispatch({
          type: 'REGULATING_RATING_EVENT'
        })
      })
  }

  async isObjFinalized (hash, id, obj) {
    let result = await this.rr.isObjFinalized.call(hash, id, obj)
    return result
  }

  async getBidInfo (hash, id, objs) {
    let result = []
    for (let i = 0; i < objs.length; i++) {
      result.push(await this.rr.isRegulatorBid.call(hash, id, objs[i], this.account))
    }
    return result
  }

  async bid (name, id, obj) {
    await this.rr.bid(web3.utils.keccak256(name), id, obj)
  }

  async backout (name, id, obj) {
    await this.rr.backOutFromBid(web3.utils.keccak256(name), id, obj)
  }

  async finalizeBidForObj (name, id, obj) {
    await this.rr.finalizeBidForObj(web3.utils.keccak256(name), id, obj)
  }

  async finalizeAllBids (name, id) {
    await this.rr.finalizeAllBids(web3.utils.keccak256(name), id)
  }

  async isRegulator (hash, id, obj) {
    let result = await this.rr.isRegulator.call(hash, id, obj, this.account)
    return result
  }
}

export default new RegulatingRatingService()
