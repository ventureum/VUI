import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import toastr from 'toastr'
import moment from 'moment'
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
      formData: null,
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

    let _data = JSON.parse(JSON.stringify(this.state.formData))
    if (_data.tokenSaleDetails.dateOfTokenSaleOrDistribution.StartTime) {
      _data.tokenSaleDetails.dateOfTokenSaleOrDistribution.StartTime = moment(_data.tokenSaleDetails.dateOfTokenSaleOrDistribution.StartTime.replace('.000Z', '').replace('T', ' ')).utc().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z'
    }
    if (_data.tokenSaleDetails.dateOfTokenSaleOrDistribution.EndTime) {
      _data.tokenSaleDetails.dateOfTokenSaleOrDistribution.EndTime = moment(_data.tokenSaleDetails.dateOfTokenSaleOrDistribution.EndTime.replace('.000Z', '').replace('T', ' ')).utc().format('YYYY-MM-DDTHH:mm:ss.000') + 'Z'
    }

    try {
      await registry.apply(projectName)
      await fetch(process.env.REACT_APP_APPLICATION_API_GATEWAY + '/project', { // eslint-disable-line
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'projectName': this.state.formData.projectName,
          'data': Base64.encode(JSON.stringify({application: _data}))
        })
      })
      toastr.success('Success')
    } catch (error) {
      toastr.error(error)
    }
  }

  onChange ({formData}) {
    this.setState({
      formData
    })
  }

  validate ({ projectName }, errors) {
    if (!projectName) {
      errors.projectName.addError('Project Name cannot be empty')
    }
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

    let _formData
    if (formData) {
      _formData = JSON.parse(JSON.stringify(formData))
      if (_formData.tokenSaleDetails.dateOfTokenSaleOrDistribution.StartTime) {
        _formData.tokenSaleDetails.dateOfTokenSaleOrDistribution.StartTime = moment(_formData.tokenSaleDetails.dateOfTokenSaleOrDistribution.StartTime).format('YYYY-MM-DD HH:mm:ss')
      }
      if (_formData.tokenSaleDetails.dateOfTokenSaleOrDistribution.EndTime) {
        _formData.tokenSaleDetails.dateOfTokenSaleOrDistribution.EndTime = moment(_formData.tokenSaleDetails.dateOfTokenSaleOrDistribution.EndTime).format('YYYY-MM-DD HH:mm:ss')
      }
    }

    return (
      <div className='application'>
        <Modal size='large' open={displayModal} closeIcon onClose={this.hideModal}>
          <Modal.Header>Application Review</Modal.Header>
          <Modal.Content>
            <Segment>
              <strong>Please double check your application before submitting.</strong>
            </Segment>
            <ProjectPreview formData={_formData} schema={JsonSchema.schema} />
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
              <strong>Non-refundable Application Fees: </strong>{toStandardUnit(minDeposit).toNumber()} VTX
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
