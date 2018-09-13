import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Button, Modal, List, Form } from 'semantic-ui-react'
import toastr from 'toastr'
import { stopPropagation, wrapWithTransactionInfo } from '../../../../../../utils/utils'
import regulatingRating from '../../../../../../services/regulatingRating'
import styles from './styles.css'

class RegulatorVote extends Component {
  constructor (props) {
    super(props)

    this.state = {
      score: 0
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.submit = this.submit.bind(this)
  }

  open () {
    this.setState({
      open: true
    })
  }

  handleInputChange (e) {
    this.setState({
      score: e.target.value
    })
  }

  close () {
    this.setState({
      open: false
    })
  }

  async submit () {
    try {
      await regulatingRating.regulatorVote(this.props.project.projectName, this.props.milestone.id, this.props.milestone.objs[this.props.index], this.state.score)
      toastr.success('Score voted successfully!')
      this.close()
    } catch (e) {
      toastr.error(e)
    }
  }

  canSubmit () {
    if (this.state.score < 0) {
      toastr.error('Score must be greater than or equal to 0.')
      return false
    }
    if (this.state.score > this.props.project.maxScore) {
      toastr.error('Score must be less than or equal to ' + this.props.project.maxScore + '.')
      return false
    }
    return true
  }

  render () {
    const {
      open,
      score
    } = this.state

    let ms = this.props.milestone
    let project = this.props.project

    return (
      <Modal
        open={open}
        onOpen={this.open}
        onClose={stopPropagation(this.close)}
        closeIcon
        size='small'
        trigger={<Button primary>vote score</Button>}
        className='regulator-vote'
      >
        <Modal.Header>Regulator Vote</Modal.Header>
        <Modal.Content>
          <List>
            <List.Item>
              <strong>Objective: </strong>{ms.objsStrs[this.props.index]}
            </List.Item>
            <List.Item>
              <strong>Max Score: </strong>{project.maxScore}
            </List.Item>
          </List>
          <Form>
            <Form.Field>
              <label>Vote Score:</label>
              <input type='number' value={score} onChange={this.handleInputChange} placeholder='0' />
            </Form.Field>
            <Button disabled={!this.canSubmit()} primary onClick={wrapWithTransactionInfo('ms-regulator-vote', this.submit)} >Submit</Button>
            <Button onClick={stopPropagation(this.close)}>Cancel</Button>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}

export default CSSModules(RegulatorVote, styles)
