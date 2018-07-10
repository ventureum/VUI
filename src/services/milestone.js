import Eth from 'ethjs'
import { getProvider } from './provider'
import { getMilestoneController, getMilestoneControllerView } from '../config'
import store from '../store'
import web3 from 'web3'

class MilestoneService {
  constructor () {
    this.ms = null
    this.msview = null
  }

  async init () {
    /* important to check for provider in
     * init function (rather than constructor),
     * so that injected web3 has time to load.
     */
    this.eth = new Eth(getProvider())
    const accounts = await this.eth.accounts()
    this.ms = await getMilestoneController(accounts[0])
    this.msview = await getMilestoneControllerView(accounts[0])
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
  }

  async getMilestoneData (name) {
    let msState = {
      0: 'inactive',
      1: 'ip',
      2: 'rs',
      3: 'rp',
      4: 'completion'
    }
    let data = await this.msview.getNumberOfMilestones.call(web3.utils.keccak256(name))
    if (data.toNumber() === 0) {
      return null
    }
    let result = []
    for (let i = 1; i <= data.toNumber(); i++) {
      let ms = await this.msview.getMilestoneInfo.call(web3.utils.keccak256(name), i)
      let objInfo = await this.msview.getMilestoneObjInfo.call(web3.utils.keccak256(name), i)
      let objsStrs = []
      objInfo[0].forEach((hash) => {
        objsStrs.push(web3.utils.toAscii(hash))
      })
      let objTypesStrs = []
      objInfo[1].forEach((hash) => {
        objTypesStrs.push(web3.utils.toAscii(hash))
      })
      result.push({
        id: i,
        objs: objInfo[0],
        objsStrs,
        objTypes: objInfo[1],
        objTypesStrs,
        objRewards: objInfo[2],
        days: ms[0].toNumber() / (24 * 60 * 60),
        state: ms[1].toNumber(),
        stateStr: msState[ms[1].toNumber()],
        startTime: ms[2].toNumber(),
        endTime: ms[3].toNumber(),
        weiLocked: ms[4].toNumber()
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
      objRewards.push(data.objs[i].reward)
    }
    await this.ms.addMilestone(web3.utils.keccak256(name), data.days * 24 * 60 * 60, objs, objTypes, objRewards)
  }
}

export default new MilestoneService()
