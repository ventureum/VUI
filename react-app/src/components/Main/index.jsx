import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './styles.css'
import Application from './Application/index.jsx'
import ProgramList from './ProgramList/index.jsx'
import Registry from './Registry/index.jsx'
import Account from './Account/index.jsx'
import { Dropdown } from 'semantic-ui-react'

import commafy from 'commafy'
import store from '../../store'
import registry from '../../services/registry'
import token from '../../services/token'

class Main extends Component {
  constructor () {
    super()

    this.state = {
      address: null,
      addressType: 'investors',
      addressTypeOptions: [
        {
          text: 'Investor: 0x88cebf69c703b239e8e333273836a4bcfa94a415',
          value: 'investors'
        }, {
          text: 'Proxy: 0x7b458ff830040ec6fda7ec4ab96634ba67a93ddf',
          value: 'proxies'
        }, {
          text: 'Founder: 0xe4b8ba1957b16a1f6c5663917c0fb067f7fa0e5b',
          value: 'projectFounders'
        }
      ],
      account: null,
      ethBalance: null,
      vthBalance: null,
      isLoading: true
    }
  }
  componentDidMount () {
    this.updateAddress()
    this.updateBalance()
    this.setState({
      isLoading: false
    })

    store.subscribe(x => {
      this.updateAddress()
      this.updateBalance()
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
        vthBalance: (vthBalance | 0)
      })
    } catch (error) {
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
  render() {
    return (
      <div className="main column twelve wide">
        <div className="ui grid">
          <div className="top-bar">
            <div className="ui grid top attached menu stackable inverted">
              <div className="item">
                <div className="addr">
                  <div className="avatar">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAtUlEQVRYR2O8Z9r2nwEL2Jg/FZsw1cT8J2ZjNYtx1EHQcBkNIUKJbeiE0KFtplhzmUx9ICFPUiT/pHE99lw26iBouIyGEKEENvRDCJcPz757RsjzKPLGQlIkqWfElctGHQQNgdEQIpSghk4I4cpNpOYaUs3BGUKkGkRqrsTlsVEHwUJyNIRgIUFqWsSZhkZbjISqjtEQGg0htKKcak1YXAbhqjpwpcVRB8FCbDSECLUAh3wIAQCl1e/d0wBVcwAAAABJRU5ErkJggg==" alt=""/>
                  </div>
                  <Dropdown value={this.addressType} onChange={this.changeAddressType.bind(this)} inline options={this.state.addressTypeOptions} defaultValue={this.state.addressTypeOptions[0].value} />
                </div>
              </div>
              <div className="item">
                <span>Network: <strong>test</strong></span>
              </div>
              <div className="menu right">
                <div className="item">
                  <div className="eth-logo ui image">
                    <img src="https://www.ethereum.org/images/diamond-icon@2x.png" alt=""/>
                    2.33 ETH
                  </div>
                </div>
                <div className="item">
                  <div className="vth-logo ui image">
                    <img src="http://ventureum.io/img/logo.png" alt=""/>
                    2.33 VTH
                  </div>
                </div>
                <div className="item">
                  <a href="" target="_blank">Help</a>
                </div>
              </div>
            </div>
          </div>
          <span className="main-wrapper">
            {this.props.mainIndex === 0 && <Application />}
            {this.props.mainIndex === 1 && <ProgramList addressType={this.state.addressType} list={[]} />}
            {this.props.mainIndex === 2 && <Registry />}
            {this.props.mainIndex === 3 && <Account />}
          </span>
        </div>
      </div>
    );
  }
}

export default CSSModules(Main, styles);
