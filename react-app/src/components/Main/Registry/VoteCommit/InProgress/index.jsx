import React, { Component } from 'react'
import { Loader } from 'semantic-ui-react'

import './styles.css'

class InProgress extends Component {
  constructor (props) {
    super()
  }

  render () {
    return (
      <div className='vote-commit-in-progess'>
        <div className='content'>
          <div><strong>Vote commit in progress. </strong>
            <Loader indeterminate active inline />
          </div>
          <p>You will receive a maximum of <strong>three</strong> MetaMask prompts:</p>
          <p><strong>First prompt:</strong> Allow adChain Registry PLCR contract to transfer vToken deposit from your account (if not done so already).</p>
          <p><strong>Second prompt:</strong> Request voting rights from the adChain Registry PLCR contract (if not done so already).</p>
          <p><strong>Third prompt:</strong> Submit vote commit to the adChain Registry PLCR contract.</p>
        </div>
      </div>
    )
  }
}

export default InProgress
