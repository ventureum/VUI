import Eth from 'ethjs'
import web3 from 'web3'
import { getProvider } from './provider'
import { getRewardManager } from '../config'
import store from '../store'

class RewardManagerService {
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
    this.rm = await getRewardManager(accounts[0])
    this.address = this.rm.address
    this.setUpEvents()

    store.dispatch({
      type: 'REWARD_MANAGER_CONTRACT_INIT'
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
          type: 'REWARD_MANAGER_EVENT'
        })
      })
  }

  async withdraw (name, id, obj) {
    await this.rm.withdraw(web3.utils.keccak256(name), id, obj)
  }

  async getRegulationRewardsInfo (hash, id, obj) {
    let result = await this.rm.getRegulationRewardsInfo.call(hash, id, obj)
    return {
      finalized: result[0],
      rewards: result[1]
    }
  }
}

export default new RewardManagerService()
