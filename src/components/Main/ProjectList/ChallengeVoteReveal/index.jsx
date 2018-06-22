import React, { Component } from 'react'
import toastr from 'toastr'
import moment from 'moment'
import { Radio, Popup } from 'semantic-ui-react'

import Countdown from '../Countdown'
import registry from '../../../../services/registry'
import InProgress from '../../InProgress'
import { wrapWithTransactionInfo } from '../../../../utils/utils'
import './styles.css'

class ChallengeVoteReveal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      account: registry.getAccount(),
      applicationExpiry: props.project.applicationExpiry,
      votesFor: 0,
      votesAgainst: 0,
      commitEndDate: null,
      revealEndDate: null,
      inProgress: false,
      didChallenge: false,
      didCommit: false,
      didReveal: false,
      salt: null,
      voteOption: null,
      challengeId: props.project.challengeId,
      stage: props.stage
    }

    this.onVoteOptionChange = this.onVoteOptionChange.bind(this)
    this.onFileInput = this.onFileInput.bind(this)
    this.reveal = this.reveal.bind(this)
  }

  componentDidMount () {
    this._isMounted = true

    this.getPoll()
    this.getChallenge()
    this.getCommit()
    this.getReveal()
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  render () {
    const {
      revealEndDate,
      inProgress,
      didChallenge,
      didCommit,
      didReveal,
      voteOption,
      salt
    } = this.state

    const stageEndMoment = revealEndDate ? moment.unix(revealEndDate) : null
    const stageEnd = stageEndMoment ? stageEndMoment.format('YYYY-MM-DD HH:mm:ss') : '-'

    return (
      <div className='vote-reveal'>
        <div className='ui grid stackable'>
          <div className='column sixteen wide'>
            <div className='ui large header center aligned'>
              {this.state.stage}
              <Popup
                trigger={<i className='icon info circle' />}
                content='The second phase of the voting process is the reveal phase where the VTX holders reveal their previous commits.'
              />
            </div>
          </div>
          {didChallenge &&
            <div className='column sixteen wide center aligned'>
              <div className='ui message warning'>
                You've <strong>challenged</strong> this project.
              </div>
            </div>
          }
          {didCommit &&
            <div className='column sixteen wide center aligned'>
              <div className='ui message warning'>
                You've <strong>commited</strong> for this project.
              </div>
            </div>
          }
          {didReveal &&
            <div className='column sixteen wide center aligned'>
              <div className='ui message warning'>
                You've <strong>revealed</strong> for this project.
              </div>
            </div>
          }
          <div className='column sixteen wide center aligned'>
            <div className='ui divider' />
            <div className='column sixteen wide center aligned'>
              <div className='ui message info'>
                <p>
                  Reveal stage ends
                </p>
                <p><strong>{stageEnd}</strong></p>
                <p>Remaining time: {revealEndDate && <Countdown
                  endDate={stageEndMoment}
                  onExpire={this.onCountdownExpire.bind(this)} />}</p>
              </div>
            </div>
            <div className='ui divider' />
            { !didReveal &&
              <div className='column sixteen wide center aligned'>
                <form
                  onSubmit={wrapWithTransactionInfo('vote-reveal', this.reveal)}
                  className='ui form'>
                  <div className='ui field'>
                    <label>Upload Commit File to reveal vote</label>
                    <input
                      type='file'
                      name='file'
                      onChange={this.onFileInput}
                      className='ui file' />
                  </div>
                  <div className='ui field'>
                    or
                  </div>
                  <div className='ui field'>
                    <label>Secret Phrase (salt)</label>
                    <div className='ui input small'>
                      <input
                        type='text'
                        placeholder='phrase'
                        id='DomainVoteRevealContainerSaltInput'
                        defaultValue={salt}
                        onKeyUp={event => this.setState({salt: parseInt(event.target.value, 10)})}
                      />
                    </div>
                  </div>
                  <div className='ui field'>
                    <label>Vote Option<br /><small>must be what you committed</small></label>
                  </div>
                  <div className='ui two fields VoteOptions'>
                    <div className='ui field'>
                      <Radio
                        label='SUPPORT'
                        name='voteOption'
                        value='1'
                        checked={voteOption === 1}
                        onChange={this.onVoteOptionChange}
                      />
                    </div>
                    <div className='ui field'>
                      <Radio
                        label='OPPOSE'
                        name='voteOption'
                        value='0'
                        checked={voteOption === 0}
                        onChange={this.onVoteOptionChange}
                      />
                    </div>
                  </div>
                  <div className='ui field'>
                    {voteOption === null
                      ? <button
                        className='ui button disabled'>
                          Select Vote Option
                      </button>
                      : <button
                        type='submit'
                        className={`ui button ${voteOption ? 'blue' : 'purple'} right labeled icon`}>
                        REVEAL {voteOption ? 'SUPPORT' : 'OPPOSE'} VOTE
                        <i className={`icon thumbs ${voteOption ? 'up' : 'down'}`} />
                      </button>
                    }
                  </div>
                </form>
              </div>
            }
          </div>
        </div>
        {inProgress ? <InProgress /> : null}
      </div>
    )
  }

  onVoteOptionChange (event, { value }) {
    this.setState({
      voteOption: parseInt(value, 10)
    })
  }

  async getCommit () {
    const {account} = this.state

    if (!account) {
      return false
    }

    try {
      const didCommit = await registry.didCommit(this.props.project.projectName)

      if (this._isMounted) {
        this.setState({
          didCommit: didCommit
        })
      }
    } catch (error) {
      toastr.error(error)
    }
  }

  async getReveal () {
    const {account} = this.state

    if (!account) {
      return false
    }

    try {
      const didReveal = await registry.didReveal(this.props.project.projectName)

      if (this._isMounted) {
        this.setState({
          didReveal: didReveal
        })
      }
    } catch (error) {
      toastr.error(error)
    }
  }

  async getPoll () {
    try {
      const {
        votesFor,
        votesAgainst,
        commitEndDate,
        revealEndDate
      } = await registry.getChallengePoll(this.props.project.projectName)

      if (this._isMounted) {
        this.setState({
          votesFor,
          votesAgainst,
          commitEndDate,
          revealEndDate
        })
      }
    } catch (error) {
      toastr.error(error)
    }
  }

  async getChallenge () {
    const {account} = this.state

    if (!account) {
      return false
    }

    try {
      const didChallenge = await registry.didChallenge(this.props.project.projectName)

      if (this._isMounted) {
        this.setState({
          didChallenge
        })
      }
    } catch (error) {
      toastr.error(error)
    }
  }

  async reveal () {
    const {salt, voteOption} = this.state

    if (!salt) {
      toastr.error('Please enter salt value')
      return false
    }

    if (voteOption === null) {
      toastr.error('Please select a vote option')
      return false
    }

    if (this._isMounted) {
      this.setState({
        inProgress: true
      })
    }

    try {
      const projectName = this.props.project.projectName
      const revealed = await registry.revealVote(projectName, voteOption, salt)

      if (this._isMounted) {
        this.setState({
          inProgress: false
        })
      }

      if (revealed) {
        toastr.success('Successfully revealed')

        // TODO: better way of resetting state
        setTimeout(() => {
          window.location.reload()
        }, 2e3)
      } else {
        toastr.error('Reveal did not go through')
      }
    } catch (error) {
      toastr.error(error.message)

      if (this._isMounted) {
        this.setState({
          inProgress: false
        })
      }
    }
  }

  onFileInput (event) {
    event.preventDefault()
    const file = event.target.files[0]
    const fr = new window.FileReader()

    fr.onload = () => {
      const contents = fr.result

      try {
        const {salt, voteOption} = JSON.parse(contents)

        if (this._isMounted) {
          this.setState({
            salt,
            voteOption
          })
        }

        // TODO: proper way of setting defaultValue
        const saltInput = document.querySelector('#DomainVoteRevealContainerSaltInput')
        if (saltInput) {
          saltInput.value = salt
        }
      } catch (error) {
        toastr.error('Invalid Commit JSON file')
        return false
      }
    }

    fr.readAsText(file)
  }

  onCountdownExpire () {
    // allow some time for new block to get mined and reload page
    setTimeout(() => {
      window.location.reload()
    }, 15000)
  }
}

export default ChallengeVoteReveal
