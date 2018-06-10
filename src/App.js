import React, { Component } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { Message } from 'semantic-ui-react'
import MobileDetect from 'mobile-detect'
import MenuBar from './components/MenuBar'
import Application from './components/Main/Application'
import ProjectList from './components/Main/ProjectList'
import Account from './components/Main/Account'
import Home from './components/Main/Home'
import TransactionInfo from './components/Main/TransactionInfo'
import store from './store.js'

import './App.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fatalError: this.props.fatalError,
      showModal: false,
      modalName: '',
      modalCb: null
    }

    this.onClose = this.onClose.bind(this)
    this.onContinue = this.onContinue.bind(this)
  }

  componentDidMount () {
    store.subscribe(x => {
      const state = store.getState()
      if (state.type === 'SHOW_TRANSACTION_INFO') {
        this.setState({
          modalName: state.name,
          modalCb: state.cb,
          showModal: true
        })
      }
    })
  }

  onClose () {
    this.setState({
      showModal: false
    })
  }

  onContinue () {
    this.setState({
      showModal: false
    })
    if (this.state.modalCb) {
      this.state.modalCb()
    }
  }

  noMetamask () {
    var mobile = new MobileDetect(window.navigator.userAgent)
    var isChrome = !!window.chrome && !!window.chrome.webstore
    var isFirefox = typeof InstallTrigger !== 'undefined'

    if (!mobile.mobile() && (isChrome || isFirefox)) {
      return <p>Please Install <a target='_blank' rel='noopener noreferrer' href='https://metamask.io/'>MetaMask</a> to use the Ventureum UI properly</p>
    } else {
      return <p>Please Use the Desktop Versions of Chrome or Firefox and Install <a target='_blank' rel='noopener noreferrer' href='https://metamask.io/'>MetaMask</a> to use the Ventureum UI properly</p>
    }
  }

  render () {
    if (this.state.fatalError) {
      return (
        <Message>
          <Message.Header>
            Fatal Error
          </Message.Header>
          <p>
            {this.state.fatalError === 'no metamask' ? this.noMetamask() : this.state.fatalError}
          </p>
        </Message>
      )
    }

    const {
      showModal,
      modalName
    } = this.state

    return (
      <BrowserRouter>
        <div>
          <MenuBar />
          <Route exact path='/' component={Home} />
          <Route path='/application' component={Application} />
          <Route path='/projects' component={ProjectList} />
          <Route path='/account' component={Account} />
          {showModal && <TransactionInfo name={modalName} onContinue={this.onContinue} onClose={this.onClose} />}
        </div>
      </BrowserRouter>
    )
  }
}

export default App
