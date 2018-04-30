import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

import registry from './services/registry'
import plcr from './services/plcr'
import parameterizer from './services/parameterizer'
import token from './services/token'
import sale from './services/sale'
import toastr from 'toastr'

async function init () {
  try {
    await Promise.all([
      token.init(),
      registry.init(),
      plcr.init(),
      parameterizer.init(),
      sale.init()
    ])
    ReactDOM.render(<App />, document.getElementById('root'))
  } catch (error) {
    toastr.error(error)
    ReactDOM.render(<App fatalError={error.message} />, document.getElementById('root'))
  }
  
  registerServiceWorker()
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.web3) {
    init()
  } else {
    // wait for metamask web3 to be injected
    setTimeout(() => {
      init()
    }, 1e3)
  }
}, false
)
