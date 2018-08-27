import Eth from 'ethjs'
import { promisify as pify } from 'bluebird'
import keyMirror from 'key-mirror'
import detectNetwork from 'web3-detect-network'

import store from '../store'
import token from './token'
import plcr from './plcr'
import parameterizer from './parameterizer'
import tokenSale from './tokenSale'
import milestone from './milestone'
import projectController from './projectController'
import saltHashVote from '../utils/saltHashVote'
import { getRegistry, getERC20Token } from '../config'
import { getProvider } from './provider'
import { currentTimestamp, wrapSend } from '../utils/utils'

const parameters = keyMirror({
  minDeposit: null,
  applyStageLen: null,
  voteQuorum: null,
  commitStageLen: null,
  revealStageLen: null
})

class RegistryService {
  constructor () {
    this.registry = null
    this.account = null
    this.address = null
  }

  async init () {
    /*
     * important to check for provider in
     * init function (rather than constructor),
     * so that injected web3 has time to load.
    */
    this.provider = getProvider()
    this.eth = new Eth(getProvider())
    const accounts = await this.eth.accounts()
    this.account = accounts[0]

    this.registry = await getRegistry(this.account)

    this.address = this.registry.address

    this.setUpEvents()
    this.setAccount()
    wrapSend(this, ['registry'])

    store.dispatch({
      type: 'REGISTRY_CONTRACT_INIT'
    })
  }

  async setUpEvents () {
    try {
      // websocket provider required for events
      // const provider = getWebsocketProvider()
      // const registry = await getRegistry(null, provider)
      this.registry.allEvents()
        .watch((error, log) => {
          if (error) {
            console.error(error)
            return false
          }
          store.dispatch({
            type: 'REGISTRY_EVENT',
            data: log
          })
        })
    } catch (error) {
      console.error(error)
    }
  }

  async setAccount () {
    const accounts = await this.eth.accounts()

    if (window.web3 && !window.web3.eth.defaultAccount) {
      window.web3.eth.defaultAccount = accounts[0]
    }
  }

  getAccount () {
    return this.account
  }

  // needBalance must be a BN
  async checkBalance (needBalance) {
    var vtxBalance = await token.getBalance()
    if (vtxBalance.lt(needBalance)) {
      throw new Error('Insufficient VTX balance')
    }
  }

  async apply (name) {
    if (!name) {
      throw new Error('Project name is required')
    }

    const exists = await this.applicationExists(name)

    if (exists) {
      throw new Error('Project name already exists')
    }

    var deposit = await this.getMinDeposit()
    await this.checkBalance(deposit)
    const allowed = await token.allowance(this.account, this.address)
    if (allowed.lt(deposit)) {
      try {
        await token.approve(this.address, deposit)
      } catch (error) {
        throw error
      }
    }

    try {
      await this.registry.apply(name, deposit.toString(), {from: this.account})
    } catch (error) {
      throw error
    }

    store.dispatch({
      type: 'REGISTRY_NAME_APPLY',
      name
    })
  }

  async challenge (name) {
    if (!name) {
      throw new Error('Project name is required')
    }

    try {
      let projectObj = await this.getListing(name)
      if (await this.isExpired(projectObj.applicationExpiry)) {
        throw new Error('Cannot challenge after application period')
      }
      let minDeposit = await this.getMinDeposit()
      await this.checkBalance(minDeposit)
      await token.approve(this.address, minDeposit)
      await this.registry.challenge(name)
    } catch (error) {
      throw error
    }

    store.dispatch({
      type: 'REGISTRY_PROJECT_CHALLENGE',
      name
    })
  }

  async didChallenge (name) {
    if (!name) {
      throw new Error('Project name is required')
    }

    let challengeId = null

    try {
      challengeId = await this.getChallengeId(name)
    } catch (error) {
      throw error
    }

    try {
      const challenge = await this.getChallenge(challengeId)
      return (challenge.challenger === this.account)
    } catch (error) {
      throw error
    }
  }

