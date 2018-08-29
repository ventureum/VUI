import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Button, Modal, List, Table } from 'semantic-ui-react'
import moment from 'moment'
import toastr from 'toastr'
import store from '../../../../../store'
import milestone from '../../../../../services/milestone'
import regulatingRating from '../../../../../services/regulatingRating'
import rewardManager from '../../../../../services/rewardManager'
import DelegateVote from './DelegateVote'
import RegulatorVote from './RegulatorVote'
import { stopPropagation, toStandardUnit, wrapWithTransactionInfo, currentTimestamp, getReadableLength } from '../../../../../utils/utils'
import styles from './styles.css'

let env = process.env.REACT_APP_ENV

class MilestoneModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false,
      timestamp: currentTimestamp()
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.writeAvailableVotes = this.writeAvailableVotes.bind(this)
    this.bid = this.bid.bind(this)
    this.backout = this.backout.bind(this)
    this.finalize = this.finalize.bind(this)
    this.finalizeAllBids = this.finalizeAllBids.bind(this)
    this.sendGas = this.sendGas.bind(this)
    this.withdrawReward = this.withdrawReward.bind(this)
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

  canCall (name, i) {
    let ms = this.props.milestone
    let project = this.props.project
    let now = this.state.timestamp
    if (name === 'vote') {
      return ms.stateStr === 'ip' && ms.pollExist && !ms.pollExpired && ms.voteObtained && ms.voteRights.canVote && ms.voteRights[ms.objTypes[i]].toNumber() > 0
    } else if (name === 'sendGas') {
      return ms.stateStr === 'ip' && ms.pollExist && !ms.pollExpired && !ms.voteObtained && now > ms.pollInfo.minStartTime && typeof ms.estimateGas === 'number' && ms.gasSent.lt(ms.estimateGas)
    } else if (name === 'writeAvailableVotes') {
      return ms.stateStr === 'ip' && ms.pollExist && !ms.pollExpired && !ms.voteObtained && now > ms.pollInfo.minStartTime && typeof ms.estimateGas === 'number' && ms.gasSent.gte(ms.estimateGas)
    } else if (name === 'test-writeAvailableVotes') {
      return ms.stateStr === 'ip' && ms.pollExist && !ms.pollExpired && !ms.voteObtained
    } else if (name === 'bid') {
      return ms.stateStr === 'rs' && now < ms.endTime - project.ratingStageMaxStartTime && !ms.objFinalized[i] && !ms.bidInfo[i]
    } else if (name === 'backout') {
      return ms.stateStr === 'rs' && now < ms.endTime - project.ratingStageMaxStartTime && !ms.objFinalized[i] && ms.bidInfo[i]
    } else if (name === 'vote score') {
      let isRVStage = ms.stateStr !== 'completion' && now >= ms.endTime - project.ratingStageMaxStartTime && now < ms.endTime - project.refundStageMinStartTime
      let RVStageExpire = now >= ms.endTime - project.refundStageMinStartTime
      return ms.objIsRegulators[i] && ms.bidInfo[i] && ((ms.objFinalized[i] && !RVStageExpire) || isRVStage)
    } else if (name === 'finalizeBid') {
      return project.isOwner && !['inactive', 'ip'].includes(ms.stateStr) && !ms.objFinalized[i]
    } else if (name === 'finalizeAllBids') {
      return project.isOwner && !['inactive', 'ip'].includes(ms.stateStr) && ms.objFinalized.includes(false)
    } else if (name === 'withdrawReward') {
      return ms.objFinalized[i] && ms.rewardInfo[i] && ms.rewardInfo[i].isRegulator && ms.rewardInfo[i].finalized && ms.rewardInfo[i].rewards.toNumber() > 0
    }
  }

  async sendGas () {
    try {
      await milestone.sendGas(this.props.project.projectName, this.props.milestone.id, String(this.props.milestone.estimateGas))
      toastr.success('Gas sent successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  async writeAvailableVotes () {
    try {
      let elem = document.querySelector('#write-votes')
      elem.classList.add('loading')
      elem.classList.add('disabled')
      await milestone.writeAvailableVotes(this.props.project.projectName, this.props.milestone.id)
    } catch (e) {
      toastr.error(e)
    }
  }

  async bid (i) {
    try {
      await regulatingRating.bid(this.props.project.projectName, this.props.milestone.id, this.props.milestone.objs[i])
      toastr.success('Bidded successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  async backout (i) {
    try {
      await regulatingRating.backout(this.props.project.projectName, this.props.milestone.id, this.props.milestone.objs[i])
      toastr.success('Backout successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  async finalize (i) {
    try {
      await regulatingRating.finalizeBidForObj(this.props.project.projectName, this.props.milestone.id, this.props.milestone.objs[i])
      toastr.success('Bid finalized successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  async finalizeAllBids () {
    try {
      await regulatingRating.finalizeAllBids(this.props.project.projectName, this.props.milestone.id)
      toastr.success('All bids finalized successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  async withdrawReward (i) {
    try {
      await rewardManager.withdraw(this.props.project.projectName, this.props.milestone.id, this.props.milestone.objs[i])
      toastr.success('Reward withdrawed successfully!')
    } catch (e) {
      toastr.error(e)
    }
  }

  componentDidMount () {
    this._isMounted = true

    store.subscribe(async (x) => {
      const state = store.getState()
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

  render () {
    const {
      open
    } = this.state

    let milestone = this.props.milestone
    var objs = []
    if (milestone.objsStrs) {
      for (let i = 0; i < milestone.objsStrs.length; i++) {
        objs.push(
          <Table.Row key={milestone.id + milestone.objsStrs[i]}>
            <Table.Cell>{milestone.objsStrs[i]}</Table.Cell>
            <Table.Cell>{milestone.objTypesStrs[i]}</Table.Cell>
            <Table.Cell>{toStandardUnit(milestone.objRewards[i]).toNumber()}</Table.Cell>
            <Table.Cell>
              {milestone.objScores[i] !== undefined &&
                <span key='totalscore'>total score: {milestone.objScores[i]}</span>
              }
              {milestone.yourScores[i] !== undefined && [
                <br key='br' />,
                <span key='yourscore'>your score: {milestone.yourScores[i]}</span>
              ]}
            </Table.Cell>
            <Table.Cell>
              {this.canCall('bid', i) &&
                <Button onClick={wrapWithTransactionInfo('ms-bid', this.bid, i)} color={'blue'}>
                  bid
                </Button>
              }
              {this.canCall('backout', i) &&
                <Button onClick={wrapWithTransactionInfo('ms-backout', this.backout, i)} color={'red'}>
                  back out
                </Button>
              }
              {this.canCall('finalizeBid', i) &&
                <Button onClick={wrapWithTransactionInfo('ms-finalize-bid', this.finalize, i)} color={'red'}>
                  finalize
                </Button>
              }
              {this.canCall('withdrawReward', i) &&
                <Button onClick={wrapWithTransactionInfo('ms-withdraw-reward', this.withdrawReward, i)} color={'blue'}>
                  withdraw reward({toStandardUnit(milestone.rewardInfo[i].rewards).toString() + ' ETH'})
                </Button>
              }
              {this.canCall('vote score', i) &&
                  <RegulatorVote project={this.props.project} milestone={milestone} index={i} />
                }
            </Table.Cell>
          </Table.Row>)
      }
    }

    var objTypes = []
    if (milestone.objTypes) {
      let typeRecord = {}
      for (let i = 0; i < milestone.objTypes.length; i++) {
        if (!typeRecord[milestone.objTypesStrs[i]]) {
          typeRecord[milestone.objTypesStrs[i]] = true
          objTypes.push(
            <Table.Row key={milestone.id + milestone.objTypesStrs[i]}>
              <Table.Cell>{milestone.objTypesStrs[i]}</Table.Cell>
              <Table.Cell>
                {this.canCall('vote', i) &&
                  <DelegateVote project={this.props.project} milestone={milestone} index={i} />
                }
              </Table.Cell>
            </Table.Row>)
        }
      }
    }

    return (
      <Modal
        open={open}
        onOpen={this.open}
        onClose={stopPropagation(this.close)}
        closeIcon
        trigger={<a href='#!'>{milestone.id}</a>}
      >
        <Modal.Header>Milestone Info</Modal.Header>
        <Modal.Content>
          <List>
            <List.Item>
              <strong>ID: </strong>{milestone.id}
            </List.Item>
            <List.Item>
              <strong>State: </strong>{milestone.stateStrReadable}
            </List.Item>
            <List.Item>
              <strong>Length: </strong>{getReadableLength(milestone.len)}
            </List.Item>
            <List.Item>
              <strong>Token Locked: </strong>{toStandardUnit(milestone.weiLocked).toNumber()} ETH
            </List.Item>
            {milestone.startTime !== 0 &&
              <List.Item>
                <strong>Start Time: </strong>{moment.unix(milestone.startTime).utc().format('YYYY-MM-DD HH:mm:ss')}
              </List.Item>
            }
            {milestone.endTime !== 0 &&
              <List.Item>
                <strong>End Time: </strong>{moment.unix(milestone.endTime).utc().format('YYYY-MM-DD HH:mm:ss')}
              </List.Item>
            }
            {milestone.refundInfo.ethRefund.toNumber() > 0 &&
              <List.Item>
                <strong>Refund ETH: </strong>{toStandardUnit(milestone.refundInfo.ethRefund).toNumber()}
              </List.Item>
            }
            {milestone.refundInfo.availableTime > 0 &&
              <List.Item>
                <strong>Refund Available Time: </strong>{moment.unix(milestone.refundInfo.availableTime).utc().format('YYYY-MM-DD HH:mm:ss')}
              </List.Item>
            }
            <List.Item>
              <strong>Objectives: </strong>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>MaxRewards</Table.HeaderCell>
                    <Table.HeaderCell>Score</Table.HeaderCell>
                    <Table.HeaderCell>Action</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {objs}
                </Table.Body>
              </Table>
            </List.Item>
            <List.Item>
              <strong>Objective Types: </strong>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Action</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {objTypes}
                </Table.Body>
              </Table>
            </List.Item>
          </List>
        </Modal.Content>
        <Modal.Actions>
          {env !== 'test' && this.canCall('sendGas') &&
            <Button onClick={wrapWithTransactionInfo('ms-send-gas', this.sendGas)} color={'blue'}>
              send gas
            </Button>
          }
          {env !== 'test' && this.canCall('writeAvailableVotes') &&
            <Button id='write-votes' onClick={wrapWithTransactionInfo('ms-write-available-votes', this.writeAvailableVotes)} color={'blue'}>
              write available votes
            </Button>
          }
          {env === 'test' && this.canCall('test-writeAvailableVotes') &&
            <Button id='write-votes' onClick={wrapWithTransactionInfo('ms-write-available-votes', this.writeAvailableVotes)} color={'blue'}>
              write available votes
            </Button>
          }
          {this.canCall('finalizeAllBids') &&
            <Button onClick={wrapWithTransactionInfo('ms-finalize-all-bids', this.finalizeAllBids)} color={'red'}>
              finalize all bids
            </Button>
          }
          <Button content='Close' onClick={stopPropagation(this.close)} />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default CSSModules(MilestoneModal, styles)
