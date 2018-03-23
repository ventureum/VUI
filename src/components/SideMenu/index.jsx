import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './styles.css'

class SideMenu extends Component {
  handleUrlChangeWrapper (val) {
    var that = this
    return function (e) {
      e.preventDefault()
      that.props.handleUrlChange(val)
    }
  }
  render() {
    return (
      <div className="side-menu-wrap column four wide">
        <div className="side-menu ui sidebar inverted vertical menu visible overflow-y">
          <div className="logo">
            <a href="/">
              <img src="http://ventureum.io/img/logo.png" alt="" className="middle ui aligned image"/><span>Ventureum</span>
            </a>
          </div>
          <div className="overflow-x side-menu-list">
            <div className="list-title ui header">
              Project Management
            </div>
            <ul className="list ui">
              <li className={"item " + (this.props.mainIndex === 0 ? "active" : "")}>
                <a onClick={this.handleUrlChangeWrapper('apply')} href="/apply">Apply Now</a>
              </li>
              <li className={"item " + (this.props.mainIndex === 1 ? "active" : "")}>
                <a onClick={this.handleUrlChangeWrapper('projects')} href="/projects">Projects</a>
              </li>
              <li className={"item " + (this.props.mainIndex === 2 ? "active" : "")}>
                <a onClick={this.handleUrlChangeWrapper('registry')} href="/registry">Registry Status</a>
              </li>
            </ul>
            <div className="list-title ui header">
              Account
            </div>
            <ul className="list ui">
              <li className={"item " + (this.props.mainIndex === 3 ? "active" : "")}>
                <a onClick={this.handleUrlChangeWrapper('account')} href="/account">Account Dashboard</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default CSSModules(SideMenu, styles);