  async applicationExists (name) {
    if (!name) {
      throw new Error('Project name is required')
    }

    try {
      return this.registry.appWasMade.call(name)
    } catch (error) {
      throw error
    }
  }

  async getProjectStage (hash, projectObj) {
    if (projectObj.whitelisted) {
      return 'In Registry'
    } else if (await this.registry.canBeWhitelisted.call(projectObj.projectName)) {
      // can be whitelisted
      return 'Pending to Whitelist'
    } else if (projectObj.challengeId && projectObj.challengeId.toNumber() !== 0) {
      if (await plcr.commitStageActive(projectObj.challengeId)) {
        return 'In Voting Commit'
      } else if (await plcr.revealStageActive(projectObj.challengeId)) {
        return 'In Voting Reveal'
      } else if (await this.registry.challengeCanBeResolved.call(projectObj.projectName)) {
        return 'Pending to Resolve'
      }
    }
    if (!(await this.isExpired(projectObj.applicationExpiry))) {
      return 'In Application'
    }

    throw new Error(' Cannot identify project stage for project ' + projectObj.projectName)
  }

  getProjectAction (projectObj) {
    var actionMap = {
      'In Application': 'challenge',
      'In Voting Commit': 'commit',
      'In Voting Reveal': 'reveal',
      'Pending to Whitelist': 'whitelist',
      'Pending to Resolve': 'resolve challenge',
      'Unresolved': 'refresh status',
      'In Registry': 'view'
    }
    return actionMap[projectObj.stage]
  }

  async getProjectList () {
    var hashList = []
    var projectList = []
    var next = 0
    var num
    var projectObj
    let projectStateMap = {
      0: 'not-exist',
      1: 'submitted',
      2: 'accepted',
      3: 'token-sale',
      4: 'milestone',
      5: 'complete'
    }
    do {
      next = await this.registry.getNextProjectHash.call(next)
      num = new Eth.BN(next.substring(2), 16)
    } while (!num.eq(new Eth.BN('0')) && hashList.push(next))
    for (let hash of hashList) {
      projectObj = await this.getProjectInfo(hash)
      projectObj.stage = await this.getProjectStage(hash, projectObj)
      projectObj.hash = hash
      projectObj.didCommit = await this.didCommitForPoll(projectObj.challengeId.toNumber())
      projectObj.hasBeenRevealed = await plcr.hasBeenRevealed(this.account, projectObj.challengeId.toNumber())
      projectObj.action = this.getProjectAction(projectObj)
      projectObj.isOwner = this.isOwner(projectObj.owner)
      projectObj.minMsLength = await milestone.getMinLength()
      projectObj.ratingStageMinStartTime = await milestone.getRatingStageMinStartTime()
      projectObj.ratingStageMaxStartTime = await milestone.getRatingStageMaxStartTime()
      projectObj.refundStageMinStartTime = await milestone.getRefundStageMinStartTime()
      if (projectObj.action === 'view') {
        projectObj.controllerStage = await projectController.getProjectState(projectObj)
        projectObj.controllerStageStr = projectStateMap[projectObj.controllerStage.toNumber()]
        projectObj.etherCanLock = await projectController.getProjectEther(projectObj)
        if (projectObj.controllerStage.toNumber() >= 3) {
          projectObj.tokenInfo = await tokenSale.getTokenInfo(projectObj.projectName)
        }
        projectObj.inProgress = false
      }
      projectObj.tokenAddress = await projectController.getTokenAddress(projectObj)
      if (!(new Eth.BN(projectObj.tokenAddress.substring(2), 16)).eq(new Eth.BN('0'))) {
        projectObj.token = await getERC20Token(this.account, projectObj.tokenAddress)
        projectObj.balance = await projectObj.token.balanceOf.call(this.account)
      }
      projectList.push(projectObj)
    }

    return projectList
  }

