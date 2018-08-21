import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import PropTypes from 'prop-types'
import toastr from 'toastr'
import { Popup } from 'semantic-ui-react'
import { BigNumber } from 'bignumber.js'
import registry from '../../../../services/registry'
import InProgress from '../../InProgress'
import styles from './styles.css'
import { wrapWithTransactionInfo } from '../../../../utils/utils'

class ChallengeClaimReward extends Component {
  constructor (props) {
    super()

    this.state = {
      account: registry.getAccount(),
      claimChallengeId: null,
      claimSalt: null,
      didClaim: false,
      inProgress: false
    }

    this.onFileInput = this.onFileInput.bind(this)
    this.claimReward = this.claimReward.bind(this)
  }

  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  render () {
    const {
      inProgress,
      claimSalt,
      claimChallengeId
    } = this.state

    return (
      <div className='challenge-claim-reward-container'>
        <div className='ui grid stackable center aligned'>
          <div className='column sixteen wide'>
            <div>
              <form
                onSubmit={wrapWithTransactionInfo('claim-reward', this.claimReward)}
                className='ui form'>
                <div className='ui field'>
                  <p>
                    Claim Reward
                    <Popup
                      trigger={<i className='icon info circle' />}
                      content='Voters in the winning party can claim their token rewards by proving the challenge ID (poll ID) and secret phase (salt).'
                    />
                  </p>
                </div>
                <div className='ui field'>
                  <label><small>Upload Commit File</small></label>
                  <input
                    type='file'
                    name='file'
                    onChange={this.onFileInput}
                    className='ui file' />
                </div>
                <div className='ui field'>
                  <small>or</small>
                </div>
                <div className='ui field'>
                  <label><small>Challenge ID</small></label>
                  <div className='ui input small'>
                    <input
                      type='text'
                      placeholder='challenge ID'
                      id='ChallengeClaimRewardChallengeIdInput'
                      defaultValue={claimChallengeId}
                      onKeyUp={event => this.setState({claimChallengeId: parseInt(event.target.value, 10)})}
                    />
                  </div>
                </div>
                <div className='ui field'>
                  <label><small>Secret Phrase (salt)</small></label>
                  <div className='ui input small'>
                    <input
                      type='text'
                      placeholder='phrase'
                      id='ChallengeClaimRewardSaltInput'
                      defaultValue={claimSalt}
                      onKeyUp={event => this.setState({claimSalt: parseInt(event.target.value, 10)})}
                    />
                  </div>
                </div>
                <div className='ui field'>
                  <button
                    type='submit'
                    className='ui button blue right labeled icon tiny'>
                    Claim Reward
                    <i className='icon certificate' />
                  </button>
                </div>
              </form>
              {inProgress ? <InProgress /> : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  onFileInput (event) {
    event.preventDefault()
    const file = event.target.files[0]
    const fr = new window.FileReader()

    fr.onload = () => {
      const contents = fr.result

      try {
        const {
          salt,
          challengeId
        } = JSON.parse(contents)

        if (this._isMounted) {
          this.setState({
            claimSalt: salt,
            claimChallengeId: challengeId
          })
        }

        const saltInput = document.querySelector('#ChallengeClaimRewardSaltInput')
        if (saltInput) {
          saltInput.value = salt
        }

        const challengeIdInput = document.querySelector('#ChallengeClaimRewardChallengeIdInput')
        if (challengeIdInput) {
          challengeIdInput.value = challengeId
        }
      } catch (error) {
        toastr.error('Invalid Commit JSON file')
        return false
      }
    }

    fr.readAsText(file)
  }

  async claimReward () {
    const {
      claimChallengeId,
      claimSalt
    } = this.state

    if (!claimChallengeId) {
      toastr.error('Challenge ID is required')
      return false
    }

    if (!claimSalt) {
      toastr.error('Salt is required')
      return false
    }

    const alreadyClaimed = await registry.didClaimForPoll(new BigNumber(claimChallengeId))

    if (alreadyClaimed) {
      toastr.error('You have already claimed!')
      return false
    }

    try {
      if (this._isMounted) {
        this.setState({
          inProgress: true
        })
      }

      await registry.claimReward(new BigNumber(claimChallengeId), claimSalt)
      toastr.success('Transaction sent')

      setTimeout(() => {
        window.location.reload()
      }, 1e3)
    } catch (error) {
      toastr.error(error)
    }

    if (this._isMounted) {
      this.setState({
        inProgress: false
      })
    }
  }
}

ChallengeClaimReward.propTypes = {
  domain: PropTypes.string
}

export default CSSModules(ChallengeClaimReward, styles)
