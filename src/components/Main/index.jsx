import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './styles.css'
import Application from './Application'
import ProjectList from './ProjectList'
import Registry from './Registry'
import Account from './Account'
import VTHFaucet from './VTHFaucet'
import { Popup } from 'semantic-ui-react'
import toastr from 'toastr'

import commafy from 'commafy'
import store from '../../store'
import registry from '../../services/registry'
import token from '../../services/token'

class Main extends Component {
  constructor () {
    super()

    this.state = {
      address: null,
      network: null,
      ethBalance: null,
      vthBalance: null,
      isLoading: true,
      tokenAmount: null
    }
  }

  componentDidMount () {
    if (!this.props.fatalError) {
      this.updateAddress()
      this.updateNetwork()
      this.updateBalance()
      this.setState({
        isLoading: false
      })

      store.subscribe(x => {
        this.updateAddress()
        this.updateNetwork()
        this.updateBalance()
      })
    }
  }

  async updateNetwork () {
    var network = await registry.getNetwork()

    this.setState({
      network
    })
  }

  async updateAddress () {
    var address = registry.getAccount()

    this.setState({
      address
    })
  }

  changeAddressType (e, data) {
    this.setState({
      addressType: data.value
    })
  }

  async updateBalance () {
    try {
      const vthBalance = await token.getBalance()

      this.setState({
        vthBalance: (vthBalance || 0)
      })
    } catch (error) {
      toastr.error(error)
      this.setState({
        vthBalance: null
      })
    }

    try {
      const ethBalance = await registry.getEthBalance()

      this.setState({
        ethBalance: ethBalance.toNumber()
      })
    } catch (error) {
      this.setState({
        ethBalance: null
      })
    }
  }

  render () {
    let {
      vthBalance,
      ethBalance,
      address,
      network
    } = this.state

    if (this.props.fatalError) {
      return (
        <div className='main'>
          <div className='fatal-error'>
            {this.props.fatalError}
          </div>
        </div>
      )
    } else {
      return (
        <div className='main column twelve wide'>
          <div className='ui grid'>
            <div className='top-bar'>
              <div className='ui grid top attached menu stackable inverted'>
                <div className='item'>
                  <div className='addr'>
                    <div className='avatar'>
                      <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAtUlEQVRYR2O8Z9r2nwEL2Jg/FZsw1cT8J2ZjNYtx1EHQcBkNIUKJbeiE0KFtplhzmUx9ICFPUiT/pHE99lw26iBouIyGEKEENvRDCJcPz757RsjzKPLGQlIkqWfElctGHQQNgdEQIpSghk4I4cpNpOYaUs3BGUKkGkRqrsTlsVEHwUJyNIRgIUFqWsSZhkZbjISqjtEQGg0htKKcak1YXAbhqjpwpcVRB8FCbDSECLUAh3wIAQCl1e/d0wBVcwAAAABJRU5ErkJggg==' alt='' />
                    </div>
                    {address}
                  </div>
                </div>
                <div className='item'>
                  <span>Network: <strong>{network && network.type.replace(/\b\w/g, l => l.toUpperCase())}</strong></span>
                </div>
                <div className='menu right'>
                  <div className='item'>
                    <div className='eth-logo ui image'>
                      <img src='https://www.ethereum.org/images/diamond-icon@2x.png' alt='' />
                      {ethBalance !== null ? commafy(ethBalance.toFixed(4)) : '-'} ETH
                    </div>
                  </div>
                  <div className='item'>
                    <div className='vth-logo ui image'>
                      <Popup
                        hoverable='true'
                        trigger={<img src='http://ventureum.io/img/logo.png' alt='' />}
                        content={'VTH Token Address: ' + token.address}
                      />
                      {vthBalance !== null ? commafy(vthBalance.toFixed(4)) : '-'} VTH{vthBalance !== null && <VTHFaucet address={address} />}
                    </div>
                  </div>
                  <div className='item'>
                    <a href='' target='_blank'>Help</a>
                  </div>
                </div>
              </div>
            </div>
            <span className='main-wrapper'>
              {this.props.mainIndex === 0 && <Application />}
              {this.props.mainIndex === 1 && <ProjectList addressType={this.state.addressType} list={[]} />}
              {this.props.mainIndex === 2 && <Registry />}
              {this.props.mainIndex === 3 && <Account />}
            </span>
          </div>
        </div>
      )
    }
  }
}

export default CSSModules(Main, styles)
