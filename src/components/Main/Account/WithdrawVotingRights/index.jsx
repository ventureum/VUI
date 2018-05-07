import React, { Component } from 'react'
import { Popup } from 'semantic-ui-react'
import store from '../../../../store'
import registry from '../../../../services/registry'
import toastr from 'toastr'
import CSSModules from 'react-css-modules'
import commafy from 'commafy'
import InProgress from '../../InProgress'
import { toStandardUnit } from '../../../../utils/utils'
import styles from './styles.css'

class WithdrawVotingRights extends Component {
  constructor (props) {
    super()

    this.state = {
      account: props.account,
      inProgress: false,
      availableTokens: null,
      lockedTokens: null
    }

    this.onWithdraw = this.onWithdraw.bind(this)
  }

  componentDidMount () {
    this._isMounted = true

    this.getAvailableTokensToWithdraw()

    store.subscribe(x => {
      this.getAvailableTokensToWithdraw()
    })
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  async getAvailableTokensToWithdraw () {
    const {account} = this.state

    if (!account) {
      return false
    }

    try {
      const availableTokens = await registry.getAvailableTokensToWithdraw()
      const lockedTokens = await registry.getLockedTokens()

      this.setState({
        availableTokens,
        lockedTokens
      })
    } catch (error) {
      toastr.error(error.message)
    }
  }

  onWithdraw (event) {
    event.preventDefault()

    this.withdrawTokens()
  }

  async withdrawTokens () {
    const {availableTokens} = this.state
    if (availableTokens.isZero()) {
      toastr.error('No available tokens')
      return
    }

    if (this._isMounted) {
      this.setState({
        inProgress: true
      })
    }

    try {
      await registry.withdrawVotingRights(availableTokens)
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

  render () {
    const {
      inProgress,
      availableTokens,
      lockedTokens
    } = this.state

    let _availableTokens = availableTokens ? toStandardUnit(availableTokens).toNumber() : 0
    let _lockedTokens = lockedTokens ? toStandardUnit(lockedTokens).toNumber() : 0

    return (
      <div className='withdraw-voting-rights-container'>
        <div className='ui grid stackable center aligned'>
          <div className='column sixteen wide'>
            <p>
              Withdraw Voting Rights
              <Popup
                trigger={<i className='icon info circle' />}
                content='Withdraw vToken held by the PLCR contract. VToken is locked up during voting and unlocked after the reveal stage. When it is unlocked you may withdraw the vToken to your account at any time.'
              />
            </p>
            <div><small>Available unlocked VTH: {commafy(_availableTokens)}<strong> (Locked VTH: {commafy(_lockedTokens)})</strong></small></div>
            <div>
              <button onClick={this.onWithdraw} className='ui button blue tiny'>
                Withdraw VTH
              </button>
            </div>
          </div>
        </div>
        {inProgress ? <InProgress /> : null}
      </div>
    )
  }
}

export default CSSModules(WithdrawVotingRights, styles)
