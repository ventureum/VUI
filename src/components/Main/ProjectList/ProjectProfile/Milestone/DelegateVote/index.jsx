import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Button, Modal, List } from 'semantic-ui-react'
import Form from 'react-jsonschema-form'
import toastr from 'toastr'
import schema from './schema.json'
import { stopPropagation, toStandardUnit, wrapWithTransactionInfo } from '../../../../../../utils/utils'
import repSys from '../../../../../../services/repSys'
import styles from './styles.css'

// TODO: replace mock data with real data
var mockRegulatorName = JSON.parse(process.env.REACT_APP_MOCK_REGULATOR_NAME)
var mockRegulatorAddress = JSON.parse(process.env.REACT_APP_MOCK_REGULATOR_ADDRESS)

class DelegateVote extends Component {
  constructor (props) {
    super(props)

    let ms = props.milestone
    schema.definitions.regulator.properties.name.enum = mockRegulatorName
    schema.properties.regulators.maxItems = mockRegulatorName.length
    schema.definitions.regulator.properties.name.default = mockRegulatorName[0]
    schema.definitions.regulator.properties.votes.maximum = toStandardUnit(ms.voteRights[ms.objTypes[props.index]]).toNumber()
    this.voteRights = toStandardUnit(ms.voteRights[ms.objTypes[props.index]]) // keep precision

    this.state = {
      open: false,
      schema: schema,
      uiSchema: {
        'regulators': {
          'items': {
            'name': {
              'ui:options': {
                inline: true
              }
            }
          }
        }
      },
      formData: {}
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.onChange = this.onChange.bind(this)
    this.validate = this.validate.bind(this)
    this.submit = this.submit.bind(this)
  }

  updateSchema (selectedRegulators) {
    var uiSchema = {
      'regulators': {
        'items': {
          'name': {
            'ui:enumDisabled': selectedRegulators.slice(),
            'ui:options': {
              inline: true
            }
          }
        }
      }
    }
    var schema = this.state.schema
    for (let i = 0; i < mockRegulatorName.length; i++) {
      if (selectedRegulators.indexOf(mockRegulatorName[i]) < 0) {
        schema.definitions.regulator.properties.name.default = mockRegulatorName[i]
        break
      }
    }
    this.setState({
      uiSchema,
      schema
    })
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
    var selectedRegulators = []
    for (let i = 0; i < formData.regulators.length; i++) {
      selectedRegulators.push(formData.regulators[i].name)
    }
    if (selectedRegulators.length > 0) {
      this.updateSchema(selectedRegulators)
    }
    this.setState({
      formData
    })
  }

  validate (formData, errors) {
    let total = 0
    if (formData.regulators) {
      for (let i = 0; i < formData.regulators.length; i++) {
        total += formData.regulators[i].votes
        if (formData.regulators[i].votes === 0) {
          errors.regulators[i].votes.addError('Vote must large than 0.')
        }
      }
    }

    if (total > schema.definitions.regulator.properties.votes.maximum) {
      for (let i = 0; i < formData.regulators.length; i++) {
        errors.regulators[i].votes.addError('Total vote rights exceed ' + schema.definitions.regulator.properties.votes.maximum + '.')
      }
    }

    return errors
  }

  async submit () {
    try {
      let data = []
      for (let i = 0; i < this.state.formData.regulators.length; i++) {
        data.push({
          address: mockRegulatorAddress[mockRegulatorName.indexOf(this.state.formData.regulators[i].name)],
          votes: this.state.formData.regulators[i].votes
        })
      }
      await repSys.vote(this.props.project.projectName, this.props.milestone, this.props.milestone.objTypes[this.props.index], data, this.voteRights)
      toastr.success('Voted successfully!')
      this.setState({
        formData: {}
      }, () => {
        this.close()
      })
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

    let ms = this.props.milestone

    return (
      <Modal
        open={open}
        onOpen={this.open}
        onClose={stopPropagation(this.close)}
        closeIcon
        size='small'
        trigger={<Button primary>vote</Button>}
        className='delegate-vote'
      >
        <Modal.Header>Delegate Votes</Modal.Header>
        <Modal.Content>
          <List>
            <List.Item>
              <strong>Objective Type: </strong>{ms.objTypesStrs[this.props.index]}
            </List.Item>
            <List.Item>
              <strong>Vote Rights: </strong>{toStandardUnit(ms.voteRights[ms.objTypes[this.props.index]]).toNumber()}
            </List.Item>
          </List>
          <div className='bootstrap-iso'>
            <Form
              schema={schema}
              uiSchema={uiSchema}
              formData={formData}
              onSubmit={wrapWithTransactionInfo('ms-vote', this.submit)}
              onChange={this.onChange}
              validate={this.validate}
              showErrorList={false}
              liveValidate
            >
              <Button primary>Submit</Button>
              <Button content='Close' onClick={stopPropagation(this.close)} />
            </Form>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}

export default CSSModules(DelegateVote, styles)
