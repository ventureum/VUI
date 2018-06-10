import React, { Component } from 'react'
import { Modal } from 'semantic-ui-react'
import InProgress from '../InProgress'
import sale from '../../../services/sale'
import toastr from 'toastr'
import { wrapWithTransactionInfo } from '../../../utils/utils'

import './styles.css'

class VTHFaucet extends Component {
  constructor (props) {
    super()

    this.state = {
      address: props.address,
      inProgress: false,
      modalOpen: false,
      tokenAmount: null,
      vthPrice: null
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.onTokenAmountKeyUp = this.onTokenAmountKeyUp.bind(this)
    this.requestToken = this.requestToken.bind(this)
  }

  componentDidMount () {
    this._isMounted = true

    this.getPrice()
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  async getPrice () {
    try {
      const vthPrice = await sale.getPrice()

      if (this._isMounted) {
        this.setState({
          vthPrice: vthPrice.toNumber()
        })
      }
    } catch (error) {
      toastr.error(error.message)
    }
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
    const {tokenAmount, vthPrice} = this.state

    if (!tokenAmount) {
      toastr.error('Please enter amount of VTH to transfer')
      return false
    }

    this.setState({
      inProgress: true
    })

    try {
      await sale.purchaseTokens(tokenAmount / vthPrice)

      this.handleClose()
      this.setState({
        tokenAmount: null
      })

      toastr.success('Success')
    } catch (error) {
      toastr.error(error.message)
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
      <Modal onClose={this.handleClose} open={modalOpen} size='mini' trigger={<a onClick={this.handleOpen} href='#!'>&nbsp;(VTH Faucet)</a>}>
        <Modal.Header>VTH Faucet</Modal.Header>
        <Modal.Content>
          <div className='ui grid stackable padded'>
            <div className='column five wide'>
              <div className='ui grid stackable center aligned'>
                <div className='column sixteen wide'>
                  <div className='ui input action mini'>
                    <input onKeyUp={this.onTokenAmountKeyUp} type='text' placeholder='100' />
                    <button onClick={wrapWithTransactionInfo('vthfaucet', this.requestToken)} className='ui button blue tiny'>Transfer VTH</button>
                  </div>
                </div>
              </div>
            </div>
            {inProgress ? <InProgress /> : null}
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}

export default VTHFaucet
