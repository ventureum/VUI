import Eth from 'ethjs'
import { getProvider } from './provider'
import { promisify as pify } from 'bluebird'

import { getPLCR } from '../config'
import token from './token'
import store from '../store'
import { wrapSend } from '../utils/utils'

/**
 * PollId = ChallengeId
 */

class PlcrService {
  constructor () {
    this.plcr = null
    this.address = null
  }

  async init () {
    /* important to check for provider in
     * init function (rather than constructor),
     * so that injected web3 has time to load.
     */
    this.eth = new Eth(getProvider())
    const accounts = await this.eth.accounts()
    this.account = accounts[0]
    this.plcr = await getPLCR(this.account)
    this.address = this.plcr.address
    this.setUpEvents()
    wrapSend(this, ['plcr'])

    store.dispatch({
      type: 'PLCR_CONTRACT_INIT'
    })
  }

  setUpEvents () {
    this.plcr.allEvents()
      .watch((error, log) => {
        if (error) {
          console.error(error)
          return false
        }

        store.dispatch({
          type: 'PLCR_EVENT'
        })
      })
  }

  async getPoll (pollId) {
    return new Promise(async (resolve, reject) => {
      if (!pollId) {
        reject(new Error('Poll ID is required'))
        return false
      }

      try {
        const result = await this.plcr.pollMap.call(pollId.toString())

        const map = {
          // expiration date of commit stage for poll
          commitEndDate: result[0],
          // expiration date of reveal stage for poll
          revealEndDate: result[1],
          // number of votes required for a proposal to pass
          voteQuorum: result[2],
          // tally of votes supporting proposal
          votesFor: result[3],
          // tally of votes countering proposal
          votesAgainst: result[4]
        }
        resolve(map)
        return false
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  async commitStageActive (pollId) {
    return new Promise(async (resolve, reject) => {
      if (!pollId) {
        reject(new Error('Poll ID is required'))
        return false
      }

      try {
        const result = await this.plcr.commitStageActive.call(pollId.toString())
        resolve(result)
        return false
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  async revealStageActive (pollId) {
    return new Promise(async (resolve, reject) => {
      if (!pollId) {
        reject(new Error('Poll ID is required'))
        return false
      }

      try {
        const result = await this.plcr.revealStageActive.call(pollId.toString())
        resolve(result)
        return false
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  async commit (pollId, hash, tokens) {
    return new Promise(async (resolve, reject) => {
      if (!pollId) {
        reject(new Error('Poll ID is required'))
        return false
      }

      if (!hash) {
        reject(new Error('Hash is required'))
        return false
      }

      if (!tokens) {
        reject(new Error('Tokens are required'))
        return false
      }

      let active = null

      try {
        active = await this.commitStageActive(pollId.toString())
      } catch (error) {
        reject(error)
        return false
      }

      if (!active) {
        reject(new Error('Commit stage should be active'))
        return false
      }

      const voteTokenBalance = await this.plcr.voteTokenBalance.call(this.getAccount())
      const requiredVotes = tokens.minus(voteTokenBalance)

      if (tokens.gt(voteTokenBalance)) {
        try {
          await token.approve(this.address, requiredVotes.toString())
        } catch (error) {
          reject(error)
          return false
        }

        try {
          await this.plcr.requestVotingRights(requiredVotes.toString())
        } catch (error) {
          reject(error)
          return false
        }
      }

      try {
        const prevPollId =
              await this.plcr.getInsertPointForNumTokens.call(this.getAccount(), tokens.toString())
        const result = await this.plcr.commitVote(pollId.toString(), hash, tokens.toString(), prevPollId)

        store.dispatch({
          type: 'PLCR_VOTE_COMMIT',
          pollId
        })

        resolve(result)
        return false
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  async reveal (pollId, voteOption, salt) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.plcr.revealVote(pollId.toString(), voteOption, salt)

        store.dispatch({
          type: 'PLCR_VOTE_REVEAL',
          pollId
        })

        resolve()
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  requestVotingRights (tokens) {
    const result = this.plcr.requestVotingRights(tokens.toString())

    store.dispatch({
      type: 'PLCR_REQUEST_VOTING_RIGHTS',
      tokens
    })

    return result
  }

  async getTokensCommited (pollId) {
    return new Promise(async (resolve, reject) => {
      try {
        const numTokens = await this.plcr.getNumTokens.call(this.account, pollId.toString())
        resolve(numTokens)
        return false
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  async getCommitHash (voter, pollId) {
    return new Promise(async (resolve, reject) => {
      try {
        const hash = await this.plcr.getCommitHash.call(voter, pollId.toString())
        resolve(hash)
      } catch (error) {
        reject(error)
      }
    })
  }

  async hasBeenRevealed (voter, pollId) {
    return new Promise(async (resolve, reject) => {
      if (!pollId) {
        resolve(false)
        return false
      }

      try {
        const didReveal = await this.plcr.hasBeenRevealed.call(voter, pollId.toString())

        resolve(didReveal)
      } catch (error) {
        reject(error)
      }
    })
  }

  async getTransactionReceipt (tx) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await pify(window.web3.eth.getTransactionReceipt)(tx)
        resolve(result)
        return false
      } catch (error) {
        reject(error)
        return false
      }
    })
  }

  async withdrawVotingRights (tokens) {
    await this.plcr.withdrawVotingRights(tokens.toString())

    store.dispatch({
      type: 'PLCR_WITHDRAW_VOTING_RIGHTS',
      tokens
    })
  }

  async getTokenBalance () {
    return this.plcr.voteTokenBalance.call(this.account)
  }

  async getAvailableTokensToWithdraw () {
    const balance = await this.plcr.voteTokenBalance.call(this.account)
    const lockedTokens = await this.plcr.getLockedTokens.call(this.account)
    const availableTokens = balance.sub(lockedTokens)

    // return the number of available tokens in BN
    return availableTokens
  }

  async getLockedTokens () {
    const lockedTokens = await this.plcr.getLockedTokens.call(this.account)

    return lockedTokens
  }

  getAccount () {
    if (!window.web3) {
      return null
    }

    return window.web3.eth.defaultAccount
  }

  async unlock (id) {
    await this.plcr.rescueTokens(id)
  }
}

export default new PlcrService()
