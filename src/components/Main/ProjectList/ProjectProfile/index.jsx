import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import saveFile from '../../../../utils/saveFile'
import { Grid, Table, Menu, Icon, Button } from 'semantic-ui-react'
import { Scrollbars } from 'react-custom-scrollbars'
import { Base64 } from 'js-base64'
import ReactJson from 'react-json-view'
import toastr from 'toastr'

var basePath = 'https://15mw7pha3h.execute-api.us-west-1.amazonaws.com/alpha'

class ProjectProfile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      projectName: props.projectName,
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
      let response = await fetch(basePath + '/project/' + this.state.projectName) // eslint-disable-line
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
      projectData
    } = this.state

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
                <Table.Row>
                  <Table.Cell>Milestone #1</Table.Cell>
                  <Table.Cell>Proxy Voting</Table.Cell>
                  <Table.Cell>2018-7-1</Table.Cell>
                  <Table.Cell>Vote</Table.Cell>
                </Table.Row>
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
export default CSSModules(ProjectProfile)
