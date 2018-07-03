import React, { Component } from 'react'
import toastr from 'toastr'
import moment from 'moment'
import { Radio, Popup } from 'semantic-ui-react'
import randomInt from 'random-int'
import commafy from 'commafy'

import saveFile from '../../../../utils/saveFile'
import generateReminder from '../../../../utils/generateReminder'
import Countdown from '../Countdown'
import registry from '../../../../services/registry'
import InProgress from '../../InProgress'
import { BigNumber } from 'bignumber.js'
import { toStandardUnit, toBasicUnit, wrapWithTransactionInfo } from '../../../../utils/utils'

import './styles.css'

class ChallengeVoteCommit extends Component {
  constructor (props) {
    super(props)

    const salt = randomInt(1e6, 1e8)

    this.state = {
      projectName: props.project.projectName,
      votes: 0,
      applicationExpiry: props.project.applicationExpiry,
      challengeId: props.project.challengeId,
      challenge: null,
      commitEndDate: null,
      revealEndDate: null,
      didChallenge: null,
      didCommit: null,
      inProgress: false,
      salt,
      voteOption: null,
      enableDownload: false,
      commitDownloaded: false,
      revealReminderDownloaded: false,
      stage: props.stage
    }

    this.onDepositKeyUp = this.onDepositKeyUp.bind(this)
    this.onVoteOptionChange = this.onVoteOptionChange.bind(this)
    this.onDownload = this.onDownload.bind(this)
    this.onReminderDownload = this.onReminderDownload.bind(this)
    this.enableDownloadCheck = this.enableDownloadCheck.bind(this)
    this.commit = this.commit.bind(this)
  }

