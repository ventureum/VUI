import React, { Component } from 'react'
import toastr from 'toastr'
import moment from 'moment'
import { Popup, Select } from 'semantic-ui-react'
import registry from '../../../../services/registry'
import InProgress from '../../InProgress'
import Countdown from '../Countdown'

import './styles.css'

class Delegate extends Component {
  constructor (props) {
    super()

    this.state = {
      proxyValue: '',
      delegateEnd: props.endDate,
      minDeposit: null,
      currentDeposit: null,
      inProgress: false,
      stage: props.stage,
      proxyList: [
        {
          key: '1',
          value: 'John',
          text: 'John'
        }, {
          key: '2',
          value: 'Richard',
          text: 'Richard'
        }, {
          key: '3',
          value: 'Brian',
          text: 'Brian'
        }
      ],
      proxyInfo: {
        'John': {
          name: 'John Smith',
          ethAddr: '0x20ca9efd76a8738f000013783161872d00008486',
          lockedVth: 1042
        },
        'Richard': {
          name: 'Richard White',
          ethAddr: '0xe71d864ce000066bb8d640ad2e03bce75dc80000',
          lockedVth: 3241
        },
        'Brian': {
          name: 'John Lee',
          ethAddr: '0x4a0000006500816731f2af00001eb43761c88a79',
          lockedVth: 8012
        }
      }
    }
  }

  setValue (e, data) {
    this.setState({ proxyValue: data.value })
  }

  componentDidMount () {
    this._isMounted = true

    // this.getMinDeposit()
    // this.getListing()
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  render () {
    const {
      delegateEnd,
      inProgress
    } = this.state

    const stageEndMoment = delegateEnd ? moment.unix(delegateEnd) : null
    const stageEnd = stageEndMoment ? stageEndMoment.format('YYYY-MM-DD HH:mm:ss') : '-'

    return (
      <div className='challenge'>
        <div className='ui grid stackable'>
          <div className='column sixteen wide'>
            <div className='ui large header center aligned'>
              {this.state.stage}
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
              <div className='field'>
                <label>My Available Votes to Delegate: <strong>100</strong></label>
              </div>
              <div className='inline field'>
                <label>Enter Votes to Delegate: </label>
                <div className='ui input'>
                  <input type='text' placeholder='10' />
                </div>
              </div>
              <div className='inline field'>
                <label>List of Proxies: </label>
                <Select onChange={this.setValue.bind(this)} value={this.state.proxyValue} placeholder='Select your proxy' options={this.state.proxyList} />
              </div>
              {this.state.proxyValue &&
                <div className='ui field'>
                  <label>Name: {this.state.proxyInfo[this.state.proxyValue].name}</label>
                  <label>ETH address: {this.state.proxyInfo[this.state.proxyValue].ethAddr}</label>
                  <label>Locked VTH: {this.state.proxyInfo[this.state.proxyValue].lockedVth}</label>
                </div>
              }
              <div className='ui field'>
                <button
                  onClick={this.onChallenge.bind(this)}
                  className='ui button purple'>
                  DELEGATE
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
        minDeposit: await registry.getMinDeposit() || 0
      })
    }
  }

  async getListing () {
    const {domain} = this.state
    const listing = await registry.getListing(domain)

    const {
      applicationExpiry,
      currentDeposit
    } = listing

    if (this._isMounted) {
      this.setState({
        applicationExpiry,
        currentDeposit
      })
    }
  }

  onChallenge (event) {
    event.preventDefault()

    this.challenge()
  }

  async challenge () {
    const {domain} = this.state

    let inApplication = null

    try {
      inApplication = await registry.applicationExists(domain)
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
        await registry.challenge(domain)

        toastr.success('Successfully challenged domain')

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
      toastr.error('Domain not in application')
    }
  }
}

export default Delegate
