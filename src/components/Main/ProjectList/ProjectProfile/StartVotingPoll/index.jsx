import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Button, Modal, List } from 'semantic-ui-react'
import Form from 'react-jsonschema-form'
import toastr from 'toastr'
import moment from 'moment'
import repSys from '../../../../../services/repSys'
import { stopPropagation, wrapWithTransactionInfo } from '../../../../../utils/utils'
import JsonSchema from './schema.json'
import styles from './styles.css'

class StartVotingPoll extends Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      schema: JsonSchema,
      uiSchema: {
        'start': {
          'ui:widget': 'alt-datetime'
        },
        'end': {
          'ui:widget': 'alt-datetime'
        }
      },
      formData: {
        start: moment().utc().add(1, 'days').format('YYYY-MM-DDTHH:mm:ss.000Z'),
        end: moment.unix(props.milestone.endTime).utc().format('YYYY-MM-DDTHH:mm:ss.000Z')
      }
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.onChange = this.onChange.bind(this)
    this.validate = this.validate.bind(this)
    this.startVotingPoll = this.startVotingPoll.bind(this)
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

  onChange ({formData}) {
    this.setState({
      formData
    })
  }

  validate (formData, errors) {
    if (!formData.start) {
      errors.start.addError('Please choose start time.')
    }
    if (!formData.end) {
      errors.end.addError('Please choose end time.')
    }
    if (moment(formData.start) < moment().utc()) {
      errors.start.addError('Start time has passed.')
    }
    if (moment(formData.start) >= moment(formData.end)) {
      errors.end.addError('End time must be later than start time.')
    }
    if (moment(formData.end) > moment.unix(this.props.milestone.endTime)) {
      errors.end.addError('End time is larger than milestone end time.')
    }
    return errors
  }

  async startVotingPoll () {
    try {
      await repSys.startPoll(this.props.project.projectName, this.props.milestone, this.state.formData.start, this.state.formData.end)
      toastr.success('Voting poll started!')
      this.close()
    } catch (e) {
      toastr.error(e)
    }
  }

  render () {
    const {
      open,
      schema,
      uiSchema,
      formData
    } = this.state

    return (
      <Modal
        open={open}
        onOpen={this.open}
        onClose={stopPropagation(this.close)}
        size='small'
        closeIcon
        trigger={<Button color='blue'>start voting poll</Button>}
      >
        <Modal.Header>Start Voting Poll</Modal.Header>
        <Modal.Content>
          <div className='ui grid stackable padded'>
            <div className='column sixteen wide'>
              <List>
                <List.Item>
                  <strong>ID: </strong>{this.props.milestone.id}
                </List.Item>
                <List.Item>
                  <strong>Start Time: </strong>{moment.unix(this.props.milestone.startTime).utc().format('YYYY-MM-DD HH:mm:ss')}
                </List.Item>
                <List.Item>
                  <strong>End Time: </strong>{moment.unix(this.props.milestone.endTime).utc().format('YYYY-MM-DD HH:mm:ss')}
                </List.Item>
              </List>
              <div className='bootstrap-iso'>
                <Form
                  schema={schema}
                  uiSchema={uiSchema}
                  formData={formData}
                  onChange={this.onChange}
                  onSubmit={wrapWithTransactionInfo('start-poll', this.startVotingPoll)}
                  validate={this.validate}
                  showErrorList={false}
                  liveValidate>
                  <Button type='submit' primary >Start Voting Poll</Button>
                  <Button onClick={stopPropagation(this.close)}>Cancel</Button>
                </Form>
              </div>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}

export default CSSModules(StartVotingPoll, styles)
