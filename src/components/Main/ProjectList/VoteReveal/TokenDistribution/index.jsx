import React, { Component } from 'react'
import commafy from 'commafy'
import toastr from 'toastr'

import registry from '../../../../../services/registry'
import StatProgressBar from '../StatProgressBar'

import './styles.css'

class TokenDistribution extends Component {
  constructor (props) {
    super()

    this.state = {
      votesFor: 100,
      votesAgainst: 50
    }

    // this.getPoll()
  }

  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  async getPoll () {
    const {domain} = this.state

    try {
      const {
        votesFor,
        votesAgainst
      } = await registry.getChallengePoll(domain)

      if (this._isMounted) {
        this.setState({
          votesFor,
          votesAgainst
        })
      }
    } catch (error) {
      toastr.error(error)
    }
  }

  render () {
    const {
      votesFor,
      votesAgainst
    } = this.state

    // "N | 0" coerces to int or to 0 if NaN
    const totalVotes = ((votesFor + votesAgainst) | 0)
    const supportFill = Math.round((votesFor / totalVotes) * 100) | 0
    const opposeFill = Math.round((votesAgainst / totalVotes) * 100) | 0

    return (
      <div className='column sixteen wide center aligned token-distribution'>
        <div className='progress-container'>
          <p>
            VTX holders have revealed their vote to show:
          </p>
          <div className='bar-container'>
            <StatProgressBar
              fills={[supportFill, opposeFill]}
              showFillLabels
              showLegend
              fillLabels={['SUPPORT', 'OPPOSE']}
            />
          </div>
          <div className='breakdown'>
            <div className='breakdown-item'>
              <div className='breakdown-itembox' />
              <span className='breakdown-itemlabel'>{commafy(votesFor)} Votes</span>
            </div>
            <div className='breakdown-item'>
              <div className='breakdown-itembox' />
              <span className='breakdown-itemlabel'>{commafy(votesAgainst)} Votes</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TokenDistribution
