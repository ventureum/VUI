import React, { Component } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { Message } from 'semantic-ui-react'
import MenuBar from './components/MenuBar'
import Application from './components/Main/Application'
import ProjectList from './components/Main/ProjectList'
import Account from './components/Main/Account'
import Home from './components/Main/Home'

import './App.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {fatalError: this.props.fatalError}
  }

  render () {
    if (this.state.fatalError) {
      return (
        <Message>
          <Message.Header>
            Fatal Error
          </Message.Header>
          <p>
            {this.state.fatalError}
          </p>
        </Message>
      )
    }
    return (
      <BrowserRouter>
        <div>
          <MenuBar />
          <Route exact path='/' component={Home} />
          <Route path='/application' component={Application} />
          <Route path='/projects' component={ProjectList} />
          <Route path='/account' component={Account} />
        </div>
      </BrowserRouter>
    )
  }
}

export default App
