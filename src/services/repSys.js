import Eth from 'ethjs'
import web3 from 'web3'
import { getProvider } from './provider'
import { getRepSys } from '../config'
import store from '../store'
import moment from 'moment'
import { toBasicUnit, equalWithPrecision, currentTimestamp } from '../utils/utils'
import { BigNumber } from 'bignumber.js'

const big = (number) => new BigNumber(number)

class RepSysService {
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
    this.account = accounts[0]
    this.rs = await getRepSys(accounts[0])
    this.address = this
    this.setUpEvents()

    store.dispatch({
      type: 'REP_SYS_CONTRACT_INIT'
    })
  }

  setUpEvents () {
    this.rs.allEvents()
      .watch((error, log) => {
        if (error) {
          console.error(error)
          return false
        }

        store.dispatch({
          type: 'REP_SYS_EVENT'
        })
      })
  }

  async startPoll (name, ms, startTime, endTime) {
    let now = await currentTimestamp(false)
    startTime = moment(startTime).utc().unix()
    endTime = moment(endTime).utc().unix()
    let delayLength = Math.ceil((startTime - now) / 15)
    let pollLength = Math.ceil((endTime - startTime) / 15)

    await this.rs.startPoll(web3.utils.keccak256(name), web3.utils.soliditySha3(web3.utils.keccak256(name), ms.id), delayLength, pollLength)
  }

  async getPollRequest (id) {
    let result = await this.rs.getPollRequest.call(id)
    return {
      minStartTime: result[0].toNumber(),
      maxStartTime: result[1].toNumber(),
      pseudoPrice: result[2],
      priceGteOne: result[3],
      tokenAddress: result[4],
      contextTypes: result[5]
    }
  }

  async getVotes (id, objType) {
    let result = await this.rs.readAvailableVotesForContextType.call(id, this.account, objType)
    return result
  }

  async vote (name, ms, type, data, totalVoteRights) {
    let projectHash = web3.utils.keccak256(name)
    let pollId = web3.utils.soliditySha3(web3.utils.keccak256(name), ms.id)
    for (let i = 0; i < data.length; i++) {
      if (i === data.length - 1 && equalWithPrecision(big(data[i].votes), totalVoteRights)) {
        await this.rs.vote(projectHash, data[i].address, type, pollId, toBasicUnit((totalVoteRights).div(ms.pollInfo.pseudoPrice)).toString(10))
      } else {
        totalVoteRights = totalVoteRights.minus(big(data[i].votes))
        await this.rs.vote(projectHash, data[i].address, type, pollId, toBasicUnit(big(data[i].votes).div(ms.pollInfo.pseudoPrice)).toString(10))
      }
    }
  }
}

export default new RepSysService()
