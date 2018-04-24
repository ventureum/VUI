import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import toastr from 'toastr'
import styles from './styles.css'
import registry from '../../../services/registry'
import Form from 'react-jsonschema-form'
import { Grid, Container } from 'semantic-ui-react'
import '../../../bootstrap/css/bootstrap-iso.css'
import { Base64 } from 'js-base64'

class Application extends Component {
  constructor () {
    super()

    this.state = {
      form: true,
      schema: {
        'title': 'Ventureum Token Curated Registry Application',
        'type': 'object',
        'required': [
          'projectName'
        ],
        'properties': {
          'projectName': {
            'type': 'string',
            'title': 'Project Name'
          },
          'projectMission': {
            'type': 'string',
            'title': 'Project Mission'
          },
          'projectDescription': {
            'type': 'string',
            'title': 'Project Description'
          }
        }
      },
      uiSchema: {
        projectName: {
          'ui:autofocus': true,
          'ui:emptyValue': ''
        }
      },
      formData: {
        'projectName': '',
        'projectMission': '',
        'projectDescription': ''
      },
      liveValidate: true
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  async onSubmit () {
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
      toastr.error('Failure:' + error)
    }
  }

  onChange ({formData}) {
    this.setState({ formData })
  }

  render () {
    return (
      <div className='application'>
        <Grid stretched>
          <Container fluid>
            <div className='bootstrap-iso'>
              <Form
                schema={this.state.schema}
                uiSchema={this.state.uiSchema}
                formData={this.state.formData}
                onChange={this.onChange}
                onSubmit={this.onSubmit}
                onError={console.log('errors')}
              />
            </div>
          </Container>
        </Grid>
      </div>)
  }
}

export default CSSModules(Application, styles)
