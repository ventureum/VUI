import React, { Component } from 'react'
import saveFile from '../../../../utils/saveFile'
import { Grid, Table, Menu, Icon, Button, Segment, Modal, List } from 'semantic-ui-react'
import { Scrollbars } from 'react-custom-scrollbars'
import { Base64 } from 'js-base64'
import ReactJson from 'react-json-view'
import toastr from 'toastr'
import moment from 'moment'
import CSSModules from 'react-css-modules'
import styles from './styles.css'
import Form from 'react-jsonschema-form'
import JsonSchema from './schema.json'
import '../../../../bootstrap/css/bootstrap-iso.css'

var basePath = 'https://15mw7pha3h.execute-api.us-west-1.amazonaws.com/alpha'
var allRegulators = ['aa', 'bb', 'cc', 'dd']
var schema = JsonSchema.schema

class DelegateVotes extends Component {
  constructor (props) {
    super(props)

    schema.definitions.regulator.properties.name.enum = allRegulators
    schema.properties.regulators.maxItems = allRegulators.length
    schema.definitions.regulator.properties.name.default = allRegulators[0]

    this.state = {
      open: false,
      schema: schema,
      uiSchema: {
        'regulators': {
          'items': {
            'name': {
              "ui:options": {
                inline: true
              }
            }
          }
        }
      },
      formData: {},
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  updateSchema (selectedRegulators) {
    var uiSchema = {
      'regulators': {
        'items': {
          'name': {
            'ui:enumDisabled': selectedRegulators.slice(),
            "ui:options": {
              inline: true
            }
          }
        }
      }
    }
    var schema = this.state.schema
    for (let i = 0; i < allRegulators.length; i++) {
      if (selectedRegulators.indexOf(allRegulators[i]) < 0) {
        schema.definitions.regulator.properties.name.default = allRegulators[i]
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

  render () {
    const {
      open,
      schema,
      uiSchema,
      formData,
    } = this.state

    return (
      <Modal
        dimmer={false}
        open={open}
        onOpen={this.open}
        onClose={this.close}
        size='small'
        trigger={<Button primary>Delegate Votes</Button>}
        className='delegate-vote'
      >
        <Modal.Header>Delegate Votes</Modal.Header>
        <Modal.Content>
          <div className='bootstrap-iso'>
            <Form
              schema={schema}
              uiSchema={uiSchema}
              formData={formData}
              onChange={this.onChange}
              showErrorList={false}
              liveValidate
            />
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.submit}>Submit</Button>
          <Button icon='check' content='Close' onClick={this.close} />
        </Modal.Actions>
      </Modal>
    )
  }
}

class MilestoneModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false,
      milestone: this.props.data
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
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

  render () {
    const {
      open,
      milestone
    } = this.state

    var objs = []
    if (milestone.objectives) {
      for (let i = 0; i < milestone.objectives.length; i++) {
        objs.push(<List.Item as='li' key={milestone.name + milestone.objectives[i]}>{milestone.objectives[i]}</List.Item>)
      }
    }

    return (
      <Modal
        dimmer={false}
        open={open}
        onOpen={this.open}
        onClose={this.close}
        size='small'
        trigger={<a href='#!'>{milestone.name}</a>}
      >
        <Modal.Header>Milestone Info</Modal.Header>
        <Modal.Content>
          <List>
            <List.Item>
              <strong>Name: </strong>{milestone.name}
            </List.Item>
            <List.Item>
              <strong>Deadline: </strong>{moment(milestone.deadline).utc().format('YYYY-MM-DD HH:mm:ss')}
            </List.Item>
            <List.Item>
              <strong>Percentage of Funds Locked: </strong>{milestone.percentageOfFundsLocked}
            </List.Item>
            <List.Item>
              <strong>Objectives: </strong>
              <List.List as='ul'>
                {objs}
              </List.List>
            </List.Item>
          </List>
          <Button primary>Start Proxy Voting</Button>
          <DelegateVotes />
        </Modal.Content>
        <Modal.Actions>
          <Button icon='check' content='Close' onClick={this.close} />
        </Modal.Actions>
      </Modal>
    )
  }
}

class ProjectProfile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      project: props.project,
      projectData: null
    }

    this.onDownload = this.onDownload.bind(this)
    this.getProjectData = this.getProjectData.bind(this)
  }

  componentDidMount () {
    this.getProjectData()
  }

  async getProjectData () {
    try {
      let response = await fetch(basePath + '/project/' + this.state.project.projectName) // eslint-disable-line
      let body = await response.json()
      if (response.status === 200) {
        this.setState({
          projectData: JSON.parse(Base64.decode(body.data))
        })
      }
    } catch (error) {
      toastr.error('Failure:' + error)
    }
  }

  onDownload (event) {
    event.preventDefault()
    saveFile(JSON.stringify(this.state.projectData), this.state.projectName + '.json')
  }

  render () {
    const {
      project,
      projectData
    } = this.state

    var milestoneRows = []
    if (projectData) {
      var milestoneData = projectData.application.roadmapDefinition
      if (milestoneData) {
        for (let i = 0; i < milestoneData.length; i++) {
          milestoneRows.push(
            <Table.Row key={milestoneData[i].name}>
              <Table.Cell><MilestoneModal data={milestoneData[i]} /></Table.Cell>
              <Table.Cell>Inactive</Table.Cell>
              <Table.Cell>{moment(milestoneData[i].deadline).utc().format('YYYY-MM-DD HH:mm:ss')}</Table.Cell>
              <Table.Cell />
            </Table.Row>
          )
        }
      }
    }

    return (
      <div>
        <Grid>
          <Grid.Column width={6}>
            {projectData &&
            <Scrollbars style={{ height: 300 }}>
              <ReactJson src={projectData} displayDataTypes={false} displayObjectSize={false} enableClipboard={false} />
            </Scrollbars>
            }
            <div className='ui field'>
              <Button onClick={this.onDownload} color={'purple'}>
                Download
              </Button>
            </div>
          </Grid.Column>
          <Grid.Column width={9}>
            <Segment>
              <strong>Application Expiry: </strong>{moment.unix(project.applicationExpiry).utc().format('YYYY-MM-DD HH:mm:ss')}
            </Segment>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Milestone</Table.HeaderCell>
                  <Table.HeaderCell>Stage</Table.HeaderCell>
                  <Table.HeaderCell>Stage Ends</Table.HeaderCell>
                  <Table.HeaderCell>Action</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {milestoneRows}
              </Table.Body>

              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell colSpan='4'>
                    <Menu floated='right' pagination>
                      <Menu.Item as='a' icon>
                        <Icon name='chevron left' />
                      </Menu.Item>
                      <Menu.Item as='a'>1</Menu.Item>
                      <Menu.Item as='a'>2</Menu.Item>
                      <Menu.Item as='a'>3</Menu.Item>
                      <Menu.Item as='a'>4</Menu.Item>
                      <Menu.Item as='a' icon>
                        <Icon name='chevron right' />
                      </Menu.Item>
                    </Menu>
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Footer>
            </Table>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}
export default CSSModules(ProjectProfile, styles)
