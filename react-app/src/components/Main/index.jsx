import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './styles.css'
import Application from './Application/index.jsx'
import ProgramList from './ProgramList/index.jsx'

class Main extends Component {
  render() {
    return (
    	<div className="main column twelve wide">
    		<div className="ui grid">
    			<div className="top-bar">
    				<div className="ui top attached menu stackable inverted overflow-x">
    					<div className="item">
    						<div className="addr">
    							<div className="avatar">
    								<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAtUlEQVRYR2O8Z9r2nwEL2Jg/FZsw1cT8J2ZjNYtx1EHQcBkNIUKJbeiE0KFtplhzmUx9ICFPUiT/pHE99lw26iBouIyGEKEENvRDCJcPz757RsjzKPLGQlIkqWfElctGHQQNgdEQIpSghk4I4cpNpOYaUs3BGUKkGkRqrsTlsVEHwUJyNIRgIUFqWsSZhkZbjISqjtEQGg0htKKcak1YXAbhqjpwpcVRB8FCbDSECLUAh3wIAQCl1e/d0wBVcwAAAABJRU5ErkJggg==" alt=""/>
    							</div>
    							<span>0x3f1c922ae22832ca3c2cd5888cdd49edacb912ca</span>
    						</div>
    					</div>
    					<div className="item">
    						<span>Network: <strong>test</strong></span>
    					</div>
    					<div className="menu right">
    						<div className="item">
    							<div className="eth-logo ui image">
    								<img src="https://www.ethereum.org/images/diamond-icon@2x.png" alt=""/>
    								2.33 ETH
    							</div>
    						</div>
    						<div className="item">
    							<div className="vth-logo ui image">
    								<img src="http://ventureum.io/img/logo.png" alt=""/>
    								2.33 VTH
    							</div>
    						</div>
    						<div className="item">
    							<a href="" target="_blank">Help</a>
    						</div>
    					</div>
    				</div>
    			</div>
    			<span className="main-wrapper">
    				{this.props.mainIndex === 0 && <Application></Application>}
    				{this.props.mainIndex === 1 && <ProgramList list={[]}></ProgramList>}
    			</span>
    		</div>
    	</div>
    );
  }
}

export default CSSModules(Main, styles);
