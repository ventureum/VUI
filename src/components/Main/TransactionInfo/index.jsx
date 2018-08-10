import React, { Component } from 'react'
import { Modal, List, Button } from 'semantic-ui-react'
import { stopPropagation } from '../../../utils/utils'

class TransactionInfo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: props.name,
      countdown: 10,
      infoList: {
        'apply': [
          {
            name: 'Token Approval',
            desc: 'Execute a transaction to take out 50,000 VTX tokens as deposit from your account. Please make sure you have enough VTX tokens.'
          },
          {
            name: 'Submit Application',
            desc: 'Execute a transaction to submit the project application to the registry.'
          }
        ],
        'vtxfaucet': [
          {
            name: 'Purchase Token',
            desc: 'Execute a transaction to purchase VTX token to your account.'
          }
        ],
        'challenge': [
          {
            name: 'Token Approval',
            desc: 'Execute a transaction to take out 50,000 VTX tokens as deposit from your account. Please make sure you have enough VTX tokens.'
          },
          {
            name: 'Challenge',
            desc: 'Execute a transaction to challenge the project.'
          }
        ],
        'vote-commit': [
          {
            name: 'Token Approval',
            desc: 'Execute a transaction to lock an amount of VTX tokens. Please make sure you have sufficient token to commit vote.'
          },
          {
            name: 'Request Voting Rights',
            desc: 'Execute a transaction to request voting rights.'
          },
          {
            name: 'Vote Commit',
            desc: 'Execute a transaction to commit votes using hash of choice and secret salt to conceal vote until reveal.'
          }
        ],
        'vote-reveal': [
          {
            name: 'Vote Reveal',
            desc: 'Execute a transaction to reveal vote with choice and secret salt.'
          }
        ],
        'update-status': [
          {
            name: 'Update Status',
            desc: 'Execute a transaction to update the project\'s status.'
          }
        ],
        'claim-reward': [
          {
            name: 'Claim Reward',
            desc: 'Execute a transaction to claim voter\'s reward for the completed vote.'
          }
        ],
        'withdraw-voting-rights': [
          {
            name: 'Withdraw Voting Rights',
            desc: 'Execute a transaction to unlock tokens from the voting contract.'
          }
        ],
        'withdraw-rest-token': [
          {
            name: 'Withdraw Rest Token',
            desc: 'Execute a transaction to withdraw rest token.'
          }
        ],
        'start-token-sale': [
          {
            name: 'Approve Token Transfer',
            desc: 'Execute a transaction to approve the token you want to sale.'
          },
          {
            name: 'Start Token Sale',
            desc: 'Execute a transaction to start token sale.'
          }
        ],
        'stop-token-sale': [
          {
            name: 'Stop Token Sale',
            desc: 'Execute a transaction to stop token sale.'
          }
        ],
        'buy-token': [
          {
            name: 'Buy Token',
            desc: 'Execute a transaction to buy token.'
          }
        ],
        'unlock-token': [
          {
            name: 'Unlock Token',
            desc: 'Execute a transaction to unlock the token you use to vote.'
          }
        ],
        'add-milestone': [
          {
            name: 'Add Milestone',
            desc: 'Execute a transaction to add the milestone to your project.'
          }
        ],
        'activate': [
          {
            name: 'Activate Milestone',
            desc: 'Execute a transaction to activate the milestone.'
          }
        ],
        'start-poll': [
          {
            name: 'Start Voting Poll',
            desc: 'Execute a transaction to start the voting poll of this milestone.'
          }
        ],
        'start-rating-stage': [
          {
            name: 'Start Rating Stage',
            desc: 'Execute a transaction to start the rating stage of this milestone.'
          }
        ],
        'start-refund': [
          {
            name: 'Starg Refund',
            desc: 'Execute a transaction to start the refund stage of this milestone'
          }
        ],
        'refund': [
          {
            name: 'Approve Project Token',
            desc: 'Approve the project token you want to refund.'
          },
          {
            name: 'Refund',
            desc: 'Execute a transaction to refund the ETH of your project token.'
          }
        ],
        'withdraw-refund': [
          {
            name: 'Withdraw Refund',
            desc: 'Execute a transaction to transfer your refund ETH to your address.'
          }
        ],
        'withdraw-weilocked': [
          {
            name: 'Withdraw ETH Locked',
            desc: 'Execute a transaction to transfer locked project ETH to your address.'
          }
        ],
        'finalize': [
          {
            name: 'Finalize Milestone',
            desc: 'Execute a transaction to finalize the last milestone.'
          }
        ],
        'ms-vote': [
          {
            name: 'Proxy Voting',
            desc: 'Execute a transaction to vote the regulator for the objective type.'
          }
        ],
        'ms-send-gas': [
          {
            name: 'Send Gas',
            desc: 'Execute a transaction to send gas to execute write available votes.'
          }
        ],
        'ms-write-available-votes': [
          {
            name: 'Write Available Votes',
            desc: 'Execute a transaction to get your vote rights.'
          }
        ],
        'ms-bid': [
          {
            name: 'Bid the Objective',
            desc: 'Execute a transaction to bid the objective.'
          }
        ],
        'ms-backout': [
          {
            name: 'Backout the Objective',
            desc: 'Execute a transaction to backout the objective.'
          }
        ],
        'ms-finalize-bid': [
          {
            name: 'Finalize the Bid',
            desc: 'Execute a transaction to finalize the objective.'
          }
        ],
        'ms-finalize-all-bids': [
          {
            name: 'Finalize All Bids',
            desc: 'Execute a transaction to finalize all objectives.'
          }
        ],
        'ms-withdraw-reward': [
          {
            name: 'Withdraw Reward',
            desc: 'Execute a transaction to withdraw your rewards.'
          }
        ]
      }
    }

    this.tick = this.tick.bind(this)
  }

  componentDidMount () {
    this._isMounted = true
    setTimeout(this.tick, 1000)
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  tick () {
    if (this.state.countdown > 0 && this._isMounted) {
      this.setState({
        countdown: this.state.countdown - 1
      })
      setTimeout(this.tick, 1000)
    }
  }

  render () {
    const {
      name,
      infoList,
      countdown
    } = this.state

    var transactionList = []
    for (let i = 0; i < infoList[name].length; i++) {
      transactionList.push(<List.Item key={infoList[name][i].name}>{infoList[name][i].name}: {infoList[name][i].desc}</List.Item>)
    }

    return (
      <div className='transaction-info'>
        <Modal open closeIcon onClose={stopPropagation(this.props.onClose)}>
          <Modal.Header>Transaction Information</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <p><strong>Please Read Carefully Before Proceeding</strong></p>
              <p>After you click "Continue", we will pop up a Metamask dialog. This dialogue will ask you to confirm the cost of the transaction. It will set a default gas limit and price. It's recommended to stick with these defaults. You can find the descriptions of each transaction below:</p>
              <p>The number of transactions will occur: {infoList[name].length}.</p>
              <p>One Metamask dialog for one transaction at a time.</p>
              <List bulleted>
                {transactionList}
              </List>
              <p>Please note that each transaction will take 15 to 30 seconds. Please do not switch/close page before all transactions have finished. You must approve all transactions to have your request processed.</p>
              <p style={{color: 'red'}}> To view pending transactions, open Metamask and select "SENT" tab. </p>
              <Button disabled={countdown !== 0} onClick={stopPropagation(this.props.onContinue)} color={'blue'}>
                Continue{countdown !== 0 && '(' + countdown + ')'}
              </Button>
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </div>
    )
  }
}

export default TransactionInfo
