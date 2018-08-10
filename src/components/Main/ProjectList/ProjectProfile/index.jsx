import React, { Component } from 'react'
import saveFile from '../../../../utils/saveFile'
import { Grid, Table, Button, Segment, Form } from 'semantic-ui-react'
import { Scrollbars } from 'react-custom-scrollbars'
import { Base64 } from 'js-base64'
import ReactJson from 'react-json-view'
import toastr from 'toastr'
import commafy from 'commafy'
import moment from 'moment'
import CSSModules from 'react-css-modules'
import styles from './styles.css'
import Milestone from './Milestone'
import AddMilestone from './AddMilestone'
import ActivateMilestone from './ActivateMilestone'
import Refund from './Refund'
import StartVotingPoll from './StartVotingPoll'
import Countdown from '../Countdown'
import milestone from '../../../../services/milestone'
import refundManager from '../../../../services/refundManager'
import paymentManager from '../../../../services/paymentManager'
import repSys from '../../../../services/repSys'
import store from '../../../../store'
import { dayToSeconds, wrapWithTransactionInfo, toStandardUnit, currentTimestamp } from '../../../../utils/utils'

var basePath = 'https://15mw7pha3h.execute-api.us-west-1.amazonaws.com/alpha'

class ProjectProfile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      project: props.project,
      projectData: null,
      milestoneData: null,
      waitingTime: null,
      timestamp: currentTimestamp()
    }

    this.onDownload = this.onDownload.bind(this)
    this.getProjectData = this.getProjectData.bind(this)
    this.startRatingStage = this.startRatingStage.bind(this)
    this.startRefund = this.startRefund.bind(this)
    this.withdrawRefund = this.withdrawRefund.bind(this)
    this.finalize = this.finalize.bind(this)
    this.withdrawWeiLocked = this.withdrawWeiLocked.bind(this)
  }

  componentDidMount () {
    this._isMounted = true
    this.getProjectData()
    this.getMilestoneData()

    store.subscribe(async (x) => {
      const state = store.getState()
      const eventList = ['REGISTRY_EVENT', 'REGISTRY_PROJECT_UPDATE_STATUS', 'MILESTONE_EVENT', 'REP_SYS_EVENT', 'REGULATING_RATING_EVENT', 'REFUND_MANAGER_EVENT', 'REWARD_MANAGER_EVENT', 'PAYMENT_MANAGER_EVENT']
      if (eventList.indexOf(state.type) >= 0) {
        this.getMilestoneData()
      }
      if (state.type === 'UPDATE_TIMESTAMP') {
        let timestamp = await currentTimestamp(false)
        if (this._isMounted) {
          this.setState({
            timestamp
          })
        }
      }
    })
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  async getMilestoneData () {
    try {
      let data = await milestone.getMilestoneData(this.state.project)
      if (data && this._isMounted) {
        this.checkWait(data)
        this.setState({
          milestoneData: data
        })
      }
    } catch (e) {
      toastr.error(e)
    }
  }

  async getProjectData () {
    try {
      let response = await fetch(basePath + '/project/' + this.state.project.projectName) // eslint-disable-line
      let body = await response.json()
      if (response.status === 200 && this._isMounted) {
        this.setState({
          projectData: JSON.parse(Base64.decode(body.data))
        })
      }
    } catch (e) {
      toastr.error(e)
    }
  }

  onDownload (event) {
    event.preventDefault()
    saveFile(JSON.stringify(this.state.projectData), this.state.project.projectName + '.json')
  }

  canRefund (ms) {
    return ms.refundInfo.availableTime === 0 && !ms.refundInfo.canWithdraw && ms.refundInfo.ethRefund.toNumber() === 0
  }

  canCall (name, ms) {
    let project = this.state.project
    let msData = this.state.milestoneData
    let now = this.state.timestamp
    if (project.controllerStageStr !== 'token-sale' && project.controllerStageStr !== 'milestone') {
      return false
    }
    if (project.controllerStageStr === 'token-sale' && !project.tokenInfo.finalized) {
      return false
    }
    if (name === 'activate') {
      return project.isOwner && ms.stateStr === 'inactive' && (ms.id === 1 || (msData[ms.id - 2].endTime !== 0 && now >= msData[ms.id - 2].endTime))
    } else if (name === 'startPoll') {
      return ms.stateStr === 'ip' && !ms.pollExist && now >= ms.pollInfo.minStartTime && now < ms.pollInfo.maxStartTime
    } else if (name === 'startRatingStage') {
      return project.isOwner && ms.stateStr === 'ip' && ms.pollExist && now >= ms.startTime && now < ms.endTime - dayToSeconds(30)
    } else if (name === 'startRefund') {
      return ms.stateStr !== 'rp' && ms.endTime !== 0 && now >= ms.endTime - dayToSeconds(7) && now < ms.endTime
    } else if (name === 'refund') {
      return ms.stateStr === 'rp' && project.balance.toNumber() > 0 && ms.restWeiLock.toNumber() > 0 && this.canRefund(ms)
    } else if (name === 'withdrawRefund') {
      return ms.refundInfo.canWithdraw
    } else if (name === 'finalize') {
      return project.isOwner && ms.id === this.state.milestoneData.length && ms.endTime !== 0 && now >= ms.endTime
    } else if (name === 'withdrawWeiLocked') {
      return project.isOwner && ms.stateStr === 'completion' && ms.restWeiLock.toNumber() > 0
    }
  }

  async withdrawWeiLocked (ms) {
    try {
      await paymentManager.withdraw(this.state.project.projectName, ms.id)
      toastr.success('ETH withdrawed successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  async startPoll (ms) {
    try {
      await repSys.startPoll(this.state.project.projectName, ms)
      toastr.success('Poll started successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  async startRatingStage (ms) {
    try {
      await milestone.startRatingStage(this.state.project.projectName, ms.id)
      toastr.success('Rating stage started successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  async startRefund (ms) {
    try {
      await milestone.startRefundStage(this.state.project.projectName, ms.id)
      toastr.success('Refund process started successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  async withdrawRefund (ms) {
    try {
      await refundManager.withdraw(this.state.project.projectName, ms.id)
      toastr.success('Refund withdrawed successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  async finalize (ms) {
    try {
      await milestone.finalize(this.state.project.projectName, ms.id)
      toastr.success('Milestone finalied successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  getRewards () {
    if (this.state.milestoneData) {
      let total = 0
      let ms = this.state.milestoneData
      for (let i = 0; i < ms.length; i++) {
        for (let j = 0; j < ms[i].objsStrs.length; j++) {
          total += toStandardUnit(ms[i].objRewards[j]).toNumber()
        }
      }
      return total
    }
  }

  checkWait (data) {
    let now = this.state.timestamp
    let ms = data
    for (let i = 0; i < ms.length; i++) {
      if (ms[i].stateStr === 'ip' && !ms[i].pollExist && now < ms[i].pollInfo.minStartTime) {
        this.setState({
          waitingTime: ms[i].pollInfo.minStartTime
        })
      }
    }
  }

  render () {
    const {
      project,
      projectData,
      milestoneData,
      waitingTime
    } = this.state

    var milestoneRows = []
    if (milestoneData) {
      for (let i = 0; i < milestoneData.length; i++) {
        milestoneRows.push(
          <Table.Row key={milestoneData[i].id}>
            <Table.Cell><Milestone milestone={milestoneData[i]} project={project} /></Table.Cell>
            <Table.Cell>{milestoneData[i].stateStrReadable}</Table.Cell>
            <Table.Cell>{toStandardUnit(milestoneData[i].restWeiLock).toNumber()}</Table.Cell>
            <Table.Cell>
              {this.canCall('activate', milestoneData[i]) &&
                <ActivateMilestone project={project} milestone={milestoneData[i]} lastone={i === milestoneData.length - 1} />
              }
              {this.canCall('startPoll', milestoneData[i]) &&
                <StartVotingPoll project={project} milestone={milestoneData[i]} />
              }
              {this.canCall('startRatingStage', milestoneData[i]) &&
                <Button onClick={wrapWithTransactionInfo('start-rating-stage', this.startRatingStage, milestoneData[i])} color={'blue'}>
                  start rating stage
                </Button>
              }
              {this.canCall('startRefund', milestoneData[i]) &&
                <Button onClick={wrapWithTransactionInfo('start-refund', this.startRefund, milestoneData[i])} color={'blue'}>
                  start refund
                </Button>
              }
              {this.canCall('refund', milestoneData[i]) &&
                <Refund project={project} milestone={milestoneData[i]} />
              }
              {this.canCall('withdrawRefund', milestoneData[i]) &&
                <Button onClick={wrapWithTransactionInfo('withdraw-refund', this.withdrawRefund, milestoneData[i])} color={'blue'}>
                  withdraw refund
                </Button>
              }
              {this.canCall('finalize', milestoneData[i]) &&
                <Button onClick={wrapWithTransactionInfo('finalize', this.finalize, milestoneData[i])} color={'red'}>
                  finalize
                </Button>
              }
              {this.canCall('withdrawWeiLocked', milestoneData[i]) &&
                <Button onClick={wrapWithTransactionInfo('withdraw-weilocked', this.withdrawWeiLocked, milestoneData[i])} color={'blue'}>
                  withdraw ETH locked
                </Button>
              }
            </Table.Cell>
          </Table.Row>
        )
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
              <br />
              <strong>Your Project Token Balance: </strong>{toStandardUnit(project.balance).toNumber()}
              <br />
              <strong>Project ETH Balance: </strong>{toStandardUnit(project.etherCanLock).toNumber()}
            </Segment>
            {project.controllerStageStr === 'token-sale' &&
              <Segment>
                {milestoneData &&
                  <Form.Field>
                    <label><strong>Total Milestone Rewards: </strong>{this.getRewards()}</label>
                  </Form.Field>
                }
                <Form.Field>
                  <label><strong>Total Token Amount: </strong>{toStandardUnit(project.tokenInfo.numTokenLeft).toNumber()}</label>
                </Form.Field>
                <Form.Field>
                  <label><strong>Rate: </strong>1 ETH = {project.tokenInfo.rate.toNumber()} token</label>
                </Form.Field>
                <Form.Field>
                  <label><strong>Total Token Sold: </strong>{commafy(toStandardUnit(project.tokenInfo.totalTokenSold).toNumber().toFixed(4))}</label>
                </Form.Field>
                <Form.Field>
                  <label><strong>Total ETH Sold: </strong>{commafy(toStandardUnit(project.tokenInfo.totalEth).toNumber().toFixed(4))}</label>
                </Form.Field>
              </Segment>
            }
            {waitingTime &&
              <Segment>
                <strong>Next voting poll will starts in: </strong>
                <Countdown endDate={waitingTime} />
              </Segment>
            }
            {project.isOwner && project.controllerStageStr === 'accepted' &&
              <AddMilestone project={project} />
            }
            {milestoneRows.length > 0 &&
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Milestone</Table.HeaderCell>
                    <Table.HeaderCell>State</Table.HeaderCell>
                    <Table.HeaderCell>ETH Locked</Table.HeaderCell>
                    <Table.HeaderCell>Action</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {milestoneRows}
                </Table.Body>
              </Table>
            }
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}
export default CSSModules(ProjectProfile, styles)
