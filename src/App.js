import React, { Component } from 'react'
// import logo from './logo.svg'
import SideMenu from './components/SideMenu/index.jsx'
import Main from './components/Main/index.jsx'
import './App.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mainIndex: this.calculateIndex(window.location.pathname.substring(1) + window.location.search)
    }
  }
  calculateIndex (val) {
    if (val === 'apply') {
      return 0
    } else if (val === 'projects') {
      return 1
    } else if (val === 'registry') {
      return 2
    } else if (val === 'account') {
      return 3
    }
  }
  handleUrlChange (val) {
    window.history.replaceState(null, null, val)
    this.setState({
      mainIndex: this.calculateIndex(val)
    })
  }
  render () {
    return (
      <div className='ui grid stackable'>
        <SideMenu mainIndex={this.state.mainIndex} handleUrlChange={this.handleUrlChange.bind(this)} />
        <Main fatalError={this.props.fatalError} mainIndex={this.state.mainIndex} />
      </div>
    )
  }
}

export default App
