import React, { Component } from 'react'
import toastr from 'toastr'
import moment from 'moment'
import { Button, Dropdown, Radio, Popup } from 'semantic-ui-react'
import randomInt from 'random-int'

import saveFile from '../../../../utils/saveFile'
import generateReminder from '../../../../utils/generateReminder'
import Countdown from '../Countdown'
import registry from '../../../../services/registry'
import InProgress from './InProgress'

import './styles.css'

class VoteCommit extends Component {
  constructor (props) {
    super()

    const salt = randomInt(1e6, 1e8)

    this.state = {
      votes: 0,
      applicationExpiry: null,
      challengeId: null,
      commitEndDate: props.endDate,
      revealEndDate: null,
      didChallenge: null,
      didCommit: null,
      inProgress: false,
      salt,
      voteOption: null,
      enableDownload: false,
      commitDownloaded: false,
      revealReminderDownloaded: false,
      stage: props.stage,
      obj: props.obj
    }

    // this.getListing()
    // this.getPoll()
    // this.getChallenge()
    // this.getCommit()

    this.onDepositKeyUp = this.onDepositKeyUp.bind(this)
    this.onVoteOptionChange = this.onVoteOptionChange.bind(this)
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onDownload = this.onDownload.bind(this)
    this.onReminderDownload = this.onReminderDownload.bind(this)
    this.enableDownloadCheck = this.enableDownloadCheck.bind(this)

    this.objSelection=[]
    for(var i = 0; i < this.state.obj.length; i++) {
      this.objSelection.push({text:this.state.obj[i].objTitle, value:this.state.obj[i].objTitle})
    }
  }

  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  componentWillUpdate () {
    setTimeout(() => {
      this.enableDownloadCheck()
    }, 0)
  }

  render () {
    const {
      domain,
      commitEndDate,
      didChallenge,
      didCommit,
      inProgress,
      salt,
      voteOption,
      challengeId,
      enableDownload,
      commitDownloaded,
      votes,
      revealReminderDownloaded
    } = this.state

    const stageEndMoment = commitEndDate ? moment.unix(commitEndDate) : null
    const stageEnd = stageEndMoment ? stageEndMoment.format('YYYY-MM-DD HH:mm:ss') : '-'

    return (
      <div className='vote-commit'>
        <div className='ui grid stackable'>
          <div className='column sixteen wide'>
            <div className='ui large header center aligned'>
              {this.state.stage}
              <Popup
                trigger={<i className='icon info circle' />}
                content='The first phase of the voting process is the commit phase where the VTH holder stakes a hidden amount of votes. The second phase is the reveal phase where the VTH holder reveals the staked amount of votes to either the SUPPORT or OPPOSE side.'
              />
            </div>
          </div>
          {didChallenge ? <div className='column sixteen wide center aligned'>
            <div className='ui message warning'>
              You've <strong>challenged</strong> this domain.
            </div>
          </div>
           : null}
          {didCommit ? <div className='column sixteen wide center aligned'>
            <div className='ui message warning'>
              You've <strong>commited</strong> for this domain.
            </div>
          </div>
           : null}
          <div className='column sixteen wide center aligned'>
            <div className='ui divider' />
            <div className='column sixteen wide center aligned'>
              <div className='ui message info'>
                <p>
                  Voting commit stage ends
                </p>
                <p><strong>{stageEnd}</strong></p>
                <p>Remaining time: <Countdown
                                     endDate={stageEndMoment}
                                     onExpire={this.onCountdownExpire.bind(this)} /></p>
              </div>
            </div>
            <div className='ui divider' />
            <div className='column sixteen wide center aligned'>
              <form
                onSubmit={this.onFormSubmit}
                className='ui form center aligned'>
                <div className="field">
                  <label>Your votes{this.state.stage === 'Proxy Vote - Commit' && ' Weights'}: <strong>5600000</strong></label>
                </div>
                <div className='ui field'>
                  <label>Vote Option</label>
                </div>
                {this.state.stage !== 'Put Option' &&
                 <div className='ui two fields VoteOptions'>
                   <Dropdown placeholder='Select Objective' fluid selection options={this.objSelection} />
                   <Button.Group buttons={['1', '2', '3','4','5']} />
                 </div>
                }
                {this.state.stage === 'Put Option' &&
                 <div className='ui field'>
                   <Radio
                     label='Exercise'
                     name='voteOption'
                     value='0'
                     checked={this.state.voteOption === 0}
                     onChange={this.onVoteOptionChange}
                   />
                 </div>
                }
      {this.state.stage !== 'Put Option' &&
       <div className='ui field'>
         <label>Secret Phrase<br /><small>PLEASE SAVE THIS. This random phrase (known as a "salt") will be required to reveal your vote and claim rewards.</small></label>
         <div className='ui message tiny default SaltField'>
           {salt}
         </div>
       </div>
      }
      {this.state.stage !== 'Put Option' &&
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
      }
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
       : null}
                <div className='ui field'>
                  {(voteOption === null || !votes || !commitDownloaded)
                   ? <button
                       className='ui button disabled'>
                     {voteOption === null ? 'Select Vote Option' :  'Submit'}
                   </button>
                   : <button
                       type='submit'
                       className={`ui button ${voteOption ? 'blue' : 'purple'} right labeled icon`}>
                     VOTE TO {voteOption ? 'SUPPORT' : 'OPPOSE'} <i className={`icon thumbs ${voteOption ? 'up' : 'down'}`} />
                   </button>
                  }
                </div>
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
    const projectName = 'test'
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
    const projectName = 'test'
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

  onFormSubmit (event) {
    event.preventDefault()

    this.commit()
  }

  async getListing () {
    const {domain} = this.state
    const listing = await registry.getListing(domain)

    const {
      applicationExpiry,
      challengeId
    } = listing

    if (this._isMounted) {
      this.setState({
        applicationExpiry,
        challengeId
      })
    }
  }

  async getPoll () {
    const {domain} = this.state

    try {
      const {
        commitEndDate,
        revealEndDate
      } = await registry.getChallengePoll(domain)

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
    const {domain} = this.state

    try {
      const didChallenge = await registry.didChallenge(domain)

      if (this._isMounted) {
        this.setState({
          didChallenge
        })
      }
    } catch (error) {
      toastr.error(error.message)
    }
  }

  async getCommit () {
    const {domain} = this.state

    try {
      const didCommit = await registry.didCommit(domain)

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
      domain,
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
      const commited = await registry.commitVote({domain, votes, voteOption, salt})

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

export default VoteCommit