  async getProjectInfo (hash) {
    if (!hash) {
      throw new Error('Project hash is required')
    }

    try {
      var propertyNameMap = {
        '0': 'applicationExpiry',
        '1': 'whitelisted',
        '2': 'owner',
        '3': 'unstakedDeposit',
        '4': 'challengeId',
        '5': 'projectName'
      }
      var projectData = await this.registry.listings.call(hash)
      var projectObj = {}
      for (let i = 0; i < projectData.length; i++) {
        projectObj[propertyNameMap[i]] = projectData[i]
      }
      projectObj.applicationExpiry = projectObj.applicationExpiry.toNumber()
      return projectObj
    } catch (error) {
      throw error
    }
  }

  // check if an application has expired
  async isExpired (timestamp) {
    let now = await currentTimestamp(false)
    return now >= timestamp
  }

  isOwner (address) {
    return address === this.account
  }

  async getListing (name) {
    if (!name) {
      throw new Error('Project name is required')
    }

    try {
      const hash = window.web3.sha3(name)
      var projectObj = await this.getProjectInfo(hash)
      projectObj.stage = await this.getProjectStage(hash, projectObj)
      projectObj.hash = hash
      return projectObj
    } catch (error) {
      throw error
    }
  }

  async getChallenge (challengeId) {
    if (!challengeId) {
      throw new Error('Challenge ID is required')
    }

    try {
      const challenge = await this.registry.challenges.call(challengeId.toString())
      const map = {
        // (remaining) pool of tokens distributed amongst winning voters
        rewardPool: challenge[0],
        // Challenge id
        challengeId: challenge[3],
        // owner of challenge
        challenger: challenge[4],
        // indication of if challenge is resolved
        resolved: challenge[5],
        // number of tokens at risk for either party during challenge
        stake: challenge[6],
        // (remaining) amount of tokens used for voting by the winning side
        winningTokens: challenge[7]
      }

      return map
    } catch (error) {
      throw error
    }
  }

  async getChallengeId (name) {
    if (!name) {
      throw new Error('Project name is required')
    }

    try {
      const listing = await this.getListing(name)

      const {
        challengeId
      } = listing

      return challengeId
    } catch (error) {
      throw error
    }
  }

  async updateStatus (name) {
    if (!name) {
      throw new Error('Project name is required')
    }

    try {
      const result = await this.registry.updateStatus(name)

      store.dispatch({
        type: 'REGISTRY_PROJECT_UPDATE_STATUS',
        name
      })

      return result
    } catch (error) {
      throw error
    }
  }

