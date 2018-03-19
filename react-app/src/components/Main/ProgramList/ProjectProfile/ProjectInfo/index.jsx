import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { button } from 'semantic-ui-react'
import moment from 'moment'
import styles from './styles.css'

class ProjectInfo extends Component {
  constructor (props) {
    super()
  }

  render() {
    return (
      <div>
        <h2> Project Description </h2>
        <p class="break-word">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <div>
          <button class="ui button">Download Full Package</button>
        </div>
      </div>
    );
  }
}

export default CSSModules(ProjectInfo, styles);
