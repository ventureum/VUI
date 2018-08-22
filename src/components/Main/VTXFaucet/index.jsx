import React, { Component } from 'react'
import { Modal, Form } from 'semantic-ui-react'
import InProgress from '../InProgress'
import sale from '../../../services/sale'
import toastr from 'toastr'
import { wrapWithTransactionInfo } from '../../../utils/utils'

import './styles.css'

class VTXFaucet extends Component {
  constructor (props) {
    super()

    this.state = {
      address: props.address,
      inProgress: false,
      modalOpen: false,
      tokenAmount: null
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.onTokenAmountKeyUp = this.onTokenAmountKeyUp.bind(this)
    this.requestToken = this.requestToken.bind(this)
  }

  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  onTokenAmountKeyUp (event) {
    this.setState({
      tokenAmount: event.target.value || 0
    })
  }

  handleClose () {
    this.setState({
      modalOpen: false
    })
  }

  handleOpen () {
    this.setState({
      modalOpen: true
    })
  }

  async requestToken () {
    const { tokenAmount } = this.state

    if (!tokenAmount) {
      toastr.error('Please enter amount of VTX to transfer')
      return false
    }

    this.setState({
      inProgress: true
    })

    try {
      await sale.purchaseTokens(tokenAmount)

      this.handleClose()
      this.setState({
        tokenAmount: null
      })

      toastr.success('Success')
    } catch (error) {
      toastr.error(error)
    }

    this.setState({
      inProgress: false
    })
  }

  render () {
    let {
      inProgress,
      modalOpen
    } = this.state

    return (
      <Modal onClose={this.handleClose} open={modalOpen} size='mini' trigger={<a onClick={this.handleOpen} href='#!'>&nbsp;(VTX Faucet)</a>}>
        <Modal.Header>VTX Faucet</Modal.Header>
        <Modal.Content>
          <div className='ui grid stackable aligned'>
            <div className='column sixteen wide'>
              <Form>
                <Form.Field>
                  <label>Rate: 1 ETH = 500,000 VTX</label>
                </Form.Field>
                <Form.Field>
                  <label>Input the amount of ETH you want to transfer</label>
                </Form.Field>
                <Form.Field>
                  <div className='ui input action mini'>
                    <input onKeyUp={this.onTokenAmountKeyUp} type='text' placeholder='1 ETH' />
                    <button onClick={wrapWithTransactionInfo('vtxfaucet', this.requestToken)} className='ui button blue tiny'>Transfer to VTX</button>
                  </div>
                </Form.Field>
              </Form>
            </div>
            {inProgress ? <InProgress /> : null}
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}

export default VTXFaucet
