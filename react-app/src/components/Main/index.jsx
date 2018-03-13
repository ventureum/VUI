import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './styles.css'
import Application from './Application/index.jsx'
import ProgramList from './ProgramList/index.jsx'
import Registry from './Registry/index.jsx'

import commafy from 'commafy'
import store from '../../store'
import registry from '../../services/registry'
import token from '../../services/token'

class Main extends Component {
  constructor () {
    super()

    this.state = {
      address: null,
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
    console.log(this)

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
            <div className="ui top attached menu stackable inverted overflow-x">
              <div className="item">
                <div className="addr">
                  <div className="avatar">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAtUlEQVRYR2O8Z9r2nwEL2Jg/FZsw1cT8J2ZjNYtx1EHQcBkNIUKJbeiE0KFtplhzmUx9ICFPUiT/pHE99lw26iBouIyGEKEENvRDCJcPz757RsjzKPLGQlIkqWfElctGHQQNgdEQIpSghk4I4cpNpOYaUs3BGUKkGkRqrsTlsVEHwUJyNIRgIUFqWsSZhkZbjISqjtEQGg0htKKcak1YXAbhqjpwpcVRB8FCbDSECLUAh3wIAQCl1e/d0wBVcwAAAABJRU5ErkJggg==" alt=""/>
                  </div>
                  <span>0x3f1c922ae22832ca3c2cd5888cdd49edacb912ca</span>
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
            {this.props.mainIndex === 0 && <Application></Application>}
            {this.props.mainIndex === 1 && <ProgramList list={[]}></ProgramList>}
            {this.props.mainIndex === 2 && <Registry></Registry>}
          </span>
        </div>
      </div>
    );
  }
}

export default CSSModules(Main, styles);
