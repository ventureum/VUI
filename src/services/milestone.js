import Eth from 'ethjs'
import { getProvider } from './provider'
import { getMilestoneController, getMilestoneControllerView, getCarbonVoteXCore } from '../config'
import { dayToSeconds, toBasicUnit, equalWithPrecision, currentTimestamp } from '../utils/utils'
import store from '../store'
import web3 from 'web3'
import repSys from './repSys'
import token from './token'
import regulatingRating from './regulatingRating'
import refundManager from './refundManager'
import rewardManager from './rewardManager'
import paymentManager from './paymentManager'
import { BigNumber } from 'bignumber.js'

const big = (number) => new BigNumber(number)

class MilestoneService {
  constructor () {
    this.ms = null
    this.msview = null
    this.carbonVoteXCore = null
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
    this.ms = await getMilestoneController(accounts[0])
    this.msview = await getMilestoneControllerView(accounts[0])
    this.carbonVoteXCore = await getCarbonVoteXCore(accounts[0])
    this.setUpEvents()

    store.dispatch({
      type: 'MILESTONE_CONTRACT_INIT'
    })
  }

  setUpEvents () {
    this.ms.allEvents()
      .watch((error, log) => {
        if (error) {
          console.error(error)
          return false
        }

        store.dispatch({
          type: 'MILESTONE_EVENT'
        })
      })
    this.carbonVoteXCore.allEvents()
      .watch((error, log) => {
        if (error) {
          console.error(error)
          return false
        }

        store.dispatch({
          type: 'MILESTONE_EVENT'
        })
      })
  }

  async getRegulationRewardsForRegulator (hash, id, objs, objFinalized) {
    let result = {}
    for (let i = 0; i < objs.length; i++) {
      if (objFinalized[i]) {
        let isRegulator = await regulatingRating.isRegulator(hash, id, objs[i], this.account)
        if (isRegulator) {
          let temp = await rewardManager.getRegulationRewardsInfo(hash, id, objs[i])
          result[i] = {
            isRegulator: true,
            finalized: temp.finalized,
            rewards: temp.rewards
          }
        } else {
          result[i] = {
            isRegulator: false
          }
        }
      }
    }
    return result
  }

  async getVoteRights (id, types) {
    let result = {}
    let canVote = false
    for (let i = 0; i < types.length; i++) {
      if (!result[types[i]]) {
        result[types[i]] = await repSys.getVotes(id, types[i])
        if (result[types[i]].toNumber() !== 0) {
          canVote = true
        }
      }
    }
    result.canVote = canVote
    return result
  }

