import React, { Component } from 'react'
import { Loader } from 'semantic-ui-react'

import './styles.css'

class InProgress extends Component {
  constructor (props) {
    super()
  }

  render () {
    return (
      <div className='vote-reveal-in-progress'>
        <div className='content'>
          <div><strong>Vote reveal in progress. </strong>
            <Loader indeterminate active inline />
          </div>
          <p>You will receive <strong>one</strong> MetaMask prompts:</p>
          <p><strong>First prompt:</strong> Submit vote reveal hash to the adChain Registry PLCR contract.</p>
        </div>
      </div>
    )
  }
}

export default InProgress
