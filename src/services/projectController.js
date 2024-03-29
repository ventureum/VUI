import Eth from 'ethjs'
import { getProvider } from './provider'
import { getProjectController } from '../config'
import store from '../store'
import web3 from 'web3'
import { wrapSend } from '../utils/utils'

class ProjectControllerService {
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
    this.projectController = await getProjectController(accounts[0])
    this.address = this.projectController.address
    this.setUpEvents()
    wrapSend(this, ['projectController'])

    store.dispatch({
      type: 'PROJECT_CONTROLLER_CONTRACT_INIT'
    })
  }

  setUpEvents () {
    this.projectController.allEvents()
      .watch((error, log) => {
        if (error) {
          console.error(error)
          return false
        }

        store.dispatch({
          type: 'PROJECT_CONTROLLER_EVENT'
        })
      })
  }

  async getProjectState (project) {
    let stage = await this.projectController.getProjectState.call(web3.utils.keccak256(project.projectName))
    return stage
  }

  async getProjectEther (project) {
    let stage = await this.projectController.getProjectInfo.call(web3.utils.keccak256(project.projectName))
    return stage[2]
  }

  async getTokenAddress (project) {
    let address = await this.projectController.getTokenAddress.call(web3.utils.keccak256(project.projectName))
    return address
  }
}

export default new ProjectControllerService()
