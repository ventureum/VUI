import React, { Component } from 'react'
import toastr from 'toastr'
import moment from 'moment'
import {Button, Dropdown, Radio, Popup } from 'semantic-ui-react'

import Countdown from '../Countdown'
import registry from '../../../../services/registry'
import InProgress from '../../InProgress'
import TokenDistribution from './TokenDistribution'

import './styles.css'

class VoteReveal extends Component {
  constructor (props) {
    super()

    this.state = {
      domain: props.domain,
      account: registry.getAccount(),
      applicationExpiry: null,
      votesFor: 0,
      votesAgainst: 0,
      commitEndDate: null,
      revealEndDate: props.endDate,
      inProgress: false,
      didChallenge: false,
      didCommit: false,
      didReveal: false,
      salt: null,
      voteOption: null,
      challengeId: null,
      stage: props.stage,
      obj: props.obj
    }

    this.onVoteOptionChange = this.onVoteOptionChange.bind(this)
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onFileInput = this.onFileInput.bind(this)

    // this.getListing()
    // this.getPoll()
    // this.getChallenge()
    // this.getCommit()
    // this.getReveal()

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

  render () {
    const {
      domain,
      revealEndDate,
      inProgress,
      didChallenge,
      didCommit,
      didReveal,
      voteOption,
      challengeId,
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
                content='The first phase of the voting process is the commit phase where the VTH holder stakes a hidden amount of votes to SUPPORT or OPPOSE the domain application. The second phase is the reveal phase where the VTH holder reveals the staked amount of votes to either the SUPPORT or OPPOSE side.'
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
          {didReveal ? <div className='column sixteen wide center aligned'>
            <div className='ui message warning'>
              You've <strong>revealed</strong> for this domain.
            </div>
          </div>
           : null}
          <div className='column sixteen wide center aligned'>
            <div className='ui divider' />
            <div className='column sixteen wide center aligned'>
              <div className='ui message info'>
                <p>
                  Reveal stage ends
                </p>
                <p><strong>{stageEnd}</strong></p>
                <p>Remaining time: <Countdown
                                     endDate={stageEndMoment}
                                     onExpire={this.onCountdownExpire.bind(this)} /></p>
              </div>
            </div>
            <div className='ui divider' />
            <div className='column sixteen wide center aligned'>
              <h4> Select Milestone Objective </h4>
              <Dropdown placeholder='Select Objective' fluid selection options={this.objSelection} />
              <form
                onSubmit={this.onFormSubmit}
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
                <div className='ui grid center aligned row'>
                  <Button.Group buttons={['1', '2', '3','4','5']} />
                  <Button primary> Submit </Button>
                </div>
              </form>
            </div>
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

  async getCommit () {
    const {domain, account} = this.state

    if (!account) {
      return false
    }

    try {
      const didCommit = await registry.didCommit(domain)

      this.setState({
        didCommit: didCommit
      })
    } catch (error) {
      toastr.error(error)
    }
  }

  async getReveal () {
    const {domain, account} = this.state

    if (!account) {
      return false
    }

    try {
      const didReveal = await registry.didReveal(domain)

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
    const {domain} = this.state

    try {
      const {
        votesFor,
        votesAgainst,
        commitEndDate,
        revealEndDate
      } = await registry.getChallengePoll(domain)

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
    const {domain, account} = this.state

    if (!account) {
      return false
    }

    try {
      const didChallenge = await registry.didChallenge(domain)

      if (this._isMounted) {
        this.setState({
          didChallenge
        })
      }
    } catch (error) {
      toastr.error(error)
    }
  }

  onFormSubmit (event) {
    event.preventDefault()

    this.reveal()
  }

  async reveal () {
    const {domain, salt, voteOption} = this.state

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
      const revealed = await registry.revealVote({domain, voteOption, salt})
      this.setState({
        inProgress: false
      })

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

export default VoteReveal
