import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import toastr from 'toastr'
import styles from './styles.css'
import registry from '../../../services/registry'
import Form from 'react-jsonschema-form'
import { Grid, Container, Segment, Modal, Button } from 'semantic-ui-react'
import '../../../bootstrap/css/bootstrap-iso.css'
import { Base64 } from 'js-base64'
import JsonSchema from './schema.json'
import { toStandardUnit, wrapWithTransactionInfo } from '../../../utils/utils'
import ProjectPreview from '../ProjectPreview'

class Application extends Component {
  constructor () {
    super()

    this.state = {
      form: true,
      schema: JsonSchema.schema,
      uiSchema: JsonSchema.uiSchema,
      formData: JsonSchema.formData,
      liveValidate: true,
      minDeposit: null,
      displayModal: false
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.showModal = this.showModal.bind(this)
    this.hideModal = this.hideModal.bind(this)
  }

  componentDidMount () {
    this._isMounted = true

    this.getMinDeposit()
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  showModal () {
    this.setState({
      displayModal: true
    })
  }

  hideModal () {
    this.setState({
      displayModal: false
    })
  }

  async getMinDeposit () {
    const minDeposit = await registry.getMinDeposit()
    if (this._isMounted) {
      this.setState({minDeposit: minDeposit})
    }
  }

  async onSubmit () {
    this.hideModal()
    const { projectName } = this.state.formData

    if (!projectName) {
      toastr.error('Project name is required')
      return
    }

    try {
      await registry.apply(projectName)
      await fetch('https://15mw7pha3h.execute-api.us-west-1.amazonaws.com/alpha/project', { // eslint-disable-line
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'projectName': this.state.formData.projectName,
          'data': Base64.encode(JSON.stringify({application: this.state.formData}))
        })
      })
      toastr.success('Success')
    } catch (error) {
      toastr.error(error)
    }
  }

  onChange ({formData}) {
    this.setState({ formData })
  }

  validate ({ projectName }, errors) {
    if (!/^\w+$/.test(projectName)) {
      errors.projectName.addError('Project Name can only contain letters and numbers')
    }
    return errors
  }

  render () {
    const {
      schema,
      uiSchema,
      formData,
      minDeposit,
      displayModal
    } = this.state

    return (
      <div className='application'>
        <Modal size='large' open={displayModal} closeIcon onClose={this.hideModal}>
          <Modal.Header>Application Review</Modal.Header>
          <Modal.Content>
            <Segment>
              <strong>Please double check your application before submitting.</strong>
            </Segment>
            <ProjectPreview formData={formData} schema={JsonSchema.schema} />
            <Segment>
              <strong>Please double check your application before submitting.</strong>
            </Segment>
            <Button onClick={wrapWithTransactionInfo('apply', this.onSubmit)} color={'blue'}>
              Submit
            </Button>
          </Modal.Content>
        </Modal>
        <Grid stretched>
          <Container fluid>
            <Segment>
              <strong> Non-refundable Application Fees: </strong>{toStandardUnit(minDeposit).toNumber()} VTX
            </Segment>
            <div className='bootstrap-iso'>
              <Form
                schema={schema}
                uiSchema={uiSchema}
                formData={formData}
                onChange={this.onChange}
                onSubmit={this.showModal}
                validate={this.validate}
                showErrorList={false}
                liveValidate
              />
            </div>
          </Container>
        </Grid>
      </div>)
  }
}

export default CSSModules(Application, styles)
