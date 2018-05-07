import React, { Component } from 'react'
import { Menu, Image } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import VTHFaucet from '../Main/VTHFaucet'
import registry from '../../services/registry'
import token from '../../services/token'
import store from '../../store'
import toastr from 'toastr'
import commafy from 'commafy'
import { BigNumber } from 'bignumber.js'
import { toStandardUnit } from '../../utils/utils'

class SideMenu extends Component {
  constructor (props) {
    super()
    this.state = {
      activeItem: 'home',
      address: null,
      network: null,
      ethBalance: null,
      vthBalance: null,
      isLoading: true,
      tokenAmount: null
    }
    this.handleItemClick = this.handleItemClick.bind(this)
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
        vthBalance: (vthBalance || new BigNumber(0))
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
        ethBalance: (ethBalance || new BigNumber(0))
      })
    } catch (error) {
      this.setState({
        ethBalance: null
      })
    }
  }

  handleItemClick (e, { name }) {
    this.setState({ activeItem: name })
  }

  render () {
    const { vthBalance,
      ethBalance,
      address,
      network,
      activeItem
    } = this.state

    return (
      <Menu stackable>
        <Menu.Item
          as={Link}
          to='/'
          name='home'
          active={activeItem === 'home'}
          onClick={this.handleItemClick}
        >
          Home
        </Menu.Item>

        <Menu.Item
          as={Link}
          to='/application'
          name='application'
          active={activeItem === 'application'}
          onClick={this.handleItemClick}
        >
          Application
        </Menu.Item>

        <Menu.Item
          as={Link}
          to='/projects'
          name='projects'
          active={activeItem === 'projects'}
          onClick={this.handleItemClick}
        >
          Projects
        </Menu.Item>

        <Menu.Item
          as={Link}
          to='/account'
          name='account'
          active={activeItem === 'account'}
          onClick={this.handleItemClick}
        >
          Account Dashboard
        </Menu.Item>

        <div className='item'>
          <div className='addr'>
            <span> Address: {address} </span>
          </div>
        </div>

        <div className='item'>
          <span>Network: <strong>{network && network.type.replace(/\b\w/g, l => l.toUpperCase())}</strong></span>
        </div>

        <div className='item'>
          <Image src='images/eth_icon_32x32.png' />
          {ethBalance !== null ? commafy(toStandardUnit(ethBalance).toNumber().toFixed(4)) : '-'} ETH
        </div>

        <div className='item'>
          <Image src='images/vth_icon_32x32.png' />
          {vthBalance !== null ? commafy(toStandardUnit(vthBalance).toNumber().toFixed(4)) : '-'} VTH{vthBalance !== null && <VTHFaucet address={address} />}
        </div>

      </Menu>
    )
  }
}

export default CSSModules(SideMenu)
