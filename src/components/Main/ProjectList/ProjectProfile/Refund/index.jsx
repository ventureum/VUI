import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Button, Modal, Form, List, Message, Segment } from 'semantic-ui-react'
import toastr from 'toastr'
import refundManager from '../../../../../services/refundManager'
import { stopPropagation, dayToSeconds, toStandardUnit, wrapWithTransactionInfo } from '../../../../../utils/utils'
import styles from './styles.css'

class Refund extends Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      amount: '',
      error: '',
      errorInput: ''
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.refund = this.refund.bind(this)
  }

  open () {
    this.setState({
      open: true
    })
  }

  close () {
    this.setState({
      open: false
    })
  }

  checkInput () {
    if (!this.state.amount) {
      this.setState({
        error: 'Please enter refund amount.',
        errorInput: 'amount'
      })
      return false
    } else if (this.state.amount > toStandardUnit(this.props.project.balance).toNumber()) {
      this.setState({
        error: 'Refund amount exceeds your balance.',
        errorInput: 'amount'
      })
      return false
    } else if (this.state.amount > toStandardUnit(this.props.milestone.restWeiLock.times(this.props.project.tokenInfo.rate)).toNumber()) {
      this.setState({
        error: 'Refund amount exceeds rest ETH locked.',
        errorInput: 'amount'
      })
      return false
    }

    return true
  }

  refund () {
    if (this.checkInput()) {
      wrapWithTransactionInfo('refund', async () => {
        try {
          await refundManager.refund(this.props.project, this.props.milestone.id, this.state.amount)
          toastr.success('Refund successfully!')
          this.close()
        } catch (e) {
          toastr.error(e)
        }
      })()
    }
  }

  handleInputChange (name, e) {
    this.setState({
      error: '',
      errorInput: ''
    })
    let obj = {}
    if (e.target.value < 0) {
      obj[name] = 0
    } else {
      obj[name] = e.target.value
    }
    this.setState(obj)
  }

  render () {
    const {
      open,
      amount,
      error,
      errorInput
    } = this.state

    return (
      <Modal
        open={open}
        onOpen={this.open}
        onClose={stopPropagation(this.close)}
        closeIcon
        size='mini'
        trigger={<Button color='blue'>refund</Button>}
      >
        <Modal.Header>Refund</Modal.Header>
        <Modal.Content>
          <div className='ui grid stackable padded'>
            <div className='column sixteen wide'>
              <Segment>
                <strong>Notice: You can only refund once in each milestone.</strong>
              </Segment>
              <List>
                <List.Item>
                  <strong>Milestone ID: </strong>{this.props.milestone.id}
                </List.Item>
                <List.Item>
                  <strong>Length: </strong>{this.props.milestone.days} days
                </List.Item>
                <List.Item>
                  <strong>Total Amount: </strong>{toStandardUnit(this.props.project.balance).toNumber()}
                </List.Item>
                <List.Item>
                  <strong>Locked ETH: </strong>{toStandardUnit(this.props.milestone.restWeiLock).toNumber()}
                </List.Item>
                <List.Item>
                  <strong>Locked ETH equals to project token: </strong>{toStandardUnit(this.props.milestone.restWeiLock.times(this.props.project.tokenInfo.rate)).toNumber()}
                </List.Item>
              </List>
              {error &&
                <Message error header='Error' content={error} />
              }
              <Form>
                <Form.Field error={errorInput === 'amount'}>
                  <label>Input the amount of token you want to refund</label>
                  <input type='number' value={amount} onChange={(e) => { this.handleInputChange('amount', e) }} placeholder='100' />
                </Form.Field>
                <Button primary onClick={stopPropagation(this.refund)} >Refund</Button>
                <Button onClick={stopPropagation(this.close)}>Cancel</Button>
              </Form>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}

export default CSSModules(Refund, styles)
