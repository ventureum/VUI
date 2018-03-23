import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Popup } from 'semantic-ui-react'
import styles from './styles.css'

class Account extends Component {
  render() {
    return (
      <div className="account">
      	<div className="ui grid stackable padded">
      		<div className="column five wide">
					  <div className="request-voting-rights-container">
					    <div className="ui grid stackable center aligned">
					      <div className="column sixteen wide">
					        <p>
					          Request Voting Rights
					          <Popup
			                trigger={<i className='icon info circle' />}
			                content='Pre-requesting voting rights will minimizes the number of transactions when performing commit votes. This can save gas fees if voting frequently. 1 VTH = 1 Vote. Pre-requesting voting rights will withdraw VToken from your account to the PLCR contract. You may convert the votes to vToken and withdraw at any time.'
			              />
					        </p>
					        <div><small>Total current voting rights: <strong>10</strong></small></div>
					        <div><small>Enter amount of VTH to convert to votes</small></div>
					        <div className="ui input action mini">
					          <input type="text" placeholder="100" id="request-voting-rights-container-input" />
					          <button className="ui button blue tiny">Request Voting Rights</button>
					        </div>
					      </div>
					    </div>
					  </div>
					</div>
					<div className="column five wide">
						<div className='withdraw-voting-rights-container'>
			        <div className='ui grid stackable center aligned'>
			          <div className='column sixteen wide'>
			            <p>Withdraw Voting Rights
			              <Popup
			                trigger={<i className='icon info circle' />}
			                content='Withdraw vToken held by the PLCR contract. VToken is locked up during voting and unlocked after the reveal stage. When it is unlocked you may withdraw the vToken to your account at any time.'
			              />
			            </p>
			            <div><small>Available unlocked VTH: 100<strong> (Locked VTH: 10)</strong></small></div>
			            <div>
			              <button className='ui button blue tiny'>
			                Withdraw VTH
			            	</button>
			            </div>
			          </div>
			        </div>
		      	</div>
		      </div>
      	</div>
      </div>
    );
  }
}

export default CSSModules(Account, styles);
