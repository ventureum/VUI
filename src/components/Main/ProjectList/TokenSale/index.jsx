import React, { Component } from 'react'
import toastr from 'toastr'
import CSSModules from 'react-css-modules'
import web3 from 'web3'
import commafy from 'commafy'
import { getERC20Token } from '../../../../config'
import { Modal, Form, Button, Segment, Table, List } from 'semantic-ui-react'
import { wrapWithTransactionInfo, toStandardUnit } from '../../../../utils/utils'
import InProgress from '../../InProgress'
import tokenSale from '../../../../services/tokenSale'
import milestone from '../../../../services/milestone'
import store from '../../../../store'

import styles from './styles.css'

class TokenSale extends Component {
  constructor (props) {
    super()

    this.state = {
      token: null,
      tokenRate: '',
      tokenAddress: '',
      totalToken: '',
      tokenBalance: '',
      tokenSaleModalOpen: false,
      buyTokenAmount: '',
      milestoneData: null
    }

    this.startTokenSale = this.startTokenSale.bind(this)
    this.buyToken = this.buyToken.bind(this)
    this.stopTokenSale = this.stopTokenSale.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.canStartTokenSale = this.canStartTokenSale.bind(this)
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
      await tokenSale.startTokenSale(project.projectName, this.state.tokenRate, this.state.tokenAddress, this.token, this.state.totalToken)
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

  async withdrawRestToken (project) {
    try {
      await tokenSale.withdrawToken(project.projectName)
      toastr.success('Token withdrawed successfully!')
    } catch (error) {
      toastr.error(error.message)
    }
  }

  async getBalance () {
    let balance
    if (!this.state.tokenBalance) {
      try {
        this.token = await getERC20Token(tokenSale.account, this.state.tokenAddress)
        balance = await this.token.balanceOf.call(tokenSale.account)
        balance = toStandardUnit(balance).toNumber()
        this.setState({
          tokenBalance: balance
        })
      } catch (e) {
        toastr.error("Can't get your project token balance.")
      }
    }
  }

  canStartTokenSale () {
    if (!this.validAddress(this.state.tokenAddress)) {
      return false
    }
    this.getBalance()
    if (!this.state.totalToken || !this.state.tokenBalance) {
      return false
    }
    if (this.state.totalToken > this.state.tokenBalance) {
      toastr.error('Total token amount exceeds your token balance.')
      return false
    }
    if (!this.state.tokenRate) {
      return false
    }

    return true
  }

  canBuyToken (project) {
    if (!this.state.buyTokenAmount) {
      return false
    }
    if (this.state.buyTokenAmount > toStandardUnit(project.tokenInfo.numTokenLeft).toNumber()) {
      toastr.error('Token amount exceeds total token amount.')
      return false
    }

    return true
  }

  buyTokenDOM (project) {
    let milestoneRows = []
    let milestoneData = this.state.milestoneData
    if (milestoneData) {
      for (let i = 0; i < milestoneData.length; i++) {
        let objList = []
        for (let j = 0; j < milestoneData[i].objsStrs.length; j++) {
          objList.push(
            <List.Item>
              <strong>name: </strong>{milestoneData[i].objsStrs[j]},&nbsp;
              <strong>type: </strong>{milestoneData[i].objTypesStrs[j]},&nbsp;
              <strong>rewards: </strong>{milestoneData[i].objRewards[j].toNumber()}
            </List.Item>)
        }
        milestoneRows.push(
          <Table.Row key={milestoneData[i].id}>
            <Table.Cell>{i + 1}</Table.Cell>
            <Table.Cell>{milestoneData[i].days}</Table.Cell>
            <Table.Cell>
              <List>{objList}</List>
            </Table.Cell>
          </Table.Row>)
      }
    }

    return (
      <Modal closeIcon key='modal' onClose={this.handleClose} open={this.state.tokenSaleModalOpen} size='small' trigger={<a onClick={this.handleOpen} className='ui mini button blue' href='#!'>buy token</a>}>
        <Modal.Header>{project.projectName}</Modal.Header>
        <Modal.Content>
          <div className='ui grid stackable padded'>
            <div className='column sixteen wide'>
              {milestoneRows.length > 0 &&
                <Table celled>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Milestone ID</Table.HeaderCell>
                      <Table.HeaderCell>Days</Table.HeaderCell>
                      <Table.HeaderCell>Objectives</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {milestoneRows}
                  </Table.Body>
                </Table>
              }
              <Form>
                <Form.Field>
                  <label>Total Token Amount: {toStandardUnit(project.tokenInfo.numTokenLeft).toNumber()}</label>
                </Form.Field>
                <Form.Field>
                  <label>Rate: 1 ETH = {project.tokenInfo.rate.toNumber()} token</label>
                </Form.Field>
                <Form.Field>
                  <label>Total Token Sold: {commafy(toStandardUnit(project.tokenInfo.totalTokenSold).toNumber().toFixed(4))}</label>
                </Form.Field>
                <Form.Field>
                  <label>Total ETH Sold: {commafy(toStandardUnit(project.tokenInfo.totalEth).toNumber().toFixed(4))}</label>
                </Form.Field>
                <Form.Field>
                  <label>Input Token Amount to Buy</label>
                  <input value={this.state.buyTokenAmount} onChange={(e) => { this.handleInputChange('buyTokenAmount', e) }} placeholder='100' />
                </Form.Field>
                <Form.Field>
                  <label>Equal to {this.state.buyTokenAmount ? commafy((this.state.buyTokenAmount / project.tokenInfo.rate).toFixed(4)) : 0} ETH</label>
                </Form.Field>
                <Button primary disabled={!this.canBuyToken(project)} onClick={wrapWithTransactionInfo('buy-token', this.buyToken, project)} >Buy Token</Button>
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
                  <Segment>
                    <strong>Note: </strong> Please make sure your total token amount is large enough, it's not allowed to change after starting token sale.
                    <br />
                    <br />
                    You can withdraw reset tokens after stopping token sale.
                  </Segment>
                  <Form>
                    {this.state.tokenBalance && this.validAddress(this.state.tokenAddress) &&
                      <Form.Field>
                        <label>Your Token Balance: {this.state.tokenBalance}</label>
                      </Form.Field>
                    }
                    <Form.Field>
                      <label>Total Token</label>
                      <input value={this.state.totalToken} onChange={(e) => { this.handleInputChange('totalToken', e) }} placeholder='total token amount' />
                    </Form.Field>
                    <Form.Field>
                      <label>Token Rate (must be integer)</label>
                      <div className='add-text'>
                        <span>1 ETH = </span><input type='number' step='1' value={this.state.tokenRate} onChange={(e) => { this.handleInputChange('tokenRate', e) }} placeholder='token number' />
                      </div>
                    </Form.Field>
                    <Form.Field>
                      <label>Token Address</label>
                      <input value={this.state.tokenAddress} onChange={(e) => { this.handleInputChange('tokenAddress', e) }} placeholder='0x...' />
                    </Form.Field>
                    <Button primary disabled={!this.canStartTokenSale()} onClick={wrapWithTransactionInfo('start-token-sale', this.startTokenSale, project)} >Start Token Sale</Button>
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
      } else if ((stage === 'token-sale' && project.tokenInfo.finalized) || (stage === 'milestone') || (stage === 'complete')) {
        if (project.balance.toNumber() !== 0) {
          return (
            <Button primary onClick={wrapWithTransactionInfo('withdraw-rest-token', this.withdrawRestToken, project)} >withdraw rest token</Button>)
        }
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
    this.getMilestoneData()

    store.subscribe(x => {
      const state = store.getState()
      const eventList = ['REGISTRY_EVENT', 'REGISTRY_PROJECT_UPDATE_STATUS', 'MILESTONE_EVENT', 'REP_SYS_EVENT', 'REGULATING_RATING_EVENT', 'REFUND_MANAGER_EVENT', 'REWARD_MANAGER_EVENT']
      if (eventList.indexOf(state.type) >= 0) {
        this.getMilestoneData()
      }
    })
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  async getMilestoneData () {
    try {
      let data = await milestone.getMilestoneData(this.props.project)
      if (data && this._isMounted) {
        this.setState({
          milestoneData: data
        })
      }
    } catch (e) {
      toastr.error(e)
    }
  }

  handleInputChange (name, e) {
    let obj = {}
    if (name === 'tokenRate') {
      obj[name] = parseInt(e.target.value)
    } else {
      obj[name] = e.target.value
    }
    if (name === 'tokenAddress') {
      obj.tokenBalance = ''
    }
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
