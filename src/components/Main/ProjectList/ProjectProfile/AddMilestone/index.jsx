import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Button, Modal } from 'semantic-ui-react'
import Form from 'react-jsonschema-form'
import schema from './schema.json'
import toastr from 'toastr'
import milestone from '../../../../../services/milestone'
import { stopPropagation, wrapWithTransactionInfo } from '../../../../../utils/utils'
import styles from './styles.css'

const objTypes = JSON.parse(process.env.REACT_APP_OBJECTIVE_TYPES)
schema.definitions.obj.properties.type.enum = objTypes
schema.definitions.obj.properties.type.default = objTypes[0]

class AddMilestone extends Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      schema,
      formData: {
        days: 60,
        objs: [
          {
            name: 'objective 1',
            type: objTypes[0],
            reward: 10
          }
        ]
      }
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.onChange = this.onChange.bind(this)
    this.submit = this.submit.bind(this)
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

  async submit () {
    try {
      await milestone.addMilestone(this.props.project.projectName, this.state.formData)
      toastr.success('Milestone added successfully!')
      this.close()
    } catch (error) {
      toastr.error(error)
    }
  }

  render () {
    const {
      open,
      schema,
      formData
    } = this.state

    return (
      <Modal
        className='add-ms-modal'
        open={open}
        onOpen={this.open}
        onClose={stopPropagation(this.close)}
        size='small'
        closeIcon
        trigger={<Button color='blue'>Add Milestone</Button>}
      >
        <Modal.Header>Add Milestone</Modal.Header>
        <Modal.Content>
          <div className='bootstrap-iso'>
            <Form
              schema={schema}
              formData={formData}
              onSubmit={wrapWithTransactionInfo('add-milestone', this.submit)}
              onChange={this.onChange}
              showErrorList={false}
              liveValidate>
              <Button color='blue'>Submit</Button>
              <Button onClick={stopPropagation(this.close)}>Cancel</Button>
            </Form>
          </div>
        </Modal.Content>
      </Modal>
    )
  }
}

export default CSSModules(AddMilestone, styles)
