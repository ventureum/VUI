import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Table, Menu, Icon } from 'semantic-ui-react'

class ParticipatingProxyList extends Component {
  constructor (props) {
    super()
    this.state = {
      proxyList: props.proxyList,
      currentRewards: props.currentRewards,
      rewardSet: props.rewardSet,
      addressType: props.addressType
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({addressType: nextProps.addressType})
  }

  render () {
    var totalVotes = 0
    for (let i = 0; i < this.state.proxyList.length; i++) {
      totalVotes += this.state.proxyList[i].votes
    }
    var rows = []
    for (let i = 0; i < this.state.proxyList.length; i++) {
      let proxy = this.state.proxyList[i]
      rows.push(
        <Table.Row>
          <Table.Cell>{proxy.address}</Table.Cell>
          <Table.Cell>{proxy.votes}</Table.Cell>
          <Table.Cell>{'$' + (this.state.currentRewards * proxy.votes / totalVotes).toFixed(0)}</Table.Cell>
        </Table.Row>
      )
    }
    return (
      <div>
        <h4>Current Reward: {'$' + this.state.currentRewards} {!this.state.rewardSet
          ? <span style={{color: 'grey'}}> (Reward will be increased to {'$' + this.state.currentRewards * 1.15} in the next block)</span>
          : <span style={{color: 'grey'}}> (Reward has been permanently set to  {'$' + this.state.currentRewards})</span>}
        </h4>
        {this.state.addressType === 'proxies' && <h4>Your Votes: 5600000</h4>}
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Address (Total {this.state.proxyList.length})</Table.HeaderCell>
              <Table.HeaderCell>Votes (Total {totalVotes})</Table.HeaderCell>
              <Table.HeaderCell>Current Reward (USD)</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rows}
          </Table.Body>

          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='3'>
                <Menu floated='right' pagination>
                  <Menu.Item as='a' icon>
                    <Icon name='chevron left' />
                  </Menu.Item>
                  <Menu.Item as='a'>1</Menu.Item>
                  <Menu.Item as='a' icon>
                    <Icon name='chevron right' />
                  </Menu.Item>
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>
    )
  }
}

export default CSSModules(ParticipatingProxyList)