  async getMilestoneData (project) {
    let name = project.projectName
    let msState = {
      0: 'inactive',
      1: 'ip',
      2: 'rs',
      3: 'rp',
      4: 'completion'
    }
    let msStateReadable = {
      0: 'inactive',
      1: 'in progress',
      2: 'rating stage',
      3: 'refund period',
      4: 'completion'
    }
    let data = await this.msview.getNumberOfMilestones.call(web3.utils.keccak256(name))
    if (data.toNumber() === 0) {
      return null
    }
    let result = []
    for (let i = 1; i <= data.toNumber(); i++) {
      let projectHash = web3.utils.keccak256(name)
      let pollId = web3.utils.soliditySha3(web3.utils.keccak256(name), i)
      let ms = await this.msview.getMilestoneInfo.call(projectHash, i)
      let objInfo = await this.msview.getMilestoneObjInfo.call(projectHash, i)
      let objsStrs = []
      objInfo[0].forEach((hash) => {
        objsStrs.push(web3.utils.toAscii(hash))
      })
      let objTypesStrs = []
      objInfo[1].forEach((hash) => {
        objTypesStrs.push(web3.utils.toAscii(hash))
      })
      let objFinalized = []
      for (let j = 0; j < objInfo[0].length; j++) {
        objFinalized.push(await regulatingRating.isObjFinalized(projectHash, i, objInfo[0][j]))
      }
      let pollExist = await this.carbonVoteXCore.pollExist.call(web3.utils.keccak256('ReputationSystem'), pollId)
      let pollExpired
      if (pollExist) {
        pollExpired = await this.carbonVoteXCore.pollExpired.call(web3.utils.keccak256('ReputationSystem'), pollId)
      }
      let bidInfo
      if (msState[ms[1].toNumber()] === 'rs') {
        bidInfo = await regulatingRating.getBidInfo(projectHash, i, objInfo[0])
      }
      let pollInfo = null
      if (msState[ms[1].toNumber()] !== 'inactive') {
        pollInfo = await repSys.getPollRequest(pollId)
      }
      let restWeiLock = null
      if (msState[ms[1].toNumber()] !== 'inactive') {
        restWeiLock = await paymentManager.getRestWeiLock(projectHash, i)
      }
      let rewardInfo
      if (objFinalized.includes(true)) {
        rewardInfo = await this.getRegulationRewardsForRegulator(projectHash, i, objInfo[0], objFinalized)
      }
      let refundInfo = await refundManager.getRefundInfo(projectHash, i)
      let voteObtained = await this.carbonVoteXCore.voteObtained.call(web3.utils.keccak256('ReputationSystem'), pollId, this.account)
      let voteRights
      if (voteObtained) {
        voteRights = await this.getVoteRights(pollId, objInfo[1])
      }

      result.push({
        id: i,
        objs: objInfo[0],
        objsStrs,
        objTypes: objInfo[1],
        objTypesStrs,
        objRewards: objInfo[2],
        objFinalized,
        days: ms[0].toNumber() / (24 * 60 * 60),
        state: ms[1].toNumber(),
        stateStr: msState[ms[1].toNumber()],
        stateStrReadable: msStateReadable[ms[1].toNumber()],
        startTime: ms[2].toNumber(),
        endTime: ms[3].toNumber(),
        pollExist,
        pollExpired,
        pollInfo,
        restWeiLock,
        weiLocked: ms[4],
        rewardInfo,
        refundInfo,
        voteObtained,
        voteRights,
        bidInfo
      })
    }

    return result
  }

  async addMilestone (name, data) {
    let objs = []
    let objTypes = []
    let objRewards = []
    for (let i = 0; i < data.objs.length; i++) {
      objs.push(data.objs[i].name)
      objTypes.push(data.objs[i].type)
      objRewards.push(toBasicUnit(big(data.objs[i].reward)).toString(10))
    }
    await this.ms.addMilestone(web3.utils.keccak256(name), dayToSeconds(data.days), objs, objTypes, objRewards)
  }

  async activate (name, id, wei, minTime, maxTime, etherCanLock) {
    let now = await currentTimestamp(false)
    let minStartTime = now + minTime
    let maxStartTime = now + maxTime
    if (equalWithPrecision(toBasicUnit(big(wei)), etherCanLock)) {
      wei = etherCanLock
    } else {
      wei = toBasicUnit(big(wei))
    }
    await this.ms.activate(web3.utils.keccak256(name), id, wei.toString(10), minStartTime, maxStartTime)
  }

  async startRatingStage (name, id) {
    await this.ms.startRatingStage(web3.utils.keccak256(name), id)
  }

  async startRefundStage (name, id) {
    await this.ms.startRefundStage(web3.utils.keccak256(name), id)
  }

  async refund (name, id) {
    await this.ms.refund(web3.utils.keccak256(name), id)
  }

  async finalize (name, id) {
    await this.ms.founderFinalize(web3.utils.keccak256(name), id)
  }

  async writeAvailableVotes (name, id) {
    let ci = web3.utils.keccak256('ReputationSystem')
    let pollId = web3.utils.soliditySha3(web3.utils.keccak256(name), id)
    let balance = await token.balanceOf(this.account)

    // TODO: later change to call aws api
    let rootAddr = '0x959FD7Ef9089B7142B6B908Dc3A8af7Aa8ff0FA1'
    await this.carbonVoteXCore.writeAvailableVotes(ci, pollId, this.account, balance, {from: rootAddr})
  }
}

export default new MilestoneService()
