import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Button, Modal, Form, List, Message } from 'semantic-ui-react'
import toastr from 'toastr'
import milestone from '../../../../../services/milestone'
import regulatingRating from '../../../../../services/regulatingRating'
import { stopPropagation, dayToSeconds, wrapWithTransactionInfo } from '../../../../../utils/utils'
import styles from './styles.css'

class ActivateMilestone extends Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      minDay: 0,
      minHour: 0,
      minMinute: 0,
      maxDay: 0,
      maxHour: 0,
      maxMinute: 0,
      weiLocked: '',
      error: '',
      errorInput: ''
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.activate = this.activate.bind(this)
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

  getSeconds (name) {
    let day = this.state[name + 'Day'] * 24 * 60 * 60
    let hour = this.state[name + 'Hour'] * 60 * 60
    let minute = this.state[name + 'Minute'] * 60
    return day + hour + minute
  }

  checkInput () {
    let minTime = this.getSeconds('min')
    let maxTime = this.getSeconds('max')
    if (!this.state.weiLocked) {
      this.setState({
        error: 'Please enter ETH amount.',
        errorInput: 'wei'
      })
      return false
    } else if (minTime >= maxTime) {
      this.setState({
        error: 'Minimum time must less than maximum time.',
        errorInput: 'min'
      })
      return false
    } else if (maxTime > dayToSeconds(this.props.milestone.days)) {
      this.setState({
        error: 'Maximum time must less than or equal to the length of milestone.',
        errorInput: 'max'
      })
      return false
    }

    return true
  }

  async activate () {
    if (this.checkInput()) {
      let minTime = this.getSeconds('min')
      let maxTime = this.getSeconds('max')
      try {
        await milestone.activate(this.props.project.projectName, this.props.milestone.id, this.state.weiLocked, minTime, maxTime)
        if (this.props.milestone.id !== 1) {
          await regulatingRating.finalizeAllBids(this.props.project.projectName, this.props.milestone.id - 1)
        }
        toastr.success('Milestone activated!')
        this.close()
      } catch (e) {
        toastr.error(e)
      }
    }
  }

  handleInputChange (name, e) {
    let nameMap = {
      'weiLocked': 'wei',
      'minDay': 'min',
      'minHour': 'min',
      'minMinute': 'min',
      'maxDay': 'max',
      'maxHour': 'max',
      'maxMinute': 'max'
    }
    this.setState({
      error: '',
      errorInput: ''
    })
    let obj = {}
    if (e.target.value < 0) {
      obj[name] = 0
    } else {
      obj[name] = Math.round(e.target.value)
    }
    this.setState(obj)
  }

  render () {
    const {
      open,
      weiLocked,
      minDay,
      minHour,
      minMinute,
      maxDay,
      maxHour,
      maxMinute,
      error,
      errorInput
    } = this.state

    return (
      <Modal
        className='activate-ms-modal'
        open={open}
        onOpen={this.open}
        onClose={stopPropagation(this.close)}
        closeIcon
        size='mini'
        trigger={<Button color='green'>activate</Button>}
      >
        <Modal.Header>Activate Milestone</Modal.Header>
        <Modal.Content>
          <div className='ui grid stackable padded'>
            <div className='column sixteen wide'>
              <List>
                <List.Item>
                  <strong>ID: </strong>{this.props.milestone.id}
                </List.Item>
                <List.Item>
                  <strong>Length: </strong>{this.props.milestone.days} days
                </List.Item>
              </List>
              {error &&
                <Message error header='Error' content={error} />
              }
              <Form>
                <Form.Field error={errorInput === 'wei'}>
                  <label>Input the amount of ETH Locked in this milestone</label>
                  <input type='number' value={weiLocked} onChange={(e) => { this.handleInputChange('weiLocked', e) }} placeholder='100' />
                </Form.Field>
                <Form.Field>
                  <label>Minimum time to start voting poll after milestone start time</label>
                </Form.Field>
                <Form.Group inline>
                  <Form.Field error={errorInput === 'min'}>
                    <input type='number' step='1' placeholder='0' value={minDay} onChange={(e) => { this.handleInputChange('minDay', e) }} />
                    <label>day(s)</label>
                  </Form.Field>
                  <Form.Field error={errorInput === 'min'}>
                    <input type='number' step='1' placeholder='0' value={minHour} onChange={(e) => { this.handleInputChange('minHour', e) }} />
                    <label>hour(s)</label>
                  </Form.Field>
                  <Form.Field error={errorInput === 'min'}>
                    <input type='number' step='1' placeholder='0' value={minMinute} onChange={(e) => { this.handleInputChange('minMinute', e) }} />
                    <label>minute(s)</label>
                  </Form.Field>
                </Form.Group>
                <Form.Field>
                  <label>Maximum time to start voting poll after milestone start time</label>
                </Form.Field>
                <Form.Group inline>
                  <Form.Field error={errorInput === 'max'}>
                    <input type='number' step='1' placeholder='0' value={maxDay} onChange={(e) => { this.handleInputChange('maxDay', e) }} />
                    <label>day(s)</label>
                  </Form.Field>
                  <Form.Field error={errorInput === 'max'}>
                    <input type='number' step='1' placeholder='0' value={maxHour} onChange={(e) => { this.handleInputChange('maxHour', e) }} />
                    <label>hour(s)</label>
                  </Form.Field>
                  <Form.Field error={errorInput === 'max'}>
                    <input type='number' step='1' placeholder='0' value={maxMinute} onChange={(e) => { this.handleInputChange('maxMinute', e) }} />
                    <label>minute(s)</label>
                  </Form.Field>
                </Form.Group>
                <Button primary onClick={stopPropagation(wrapWithTransactionInfo('activate', this.activate))} >Activate</Button>
                <Button onClick={stopPropagation(this.close)}>Cancel</Button>
              </Form>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}

export default CSSModules(ActivateMilestone, styles)