  async getParameter (name) {
    return new Promise(async (resolve, reject) => {
      if (!name) {
        reject(new Error('Parameter name is required'))
        return false
      }

      try {
        const value = await parameterizer.get(name)
        resolve(value)
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  getParameterKeys () {
    return Promise.resolve(parameters)
  }

  async getMinDeposit () {
    return this.getParameter('minDeposit')
  }

  async getCurrentBlockNumber () {
    return new Promise(async (resolve, reject) => {
      const result = await pify(window.web3.eth.getBlockNumber)()

      resolve(result)
    })
  }

  async getCurrentBlockTimestamp () {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await pify(window.web3.eth.getBlock)('latest')

        resolve(result.timestamp)
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  async getPlcrAddress () {
    try {
      return this.registry.voting.call()
    } catch (error) {
      throw error
    }
  }

  async commitVote (projectName, votes, voteOption, salt) {
    if (!projectName) {
      throw new Error('projectName is required')
    }

    const voteTokenBalance = await plcr.getTokenBalance()
    const requiredVotes = votes.minus(voteTokenBalance)
    await this.checkBalance(requiredVotes)

    let challengeId = null

    try {
      challengeId = await this.getChallengeId(projectName)
    } catch (error) {
      throw error
    }

    try {
      const hash = saltHashVote(voteOption, salt)

      await plcr.commit(challengeId, hash, votes)
    } catch (error) {
      throw error
    }
  }

  async revealVote (projectName, voteOption, salt) {
    let challengeId = null

    try {
      challengeId = await this.getChallengeId(projectName)
    } catch (error) {
      throw error
    }

    try {
      await plcr.reveal(challengeId, voteOption, salt)
    } catch (error) {
      throw error
    }
  }

  async getChallengePoll (name) {
    if (!name) {
      throw new Error('Project name is required')
    }

    try {
      const challengeId = await this.getChallengeId(name)
      return plcr.getPoll(challengeId)
    } catch (error) {
      throw error
    }
  }

  async didCommit (name) {

    try {
      const challengeId = await this.getChallengeId(name)
      return this.didCommitForPoll(challengeId)
    } catch (error) {
      throw error
    }
  }

  async didCommitForPoll (pollId) {
    try {
      const voter = this.account

      if (!voter) {
        return false
      }

      const hash = await plcr.getCommitHash(voter, pollId)
      let committed = false

      if (parseInt(hash, 16) !== 0) {
        committed = true
      }

      return committed
    } catch (error) {
      throw error
    }
  }

  async didReveal (name) {
    const voter = this.account

    if (!voter) {
      return false
    }

    try {
      const challengeId = await this.getChallengeId(name)

      if (!challengeId) {
        return false
      }

      return plcr.hasBeenRevealed(voter, challengeId)
    } catch (error) {
      throw error
    }
  }

  async didRevealForPoll (pollId) {
    try {
      if (!pollId) {
        return false
      }

      const voter = this.account

      if (!voter) {
        return false
      }

      return plcr.hasBeenRevealed(voter, pollId)
    } catch (error) {
      throw error
    }
  }

  async didClaim (name) {
    try {
      const challengeId = await this.getChallengeId(name)
      return await this.didClaimForPoll(challengeId)
    } catch (error) {
      throw error
    }
  }

  didClaimForPoll (challengeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const hasClaimed = await this.registry.tokenClaims.call(challengeId.toString(), this.account)
        resolve(hasClaimed)
      } catch (error) {
        reject(error)
      }
    })
  }

  claimReward (challengeId, salt) {
    return new Promise(async (resolve, reject) => {
      try {
        const voter = this.account
        const voterReward = await this.calculateVoterReward(voter, challengeId.toString(), salt)
        if (voterReward.isZero()) {
          reject(new Error('Account has no reward for challenge ID'))
          return false
        }

        await this.registry.claimReward(challengeId.toString(), salt)

        store.dispatch({
          type: 'REGISTRY_CLAIM_REWARD'
        })

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  calculateVoterReward (voter, challengeId, salt) {
    return new Promise(async (resolve, reject) => {
      try {
        const reward = await this.registry.voterReward.call(voter, challengeId, salt)

        resolve(reward)
      } catch (error) {
        reject(error)
      }
    })
  }

  async requestVotingRights (votes) {
    await token.approve(plcr.address, votes.toString())
    await plcr.requestVotingRights(votes)
  }

  async getTotalVotingRights () {
    return plcr.getTokenBalance()
  }

  async getAvailableTokensToWithdraw () {
    return plcr.getAvailableTokensToWithdraw()
  }

  async getLockedTokens () {
    return plcr.getLockedTokens()
  }

  async withdrawVotingRights (tokens) {
    if (!tokens) {
      throw new Error('Number of tokens required')
    }

    return plcr.withdrawVotingRights(tokens)
  }

  async approveTokens (tokens) {
    return token.approve(this.address, tokens)
  }

  async getTokenAllowance () {
    return token.allowance(this.account, this.address)
  }

  async getTransaction (tx) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await pify(window.web3.eth.getTransaction)(tx)
        resolve(result)
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  async getTransactionReceipt (tx) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await pify(window.web3.eth.getTransactionReceipt)(tx)
        resolve(result)
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  async getEthBalance () {
    if (!window.web3) {
      return 0
    }

    return pify(window.web3.eth.getBalance)(this.account)
  }

  async getNetwork () {
    return detectNetwork(this.provider)
  }
}

export default new RegistryService()
