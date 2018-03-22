import React, { Component } from 'react'
import { Loader } from 'semantic-ui-react'

import './styles.css'

class InProgress extends Component {
  constructor (props) {
    super()
  }

  render () {
    return (
      <div className='challenge-in-progress'>
        <div className='content'>
          <div><strong>Challenge in progress. </strong>
            <Loader indeterminate active inline />
          </div>
          <p>You will receive <strong>two</strong> MetaMask prompts:</p>
          <p><strong>First prompt:</strong> Allow adChain Registry contract to transfer vToken deposit from your account.</p>
          <p><strong>Second prompt:</strong> Submit challenge to the adChain Registry contract.</p>
        </div>
      </div>
    )
  }
}

export default InProgress
