import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Button, Modal, List, Table } from 'semantic-ui-react'
import moment from 'moment'
import toastr from 'toastr'
import milestone from '../../../../../services/milestone'
import regulatingRating from '../../../../../services/regulatingRating'
import rewardManager from '../../../../../services/rewardManager'
import DelegateVotes from './DelegateVotes'
import { stopPropagation, toStandardUnit, wrapWithTransactionInfo } from '../../../../../utils/utils'
import styles from './styles.css'

class MilestoneModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.writeAvailableVotes = this.writeAvailableVotes.bind(this)
    this.bid = this.bid.bind(this)
    this.backout = this.backout.bind(this)
    this.finalize = this.finalize.bind(this)
    this.finalizeAllBids = this.finalizeAllBids.bind(this)
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
    let now = moment().utc().unix()
    if (name === 'vote') {
      return ms.stateStr === 'ip' && ms.pollExist && !ms.pollExpired && ms.voteObtained && ms.voteRights.canVote && ms.voteRights[ms.objTypes[i]].toNumber() > 0
    } else if (name === 'writeAvailableVotes') {
      return ms.stateStr === 'ip' && ms.pollExist && !ms.pollExpired && !ms.voteObtained
    } else if (name === 'bid') {
      return ms.stateStr === 'rs' && now < ms.endTime && !ms.objFinalized[i] && !ms.bidInfo[i]
    } else if (name === 'backout') {
      return ms.stateStr === 'rs' && now < ms.endTime && !ms.objFinalized[i] && ms.bidInfo[i]
    } else if (name === 'finalizeBid') {
      return ms.pollExist && ms.pollExpired && !ms.objFinalized[i]
    } else if (name === 'finalizeAllBids') {
      return ms.pollExist && ms.pollExpired && ms.objFinalized.includes(false)
    } else if (name === 'withdrawReward') {
      return ms.objFinalized[i] && ms.rewardInfo[i] && ms.rewardInfo[i].isRegulator && ms.rewardInfo[i].finalized && ms.rewardInfo[i].rewards.toNumber() > 0
    }
  }

  async writeAvailableVotes () {
    try {
      await milestone.writeAvailableVotes(this.props.project.projectName, this.props.milestone.id)
      toastr.success('Available votes written successfully!')
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
            </Table.Cell>
          </Table.Row>)
      }
    }

    var objTypes = []
    if (milestone.objTypes) {
      for (let i = 0; i < milestone.objTypes.length; i++) {
        objTypes.push(
          <Table.Row key={milestone.id + milestone.objTypesStrs[i]}>
            <Table.Cell>{milestone.objTypesStrs[i]}</Table.Cell>
            <Table.Cell>
              {this.canCall('vote', i) &&
                <DelegateVotes project={this.props.project} milestone={milestone} index={i} />
              }
            </Table.Cell>
          </Table.Row>)
      }
    }

    return (
      <Modal
        open={open}
        onOpen={this.open}
        onClose={stopPropagation(this.close)}
        closeIcon
        size='small'
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
              <strong>Length: </strong>{milestone.days} days
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
          {this.canCall('writeAvailableVotes') &&
            <Button onClick={wrapWithTransactionInfo('ms-write-available-votes', this.writeAvailableVotes)} color={'blue'}>
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
