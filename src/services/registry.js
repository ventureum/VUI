import Eth from 'ethjs'
import sha3 from 'solidity-sha3'
import { promisify as pify } from 'bluebird'
import keyMirror from 'key-mirror'
import detectNetwork from 'web3-detect-network'

import store from '../store'
import token from './token'
import plcr from './plcr'
import parameterizer from './parameterizer'
import saltHashVote from '../utils/saltHashVote'
import { getRegistry } from '../config'
import { getProvider } from './provider'

// TODO: check number param
const big = (number) => new Eth.BN(number.toString(10))
const tenToTheNinth = big(10).pow(big(9))
const tenToTheEighteenth = big(10).pow(big(18))

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

  // needBalance must be a JS number, not a BigNumber object
  async checkBalance (needBalance) {
    var vthBalance = await token.getBalance() || 0
    if (vthBalance < needBalance) {
      throw new Error('Insufficient VTH balance')
    }
  }
  
  async apply (name, deposit = 50000) {
    if (!name) {
      throw new Error('Project name is required')
    }

    const exists = await this.applicationExists(name)

    if (exists) {
      throw new Error('Project name already exists')
    }

    await this.checkBalance(deposit)

    deposit = big(deposit).mul(tenToTheEighteenth).toString(10)
    const allowed = (await token.allowance(this.account, this.address)).toString(10)

    if (allowed < deposit) {
      try {
        await token.approve(this.address, deposit)
      } catch (error) {
        throw error
      }
    }

    try {
      await this.registry.apply(name, deposit, {from: this.account})
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
      let minDeposit = await this.getMinDeposit()
      await this.checkBalance(minDeposit)
      minDeposit = (new Eth.BN(minDeposit)).mul(tenToTheEighteenth).toString(10)
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

  async didChallenge (domain) {
    if (!domain) {
      throw new Error('Domain is required')
    }

    domain = domain.toLowerCase()
    let challengeId = null

    try {
      challengeId = await this.getChallengeId(domain)
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
      return this.registry.appWasMade(name)
    } catch (error) {
      throw error
    }
  }

  async getProjectStage (hash, projectObj) {
    var stage
    if (projectObj.whitelisted) {
      stage = 'In Registry'
    } else {
      if (projectObj.challengeId) {
        var commitActive = await plcr.commitStageActive(projectObj.challengeId)
        if (!commitActive) {
          var revealActive = await plcr.revealStageActive(projectObj.challengeId)
          if (revealActive) {
            stage = 'In Voting Reveal'
          } else {
            var canWhitelist = await this.registry.canBeWhitelisted(projectObj.projectName)
            if (canWhitelist) {
              stage = 'Pending to Whitelist'
            } else {
              var canResolve = await this.registry.challengeCanBeResolved(projectObj.projectName)
              if (canResolve) {
                stage = 'Pending to Resolve'
              } else {
                stage = 'Unresolved'
              }
            }
          }
        } else {
          stage = 'In Voting Commit'
        }
      } else {
        stage = 'In Application'
      }
    }

    return stage
  }

  async getProjectList () {
    var hashList = []
    var projectList = []
    var next = 0
    var num
    var projectObj
    do {
      next = await this.registry.getNextProjectHash.call(next)
      num = new Eth.BN(next.substring(2), 16)
    } while (!num.eq(new Eth.BN('0')) && hashList.push(next))
    for (let hash of hashList) {
      projectObj = await this.getProjectInfo(hash)
      projectObj.stage = await this.getProjectStage(hash, projectObj)
      projectObj.hash = hash
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
        if (projectData[i].constructor.name === 'BigNumber') {
          projectObj[propertyNameMap[i]] = projectData[i].toNumber()
        } else {
          projectObj[propertyNameMap[i]] = projectData[i]
        }
      }
      return projectObj
    } catch (error) {
      throw error
    }
  }

  async getListing (name) {
    if (!name) {
      throw new Error('Project name is required')
    }

    try {
      const hash = sha3(name)
      var projectObj = this.getProjectInfo(hash)
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
      const challenge = await this.registry.challenges.call(challengeId)
      const map = {
        // (remaining) pool of tokens distributed amongst winning voters
        rewardPool: challenge[0] ? challenge[0].toNumber() : 0,
        // owner of challenge
        challenger: challenge[1],
        // indication of if challenge is resolved
        resolved: challenge[2],
        // number of tokens at risk for either party during challenge
        stake: challenge[3] ? challenge[3].toNumber() : 0,
        // (remaining) amount of tokens used for voting by the winning side
        totalTokens: challenge[4]
      }

      return map
    } catch (error) {
      throw error
    }
  }

  async getChallengeId (domain) {
    if (!domain) {
      throw new Error('Domain is required')
    }

    domain = domain.toLowerCase()

    try {
      const listing = await this.getListing(domain)

      const {
        challengeId
      } = listing

      return challengeId
    } catch (error) {
      throw error
    }
  }

  async isWhitelisted (domain) {
    if (!domain) {
      throw new Error('Domain is required')
    }

    domain = domain.toLowerCase()

    try {
      return this.registry.isWhitelisted.call(domain)
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
    return (await this.getParameter('minDeposit')).div(tenToTheEighteenth).toNumber()
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

  async commitStageActive (domain) {
    if (!domain) {
      throw new Error('Domain is required')
    }

    domain = domain.toLowerCase()
    let pollId = null

    try {
      pollId = await this.getChallengeId(domain)
    } catch (error) {
      throw error
    }

    if (!pollId) {
      return false
    }

    try {
      return plcr.commitStageActive(pollId)
    } catch (error) {
      throw error
    }
  }

  async revealStageActive (domain) {
    if (!domain) {
      throw new Error('Domain is required')
    }

    domain = domain.toLowerCase()
    let pollId = null

    try {
      pollId = await this.getChallengeId(domain)
    } catch (error) {
      throw error
    }

    if (!pollId) {
      return false
    }

    try {
      return plcr.revealStageActive(pollId)
    } catch (error) {
      throw error
    }
  }

  async commitVote ({projectName, votes, voteOption, salt}) {
    if (!projectName) {
      throw new Error('projectName is required')
    }

    await this.checkBalance(votes)

    // atto VTH to VTH
    const bigVotes = big(votes).mul(tenToTheEighteenth).toString(10)

    let challengeId = null

    try {
      challengeId = await this.getChallengeId(projectName)
    } catch (error) {
      throw error
    }

    try {
      const hash = saltHashVote(voteOption, salt)

      await plcr.commit({pollId: challengeId, hash, tokens: bigVotes})
      return this.didCommitForPoll(challengeId)
    } catch (error) {
      throw error
    }
  }

  async revealVote ({projectName, voteOption, salt}) {
    let challengeId = null

    try {
      challengeId = await this.getChallengeId(projectName)
    } catch (error) {
      throw error
    }

    try {
      await plcr.reveal({pollId: challengeId, voteOption, salt})
      return this.didRevealForPoll(challengeId)
    } catch (error) {
      throw error
    }
  }

  async getChallengePoll (domain) {
    if (!domain) {
      throw new Error('Domain is required')
    }

    domain = domain.toLowerCase()

    try {
      const challengeId = await this.getChallengeId(domain)
      return plcr.getPoll(challengeId)
    } catch (error) {
      throw error
    }
  }

  async pollEnded (domain) {
    domain = domain.toLowerCase()
    const challengeId = await this.getChallengeId(domain)

    if (!challengeId) {
      return false
    }

    try {
      return plcr.pollEnded(challengeId)
    } catch (error) {
      throw error
    }
  }

  async getCommitHash (domain) {
    domain = domain.toLowerCase()
    const voter = this.account

    if (!voter) {
      return false
    }

    try {
      const challengeId = await this.getChallengeId(domain)
      return plcr.getCommitHash(voter, challengeId)
    } catch (error) {
      throw error
    }
  }

  async didCommit (domain) {
    domain = domain.toLowerCase()

    try {
      const challengeId = await this.getChallengeId(domain)
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

  async didReveal (domain) {
    domain = domain.toLowerCase()

    const voter = this.account

    if (!voter) {
      return false
    }

    try {
      const challengeId = await this.getChallengeId(domain)

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

  voterHasEnoughVotingTokens (tokens) {
    return plcr.hasEnoughTokens(tokens)
  }

  async didClaim (domain) {
    try {
      const challengeId = await this.getChallengeId(domain)
      return await this.didClaimForPoll(challengeId)
    } catch (error) {
      throw error
    }
  }

  didClaimForPoll (challengeId) {
    return new Promise(async (resolve, reject) => {
      try {
        const hasClaimed = await this.registry.tokenClaims(challengeId, this.account)
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
        const voterReward = (await this.calculateVoterReward(voter, challengeId, salt)).toNumber()

        if (voterReward <= 0) {
          reject(new Error('Account has no reward for challenge ID'))
          return false
        }

        await this.registry.claimReward(challengeId, salt)

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
        const reward = await this.registry.voterReward(voter, challengeId, salt)

        resolve(reward)
      } catch (error) {
        reject(error)
      }
    })
  }

  async requestVotingRights (votes) {
    // normal VTH to nano VTH
    const tokens = big(votes).mul(tenToTheNinth).toString(10)

    await token.approve(plcr.address, tokens)
    await plcr.requestVotingRights(tokens)
  }

  async getTotalVotingRights () {
    const tokens = await plcr.getTokenBalance()
    return big(tokens).div(tenToTheNinth)
  }

  async getAvailableTokensToWithdraw () {
    const tokens = await plcr.getAvailableTokensToWithdraw()
    return big(tokens).div(tenToTheNinth)
  }

  async getLockedTokens () {
    const tokens = await plcr.getLockedTokens()
    return big(tokens).div(tenToTheNinth)
  }

  async withdrawVotingRights (tokens) {
    if (!tokens) {
      throw new Error('Number of tokens required')
    }

    tokens = big(tokens).mul(tenToTheNinth).toString(10)

    await plcr.withdrawVotingRights(tokens)

    return true
  }

  async approveTokens (tokens) {
    const bigTokens = big(tokens).mul(tenToTheNinth).toString(10)

    return token.approve(this.address, bigTokens)
  }

  async transferTokens (tokens) {
    const bigTokens = big(tokens).mul(tenToTheNinth).toString(10)

    // TODO
  }

  async getTokenAllowance () {
    const allowed = await token.allowance(this.account, this.address)
    const bigTokens = big(allowed).div(tenToTheNinth)
    return bigTokens
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

    const result = await pify(window.web3.eth.getBalance)(this.account)
    return result.div(tenToTheEighteenth)
  }

  async getNetwork () {
    return detectNetwork(this.provider)
  }
}

export default new RegistryService()
