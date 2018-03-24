import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import registry from '../../../services/registry'
import store from '../../../store'
import RequestVotingRights from './RequestVotingRights'
import WithdrawVotingRights from './WithdrawVotingRights'

import styles from './styles.css'

class Account extends Component {
	constructor (props) {
    super()

    this.state = {
      account: null
    }

    const account = registry.getAccount()
    this.state.account = account
  }

  render() {
  	const {account} = this.state

    return (
      <div className="account">
      	<div className="ui grid stackable padded">
      		<div className="column five wide">
					  <RequestVotingRights account={account} />
					</div>
					<div className="column five wide">
						<WithdrawVotingRights account={account} />
		      </div>
      	</div>
      </div>
    );
  }
}

export default CSSModules(Account, styles);
