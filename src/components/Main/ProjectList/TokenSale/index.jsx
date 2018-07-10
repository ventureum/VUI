import React, { Component } from 'react'
import toastr from 'toastr'
import CSSModules from 'react-css-modules'
import web3 from 'web3'
import commafy from 'commafy'
import { Modal, Form, Button } from 'semantic-ui-react'
import { wrapWithTransactionInfo, toStandardUnit } from '../../../../utils/utils'
import InProgress from '../../InProgress'
import tokenSale from '../../../../services/tokenSale'

import styles from './styles.css'

class TokenSale extends Component {
  constructor (props) {
    super()

    this.state = {
      tokenRate: '',
      tokenAddress: '',
      tokenSaleModalOpen: false,
      buyTokenAmount: ''
    }

    this.startTokenSale = this.startTokenSale.bind(this)
    this.buyToken = this.buyToken.bind(this)
    this.stopTokenSale = this.stopTokenSale.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
  }

  handleClose () {
    this.setState({
      tokenSaleModalOpen: false
    })
  }

  handleOpen () {
    this.setState({
      tokenSaleModalOpen: true
    })
  }

  validAddress (val) {
    return web3.utils.isAddress(this.state.tokenAddress)
  }

  async startTokenSale (project) {
    this.setState({
      inProgress: true
    })
    try {
      await tokenSale.startTokenSale(project.projectName, this.state.tokenRate, this.state.tokenAddress)
      toastr.success('Token sale started successfully!')
      this.handleClose()
    } catch (error) {
      toastr.error(error.message)
    } finally {
      this.setState({
        inProgress: false
      })
    }
  }

  async stopTokenSale (name) {
    this.props.projectInProgress(name)
    try {
      await tokenSale.stopTokenSale(name)
      toastr.success('Token sale stopped successfully!')
    } catch (error) {
      toastr.error(error.message)
    } finally {
      this.props.projectInProgress(name, false)
    }
  }

  async buyToken (project) {
    this.setState({
      inProgress: true
    })
    try {
      await tokenSale.buyToken(project.projectName, this.state.buyTokenAmount, project.tokenInfo.rate)
      toastr.success('Token bought successfully!')
    } catch (error) {
      toastr.error(error.message)
    } finally {
      this.setState({
        inProgress: false
      })
    }
  }

  buyTokenDOM (project) {
    return (
      <Modal closeIcon key='modal' onClose={this.handleClose} open={this.state.tokenSaleModalOpen} size='mini' trigger={<a onClick={this.handleOpen} className='ui mini button blue' href='#!'>buy token</a>}>
        <Modal.Header>{project.projectName}</Modal.Header>
        <Modal.Content>
          <div className='ui grid stackable padded'>
            <div className='column sixteen wide'>
              <Form>
                <Form.Field>
                  <label>Rate: 1 ETH = {project.tokenInfo.rate.toNumber()} token</label>
                </Form.Field>
                <Form.Field>
                  <label>Total Token Sold: {commafy(toStandardUnit(project.tokenInfo.totalTokenSold).toNumber().toFixed(4))}</label>
                </Form.Field>
                <Form.Field>
                  <label>Total ETH: {commafy(toStandardUnit(project.tokenInfo.totalEth).toNumber().toFixed(4))}</label>
                </Form.Field>
                <Form.Field>
                  <label>Input Token Amount to Buy</label>
                  <input value={this.state.buyTokenAmount} onChange={(e) => { this.handleInputChange('buyTokenAmount', e) }} placeholder='100' />
                </Form.Field>
                <Form.Field>
                  <label>Equal to {this.state.buyTokenAmount ? commafy((this.state.buyTokenAmount / project.tokenInfo.rate).toFixed(4)) : 0} ETH</label>
                </Form.Field>
                <Button primary disabled={!this.state.buyTokenAmount} onClick={wrapWithTransactionInfo('buy-token', this.buyToken, project)} >Buy Token</Button>
              </Form>
            </div>
            {this.state.inProgress ? <InProgress /> : null}
          </div>
        </Modal.Content>
      </Modal>)
  }

  getTokenSaleDom (project) {
    let stage = project.controllerStageStr
    if (project.isOwner) {
      if (stage === 'accepted') {
        return (
          <Modal closeIcon onClose={this.handleClose} open={this.state.tokenSaleModalOpen} className='token-sale' size='mini' trigger={<a onClick={this.handleOpen} className='ui mini button blue' href='#!'>start token sale</a>}>
            <Modal.Header>{project.projectName}</Modal.Header>
            <Modal.Content>
              <div className='ui grid stackable padded'>
                <div className='column sixteen wide'>
                  <Form>
                    <Form.Field>
                      <label>Token Rate</label>
                      <div className='add-text'>
                        <span>1 ETH = </span><input value={this.state.tokenRate} onChange={(e) => { this.handleInputChange('tokenRate', e) }} placeholder='token number' />
                      </div>
                    </Form.Field>
                    <Form.Field>
                      <label>Token Address</label>
                      <input value={this.state.tokenAddress} onChange={(e) => { this.handleInputChange('tokenAddress', e) }} placeholder='0x...' />
                    </Form.Field>
                    <Button primary disabled={!(this.state.tokenRate && this.validAddress(this.state.tokenAddress))} onClick={wrapWithTransactionInfo('start-token-sale', this.startTokenSale, project)} >Start Token Sale</Button>
                  </Form>
                </div>
                {this.state.inProgress ? <InProgress /> : null}
              </div>
            </Modal.Content>
          </Modal>)
      } else if (stage === 'token-sale' && !project.tokenInfo.finalized) {
        return [
          <Button key='btn' loading={project.inProgress} disabled={project.inProgress} onClick={wrapWithTransactionInfo('stop-token-sale', this.stopTokenSale, project.projectName)} size='mini' color='red'>stop token sale</Button>,
          this.buyTokenDOM(project)
        ]
      }
    } else if (stage === 'token-sale' && !project.tokenInfo.finalized) {
      return (
        this.buyTokenDOM(project))
    } else {
      return null
    }
  }

  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  handleInputChange (name, e) {
    let obj = {}
    obj[name] = e.target.value
    this.setState(obj)
  }

  render () {
    return (
      <span>
        {this.getTokenSaleDom(this.props.project)}
      </span>
    )
  }
}

export default CSSModules(TokenSale, styles)