  componentDidMount () {
    this._isMounted = true

    this.getPoll()
    this.getChallenge()
    this.getCommit()
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  componentWillUpdate () {
    setTimeout(() => {
      this.enableDownloadCheck()
    }, 0)
  }

  // JS function toFixed() will round 4.999999999 to 5
  // which will confuse user if they have 4.99999999 vtx and apply need 5
  // thus use this function to keep accuracy
  toFixed (num, fixed) {
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?') // eslint-disable-line
    return num.toString().match(re)[0]
  }

  render () {
    const {
      commitEndDate,
      didChallenge,
      didCommit,
      inProgress,
      salt,
      voteOption,
      challengeId,
      challenge,
      enableDownload,
      commitDownloaded,
      votes,
      revealReminderDownloaded,
      stage
    } = this.state

    const stageEndMoment = commitEndDate ? moment.unix(commitEndDate) : null
    const stageEnd = stageEndMoment ? stageEndMoment.format('YYYY-MM-DD HH:mm:ss') : '-'

    return (
      <div className='vote-commit'>
        <div className='ui grid stackable'>
          <div className='column sixteen wide'>
            <div className='ui large header center aligned'>
              {stage}
              <Popup
                trigger={<i className='icon info circle' />}
                content='The first phase of the voting process is the commit phase where the VTX holder stakes a hidden amount of votes. The second phase is the reveal phase where the VTX holder reveals the staked amount of votes to either the SUPPORT or OPPOSE side.'
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
          <div className='column sixteen wide center aligned'>
            <div className='ui divider' />
            <div className='column sixteen wide center aligned'>
              <div className='ui message info'>
                <p>
                  Voting commit stage ends
                </p>
                <p><strong>{stageEnd}</strong></p>
                <p>Remaining time: {commitEndDate && <Countdown
                  endDate={stageEndMoment}
                  onExpire={this.onCountdownExpire.bind(this)} />}</p>
              </div>
            </div>
            <div className='ui divider' />
            <div className='column sixteen wide center aligned'>
              <form
                onSubmit={wrapWithTransactionInfo('vote-commit', this.commit)}
                className='ui form center aligned'>
                {stage === 'In Voting Commit' && challenge &&
                <div>
                  <div className='ui field'>
                    <p>Challenge ID: <label className='ui label'>{challengeId.toNumber()}</label></p>
                  </div>
                  <div className='ui field'>
                    <p>Challenger: <label className='ui label'>{challenge.challenger}</label></p>
                  </div>
                  <div className='ui field'>
                    <p>Reward Pool: <label className='ui label'>{commafy(this.toFixed(toStandardUnit(challenge.rewardPool).toNumber(), 4))} VTX</label></p>
                  </div>
                </div>
                }
                { !didCommit &&
                  <div>
                    <div className='ui field'>
                      <label>Enter Votes to Commit</label>
                      <div className='ui input small'>
                        <input
                          type='text'
                          placeholder='100'
                          onKeyUp={this.onDepositKeyUp}
                        />
                      </div>
                    </div>
                    <div className='ui field'>
                      <label>Vote Option</label>
                    </div>
                    {stage === 'In Voting Commit' &&
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
                    }
                    <div className='ui field'>
                      <label>Secret Phrase<br /><small>PLEASE SAVE THIS. This random phrase (known as a "salt") will be required to reveal your vote and claim rewards.</small></label>
                      <div className='ui message tiny default SaltField'>
                        {salt}
                      </div>
                    </div>
                    <div className='ui field'>
                      <label><small>Download commit info required for reveal stage</small></label>
                      <button
                        onClick={this.onDownload}
                        title='Download commit info'
                        className={`ui button ${enableDownload ? '' : 'disabled'} right labeled icon ${commitDownloaded ? 'default' : 'blue'}`}>
                        Download Commit
                        <i className='icon download' />
                      </button>
                    </div>
                    {commitDownloaded
                      ? <div className='ui field'>
                        <label><small>Download a calendar reminder for revealing vote</small></label>
                        <button
                          onClick={this.onReminderDownload}
                          title='Download commit info'
                          className={`ui mini button right labeled icon ${revealReminderDownloaded ? 'default' : 'blue'}`}>
                         Reveal Reminder
                          <i className='icon download' />
                        </button>
                      </div>
                      : null
                    }
                    <div className='ui field'>
                      {(voteOption === null || !votes || !commitDownloaded)
                        ? <button className='ui button disabled'>
                          {voteOption === null ? 'Select Vote Option' : 'Submit'}
                        </button>
                        : <button
                          type='submit'
                          className={`ui button ${voteOption ? 'blue' : 'purple'} right labeled icon`}>
                         VOTE TO {voteOption ? 'SUPPORT' : 'OPPOSE'} <i className={`icon thumbs ${voteOption ? 'up' : 'down'}`} />
                        </button>
                      }
                    </div>
                  </div>
                }
              </form>
            </div>
          </div>
        </div>
        {inProgress ? <InProgress /> : null}
      </div>
    )
  }

  onDepositKeyUp (event) {
    if (this._isMounted) {
      this.setState({
        votes: event.target.value | 0 // coerce to int
      })
    }
  }

  onVoteOptionChange (event, { value }) {
    if (this._isMounted) {
      this.setState({
        voteOption: parseInt(value, 10)
      })
    }
  }

  enableDownloadCheck () {
    const {
      votes,
      voteOption,
      enableDownload
    } = this.state

    if (!enableDownload && voteOption !== null && votes) {
      this.setState({
        enableDownload: true
      })
    }
  }

  onDownload (event) {
    event.preventDefault()

    const {
      voteOption,
      salt,
      challengeId,
      commitEndDate
    } = this.state

    const json = {
      voteOption,
      salt,
      challengeId,
      commitEndDate
    }

    const endDateString = moment.unix(commitEndDate).format('YYYY-MM-DD_HH-mm-ss')
    const projectName = this.props.project.projectName
    const filename = `${projectName}--challenge_id_${challengeId}--commit_end_${endDateString}--commit-vote.json`
    saveFile(json, filename)

    this.setState({
      commitDownloaded: true
    })
  }

  async onReminderDownload (event) {
    event.preventDefault()

    const {
      challengeId,
      commitEndDate
    } = this.state

    const revealDate = moment.unix(commitEndDate)
    const revealDateString = revealDate.format('YYYY-MM-DD_HH-mm-ss')
    const projectName = this.props.project.projectName
    const filename = `${projectName}--challenge_id_${challengeId}--reveal_start_${revealDateString}--reminder.ics`
    const title = `Reveal Vote for ${projectName}`
    const url = `${window.location.protocol}//${window.location.host}/project/${projectName}`

    const data = await generateReminder({
      start: revealDate,
      title,
      url
    })

    saveFile(data, filename)

    this.setState({
      revealReminderDownloaded: true
    })
  }

  async getPoll () {
    try {
      const {
        commitEndDate,
        revealEndDate
      } = await registry.getChallengePoll(this.state.projectName)

      if (this._isMounted) {
        this.setState({
          commitEndDate,
          revealEndDate
        })
      }
    } catch (error) {
      toastr.error(error.message)
    }
  }

  async getChallenge () {
    try {
      const challenge = await registry.getChallenge(this.state.challengeId)
      const didChallenge = await registry.didChallenge(this.state.projectName)
      if (this._isMounted) {
        this.setState({
          didChallenge,
          challenge
        })
      }
    } catch (error) {
      toastr.error(error.message)
    }
  }

  async getCommit () {
    try {
      const didCommit = await registry.didCommit(this.state.projectName)

      if (this._isMounted) {
        this.setState({
          didCommit: didCommit
        })
      }
    } catch (error) {
      toastr.error(error.message)
    }
  }

  async commit () {
    const {
      projectName,
      votes,
      salt,
      voteOption
    } = this.state

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
      const tokens = toBasicUnit(new BigNumber(votes))
      const commited = await registry.commitVote(projectName, tokens, voteOption, salt)

      if (this._isMounted) {
        this.setState({
          inProgress: false
        })
      }

      if (commited) {
        toastr.success('Successfully committed')

        // TODO: better way of resetting state
        setTimeout(() => {
          window.location.reload()
        }, 1e3)
      } else {
        toastr.error('Commit did not go through')
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

  onCountdownExpire () {
    // allow some time for new block to get mined and reload page
    setTimeout(() => {
      window.location.reload()
    }, 15000)
  }
}

export default ChallengeVoteCommit
