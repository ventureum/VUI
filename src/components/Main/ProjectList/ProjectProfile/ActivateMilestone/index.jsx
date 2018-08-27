import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Button, Modal, Form, List, Message, Segment } from 'semantic-ui-react'
import toastr from 'toastr'
import milestone from '../../../../../services/milestone'
import regulatingRating from '../../../../../services/regulatingRating'
import { stopPropagation, wrapWithTransactionInfo, toStandardUnit, getReadableLength } from '../../../../../utils/utils'
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
      maxHour: 5,
      maxMinute: 0,
      weiLocked: 1,
      error: '',
      errorInput: ''
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.activate = this.activate.bind(this)
    this.setAllETH = this.setAllETH.bind(this)
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
    if (this.state.weiLocked > toStandardUnit(this.props.project.etherCanLock).toNumber()) {
      this.setState({
        error: 'Locked ETH amount exceeds project ETH balance.',
        errorInput: 'wei'
      })
      return false
    } else if (minTime >= maxTime) {
      this.setState({
        error: 'Minimum time must be less than maximum time.',
        errorInput: 'min'
      })
      return false
    } else if (maxTime > this.props.milestone.len) {
      this.setState({
        error: 'Maximum time exceeds the length of milestone.',
        errorInput: 'max'
      })
      return false
    }

    return true
  }

  activate () {
    if (this.checkInput()) {
      wrapWithTransactionInfo('activate', async () => {
        let minTime = this.getSeconds('min')
        let maxTime = this.getSeconds('max')
        try {
          await milestone.activate(this.props.project.projectName, this.props.milestone.id, this.state.weiLocked, minTime, maxTime, this.props.project.etherCanLock)
          if (this.props.milestone.id !== 1) {
            await regulatingRating.finalizeAllBids(this.props.project.projectName, this.props.milestone.id - 1)
          }
          toastr.success('Milestone activated!')
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

  setAllETH () {
    this.setState({
      weiLocked: toStandardUnit(this.props.project.etherCanLock).toNumber()
    })
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
              {this.props.lastone &&
                <Segment>
                  <strong>Notice: You should lock all project ETH balance in last milestone, otherwise you can't withdraw them after project is completed.</strong>
                </Segment>
              }
              <List>
                <List.Item>
                  <strong>ID: </strong>{this.props.milestone.id}
                </List.Item>
                <List.Item>
                  <strong>Length: </strong>{getReadableLength(this.props.milestone.len)}
                </List.Item>
                <List.Item>
                  <strong>Project ETH Balance: </strong>{toStandardUnit(this.props.project.etherCanLock).toNumber()}
                </List.Item>
              </List>
              {error &&
                <Message error header='Error' content={error} />
              }
              <Form>
                <Form.Field error={errorInput === 'wei'}>
                  <label>Input the amount of ETH Locked in this milestone</label>
                  <Form.Group inline>
                    <input type='number' value={weiLocked} onChange={(e) => { this.handleInputChange('weiLocked', e) }} placeholder='100' />
                    <Button color='blue' onClick={stopPropagation(this.setAllETH)} >All</Button>
                  </Form.Group>
                </Form.Field>
                <Form.Field>
                  <label>Minimum time to start voting poll after milestone start time</label>
                </Form.Field>
                <Form.Group inline className='date-group'>
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
                <Form.Group inline className='date-group'>
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
                <Button primary onClick={stopPropagation(this.activate)} >Activate</Button>
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
