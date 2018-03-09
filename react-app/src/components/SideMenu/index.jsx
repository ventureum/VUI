import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Button } from 'semantic-ui-react'
import styles from './styles.css'

class SideMenu extends Component {
  render() {
    return (
    	<div className="side-menu">
    		<Button>Click Me</Button>
    	</div>
    );
  }
}

export default CSSModules(SideMenu, styles);
