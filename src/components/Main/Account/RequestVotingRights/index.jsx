import React, { Component } from 'react'
import { Popup } from 'semantic-ui-react'
import store from '../../../../store'
import registry from '../../../../services/registry'
import toastr from 'toastr'
import CSSModules from 'react-css-modules'
import InProgress from '../../InProgress'

import styles from './styles.css'

class RequestVotingRights extends Component {
  constructor (props) {
    super()

    this.state = {
      requestVotes: null,
      account: props.account,
      inProgress: false,
      availableVotes: null
    }

    this.onRequest = this.onRequest.bind(this)
    this.onVotesKeyUp = this.onVotesKeyUp.bind(this)
  }

  componentDidMount () {
    this._isMounted = true

    this.getAvailableVotes()

    store.subscribe(x => {
      this.getAvailableVotes()
    })
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  onVotesKeyUp (event) {
    this.setState({
      requestVotes: event.target.value | 0 // coerce to int
    })
  }

  onRequest (event) {
    event.preventDefault()

    this.requestRights()
  }

  async requestRights () {
    const {requestVotes} = this.state

    if (!requestVotes) {
      toastr.error('Please enter amount of adToken')
      return false
    }

    if (this._isMounted) {
      this.setState({
        inProgress: true
      })
    }

    try {
      await registry.requestVotingRights(requestVotes)

      // TODO: better way to reset input
      const input = document.querySelector('#RequestVotingRightsContainerInput')

      if (input) {
        input.value = ''
      }

      toastr.success('Success')
    } catch (error) {
      toastr.error(error.message)
    }

    if (this._isMounted) {
      this.setState({
        inProgress: false
      })
    }
  }

  async getAvailableVotes () {
    const {account} = this.state

    if (!account) {
      return false
    }

    try {
      const availableVotes = (await registry.getTotalVotingRights()).toNumber()

      this.setState({
        availableVotes
      })
    } catch (error) {
      toastr.error(error.message)
    }
  }

  render () {
    const {
      inProgress,
      availableVotes
    } = this.state

    return (
      <div className='request-voting-rights-container'>
        <div className='ui grid stackable center aligned'>
          <div className='column sixteen wide'>
            <div className='ui large header center aligned'>
              Request Voting Rights
              <Popup
                trigger={<i className='icon info circle' />}
                content='Pre-requesting voting rights will minimizes the number of transactions when performing commit votes. This can save gas fees if voting frequently. 1 VTH = 1 Vote. Pre-requesting voting rights will withdraw VToken from your account to the PLCR contract. You may convert the votes to vToken and withdraw at any time.'
              />
            </div>
            <div>Total current voting rights: <strong>{availableVotes}</strong></div>
            <div>Enter amount of VTH to convert to votes</div>
            <br />
            <div className='ui input action mini'>
              <input onKeyUp={this.onVotesKeyUp} type='text' placeholder='100' id='request-voting-rights-container-input' />
              <button onClick={this.onRequest} className='ui button blue'>Request Voting Rights</button>
            </div>
          </div>
        </div>
        {inProgress ? <InProgress /> : null}
      </div>
    )
  }
}

export default CSSModules(RequestVotingRights, styles)
