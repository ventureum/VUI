import Eth from 'ethjs'
import web3 from 'web3'
import { getProvider } from './provider'
import { getRegulatingRating, getRegulatingRatingView } from '../config'
import store from '../store'
import { wrapSend } from '../utils/utils'

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
    this.rrv = await getRegulatingRatingView(accounts[0])
    this.address = this.rr.address
    this.account = accounts[0]
    this.setUpEvents()
    wrapSend(this, ['rr'])

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
    let result = await this.rrv.isObjFinalized.call(hash, id, obj)
    return result
  }

  async getBidInfo (hash, id, objs) {
    let result = []
    for (let i = 0; i < objs.length; i++) {
      result.push(await this.rrv.isRegulatorBid.call(hash, id, objs[i], this.account))
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
    let result = await this.rrv.isRegulator.call(hash, id, obj, this.account)
    return result
  }

  async maxScore () {
    let result = await this.rr.maxScore.call()
    return result.toNumber()
  }

  async regulatorVote (name, id, obj, score) {
    await this.rr.regulatorVote(web3.utils.keccak256(name), id, obj, score)
  }

  async getRegulatorVoteInfo (hash, id, obj, addr) {
    let result = await this.rrv.getRegulatorVoteInfo.call(hash, id, obj, addr)
    return {
      weight: result[0],
      score: result[1].toNumber()
    }
  }

  async getRegulatorList (hash, id, obj) {
    let result = await this.rrv.getObjRegulationInfo.call(hash, id, obj)
    return result[2]
  }
}

export default new RegulatingRatingService()
