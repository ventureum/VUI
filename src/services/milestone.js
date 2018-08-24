import Eth from 'ethjs'
import { getProvider } from './provider'
import { getMilestoneController, getMilestoneControllerView, getCarbonVoteXCore } from '../config'
import { toBasicUnit, equalWithPrecision, currentTimestamp, wrapSend, hashToByte32, byte32ToHash } from '../utils/utils'
import store from '../store'
import web3 from 'web3'
import axios from 'axios'
import repSys from './repSys'
import token from './token'
import ipfs from './ipfs'
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
    this.axios = axios.create({
      baseURL: process.env.REACT_APP_API_GATEWAY,
      timeout: 0,
      headers: {
        'content-type': 'application/json'
      }
    })
    this.eth = new Eth(getProvider())
    const accounts = await this.eth.accounts()
    this.account = accounts[0]
    this.ms = await getMilestoneController(accounts[0])
    this.msview = await getMilestoneControllerView(accounts[0])
    this.carbonVoteXCore = await getCarbonVoteXCore(accounts[0])
    this.setUpEvents()
    wrapSend(this, ['ms', 'carbonVoteXCore'])

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

  async getEstimateGas (pollId) {
    return this.axios.post('/', {
      name: 'getEstimateGas',
      pollId: pollId,
      address: this.account
    }).then((res) => {
      return Promise.resolve(res.data.body)
    })
  }

  async sendGas (name, id, value) {
    await this.carbonVoteXCore.sendGas(web3.utils.keccak256('ReputationSystem'), web3.utils.soliditySha3(web3.utils.keccak256(name), id), {value: value})
  }

  async writeAvailableVotes (name, id) {
    let env = process.env.REACT_APP_ENV
    if (env === 'test') {
      let ci = web3.utils.keccak256('ReputationSystem')
      let pollId = web3.utils.soliditySha3(web3.utils.keccak256(name), id)
      let balance = await token.balanceOf(this.account)
      let rootAddr = process.env.REACT_APP_ROOT_ADDRESS
      await this.carbonVoteXCore.writeAvailableVotes(ci, pollId, this.account, balance, {from: rootAddr})
    } else {
      return this.axios.post('/', {
        name: 'writeAvailableVotes',
        pollId: web3.utils.soliditySha3(web3.utils.keccak256(name), id),
        address: this.account
      })
    }
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
      for (let j = 0; j < objInfo[0].length; j++) {
        objsStrs.push(await ipfs.get(byte32ToHash(objInfo[0][j])))
      }
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
      let bidInfo = null
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
      let estimateGas = null
      let gasSent = null
      if (pollExist && !pollExpired && !voteObtained) {
        estimateGas = await this.getEstimateGas(pollId)
        gasSent = await this.carbonVoteXCore.getGasSent.call(web3.utils.keccak256('ReputationSystem'), pollId, this.account)
      }
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
        len: ms[0].toNumber(),
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
        gasSent,
        estimateGas,
        voteObtained,
        voteRights,
        bidInfo
      })
    }

    return result
  }

  convertToSeconds (len) {
    let oneMinute = 60
    let oneHour = 60 * oneMinute
    let oneDay = 24 * oneHour

    return len.day * oneDay + len.hour * oneHour + len.minute * oneMinute + len.second
  }

  async addMilestone (name, data) {
    let objTypes = []
    let objRewards = []
    let objs = []
    for (let i = 0; i < data.objs.length; i++) {
      objs.push(await ipfs.add(data.objs[i].name).then((hash) => {return Promise.resolve(hashToByte32(hash))}))
      objTypes.push(data.objs[i].type)
      objRewards.push(toBasicUnit(big(data.objs[i].reward)).toString(10))
    }
    await this.ms.addMilestone(web3.utils.keccak256(name), this.convertToSeconds(data.len), objs, objTypes, objRewards)
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

  async getMinLength () {
    let result = await this.ms.minMilestoneLength.call()
    return result.toNumber()
  }

  async getRatingStageMaxStartTime () {
    let result = await this.ms.ratingStageMaxStartTimeFromEnd.call()
    return result.toNumber()
  }

  async getRefundStageMinStartTime () {
    let result = await this.ms.refundStageMinStartTimeFromEnd.call()
    return result.toNumber()
  }
}

export default new MilestoneService()
