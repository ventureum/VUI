import React, { Component } from 'react'
import commafy from 'commafy'
import toastr from 'toastr'
import moment from 'moment'
import { Popup } from 'semantic-ui-react'
import registry from '../../../../services/registry'
import InProgress from '../../InProgress'
import Countdown from '../Countdown'

import './styles.css'

class Challenge extends Component {
  constructor (props) {
    super()

    this.state = {
      applicationExpiry: props.project.applicationExpiry,
      hash: props.project.hash,
      minDeposit: 100,
      currentDeposit: null,
      inProgress: false
    }

    this.onChallenge = this.onChallenge.bind(this)
  }

  componentDidMount () {
    this._isMounted = true

    this.getMinDeposit()
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  render () {
    const {
      applicationExpiry,
      minDeposit,
      inProgress
    } = this.state

    const stageEndMoment = applicationExpiry ? moment.unix(applicationExpiry) : null
    const stageEnd = stageEndMoment ? stageEndMoment.format('YYYY-MM-DD HH:mm:ss') : '-'

    return (
      <div className='challenge'>
        <div className='ui grid stackable'>
          <div className='column sixteen wide'>
            <div className='ui large header center aligned'>
              IN APPLICATION
              <Popup
                trigger={<i className='icon info circle' />}
                content='VTH holders are encouraged to challenge publisher applications where the token holders believe the Publisher to be fraudulent.'
              />
            </div>
          </div>
          <div className='column sixteen wide center aligned'>
            <form className='ui form'>
              <div className='ui divider' />
              <div className='column sixteen wide center aligned'>
                <div className='ui message info'>
                  <p>Challenge stage ends</p>
                  <p><strong>{stageEnd}</strong></p>
                  <p>Remaining time: <Countdown
                    endDate={stageEndMoment}
                    onExpire={this.onCountdownExpire.bind(this)} /></p>
                </div>
              </div>
              <div className='ui divider' />
              <div className='ui field'>
                <label>Challenge Project</label>
              </div>
              <div className='ui field'>
                <div className='ui message default'>
                  <p>Minimum deposit required</p>
                  <p><strong>{minDeposit ? commafy(minDeposit) : '-'} VTH</strong></p>
                </div>
              </div>
              <div className='ui field'>
                <button
                  onClick={this.onChallenge}
                  className='ui button purple right labeled icon'>
                  CHALLENGE
                  <i className='icon thumbs down' />
                </button>
              </div>
            </form>
          </div>
        </div>
        {inProgress ? <InProgress /> : null}
      </div>
    )
  }

  onCountdownExpire () {
    // allow some time for new block to get mined and reload page
    setTimeout(() => {
      window.location.reload()
    }, 15000)
  }

  async getMinDeposit () {
    if (this._isMounted) {
      this.setState({
        minDeposit: (await registry.getMinDeposit()).toNumber()
      })
    }
  }

  onChallenge (event) {
    event.preventDefault()

    this.challenge()
  }

  async challenge () {
    const project = this.props.project

    let inApplication = null

    try {
      inApplication = await registry.applicationExists(project.projectName)
    } catch (error) {
      toastr.error(error)
    }

    if (inApplication) {
      if (this._isMounted) {
        this.setState({
          inProgress: true
        })
      }

      try {
        await registry.challenge(project.projectName)

        toastr.success('Successfully challenged project')

        if (this._isMounted) {
          this.setState({
            inProgress: false
          })
        }

        // TODO: better way of resetting state
        setTimeout(() => {
          window.location.reload()
        }, 2e3)
      } catch (error) {
        toastr.error(error.message)
        if (this._isMounted) {
          this.setState({
            inProgress: false
          })
        }
      }
    } else {
      toastr.error('Project not in application')
    }
  }
}

export default Challenge
