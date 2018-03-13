import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import registry from './services/registry'
import plcr from './services/plcr'
import parameterizer from './services/parameterizer'
import token from './services/token'

async function init () {
  try {
    await Promise.all([
      registry.init(),
      plcr.init(),
      parameterizer.init(),
      token.init()
      ])
  } catch (error) {
    console.error(error)
  }
  ReactDOM.render(<App />, document.getElementById('root'));
  registerServiceWorker();
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