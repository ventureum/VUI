import React from 'react'
import ReactDOM from 'react-dom'
import Eth from 'ethjs'
import { getProvider } from './services/provider'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

import registry from './services/registry'
import plcr from './services/plcr'
import parameterizer from './services/parameterizer'
import token from './services/token'
import sale from './services/sale'
import tokenSale from './services/tokenSale'
import projectController from './services/projectController'
import milestone from './services/milestone'
import repSys from './services/repSys'
import regulatingRating from './services/regulatingRating'
import refundManager from './services/refundManager'
import rewardManager from './services/rewardManager'
import paymentManager from './services/paymentManager'
import toastr from 'toastr'
import { currentTimestamp } from './utils/utils'

async function init () {
  async function initAccountPoll () {
    var account = (await ((new Eth(getProvider())).accounts()))[0]
    setInterval(() => {
      window.web3.eth.getAccounts((err, accounts) => {
        if (err) {
          console.log(err)
          return
        }
        if (account !== accounts[0]) {
          // currently account is saved in all instances
          // so we have to reload to make sure they get new data
          // later we should move all data to Redux state and improve refresh process
          window.location.reload()
        }
      })
    }, 1000)
  }

  try {
    await Promise.all([
      token.init(),
      registry.init(),
      plcr.init(),
      parameterizer.init(),
      sale.init(),
      tokenSale.init(),
      projectController.init(),
      milestone.init(),
      repSys.init(),
      regulatingRating.init(),
      refundManager.init(),
      rewardManager.init(),
      paymentManager.init()
    ])
    ReactDOM.render(<App />, document.getElementById('root'))
    await initAccountPoll()
    let filter = window.web3.eth.filter('pending')
    filter.watch((err, hash) => {
      if (err) {
        console.log(err)
      } else {
        toastr.success('Follow transaction in Etherscan, Click this hash: <a style="color: blue; text-decoration: underline;" target="_blank" href="https://etherscan.io/tx/' + hash + '">' + hash + '</a>')
      }
    })
    toastr.options.preventDuplicates = true
    toastr.options.escapeHtml = false
    const oriError = toastr.error
    toastr.error = (e) => {
      if (e.message && e.message.indexOf('Error: VM Exception while processing transaction: revert' >= 0)) {
        oriError('Error: Transaction is reverted, please try to refresh the page and submit again.')
      } else {
        oriError(e.message || e)
      }
    }
    currentTimestamp() // init timestamp
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
