import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { button } from 'semantic-ui-react'
import styles from './styles.css'

class ProjectInfo extends Component {
  constructor (props) {
    super()
  }

  render () {
    return (
      <div>
        <h2> Project Description </h2>
        <p class='break-word'>
          DTRUST will be a revolutionary payment platform that enables buyers to use their
          favorite cryptocurrency in order to pay sellers (private or merchants). We provide
          sellers with the safety and convenience of receiving funds in fiat currency, and offer
          the best consumer-protection to buyers, by acting as trusted mediators. We
          combine the best payment protection features of current generation fiat systems
          with the innovative features of blockchain while blending in the unique features
          provided by our own token.
        </p>
        <div>
          <button class='ui button'>Download Full Package</button>
        </div>
      </div>
    )
  }
}

export default CSSModules(ProjectInfo, styles)
