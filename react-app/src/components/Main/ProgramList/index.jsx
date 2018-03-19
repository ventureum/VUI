import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Popup, Modal } from 'semantic-ui-react'
import moment from 'moment'
import styles from './styles.css'
import Delegate from './Delegate'
import VoteCommit from './VoteCommit'
import VoteReveal from './VoteReveal'
import Countdown from './Countdown'
import ProjectProfile from './ProjectProfile'

class ProgramList extends Component {
  constructor (props) {
    super()

    this.state = {
      programList: [
        {
		  projectName: 'project-0',
		  stage: 'In Application',
		  stageEnd: '2018-01-10 00:00:00',
		  action: 'Challenge',
		}, {
		  projectName: 'project-1',
		  stage: 'In Registry',
		  stageEnd: '',
		  action: '',
		}, {
		  projectName: 'project-2',
		  stage: 'In Registry',
		  stageEnd: '',
		  action: '',
		}, {
		  projectName: 'project-3',
		  stage: 'In Registry',
		  stageEnd: '',
		  action: '',
		}, {
		  projectName: 'project-4',
		  stage: 'In Registry',
		  stageEnd: '',
		  action: '',
		}, {
		  projectName: 'project-5',
		  stage: 'In Registry',
		  stageEnd: '',
		  action: '',
		}, {
		  projectName: 'project-6',
		  stage: 'In Registry',
		  stageEnd: '',
		  action: '',
		}, {
		  projectName: 'project-7',
		  stage: 'In Registry',
		  stageEnd: '',
		  action: '',
		}, {
		  projectName: 'project-8',
		  stage: 'In Registry',
		  stageEnd: '',
		  action: '',
		}, {
		  projectName: 'project-9',
		  stage: 'In Registry',
		  stageEnd: '',
		  action: '',
		}
      ],
      addressType: props.addressType
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({addressType: nextProps.addressType})
  }

  render() {
  	var projectElems = []
  	var project
  	for (var i = 0; i < this.state.programList.length; i++) {
  	  project = this.state.programList[i]
  	  projectElems.push(
		<div className="rt-tr-group">
          <div className="rt-tr -odd">
            <div className="rt-td" style={{flex: '200 0 auto', width: '200px'}}>
              <Modal size="large" trigger={<a href="#!" className="domain" title="View profile">{project.projectName}</a>}>
                <Modal.Header>{project.projectName}</Modal.Header>
                <Modal.Content>
                  <ProjectProfile addressType = {this.state.addressType} projectName = {project.projectName} />
                </Modal.Content>
              </Modal>
            </div>
            <div className="rt-td" style={{flex: '200 0 auto', width: '200px'}}><span className="">{project.stage}</span></div>
            <div className="rt-td Number" style={{flex: '150 0 auto', width: '150px'}}>{project.stageEnd}</div>
            <div className="rt-td" style={{flex: '200 0 auto', width: '200px'}}>
              {project.action!='' &&
              <Modal trigger={<a className="ui mini button purple" href="#!">{project.action}</a>}>
                <Modal.Header>{project.stage}</Modal.Header>
                <Modal.Content>
                </Modal.Content>
              </Modal>
              }
            </div>
          </div>
        </div>
  	  )
    }
    return (
      <div className="program-list">
        <div className="ui grid stackable padded">
          <div className="column sixteen wide">
            <div className="ReactTable ui table">
	          <div className="rt-table">
	            <div className="rt-thead -header" style={{minWidth: '600px'}}>
	              <div className="rt-tr">
	                <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '200 0 auto', width: '200px'}}>
	                  <div className="rt-resizable-header-content">Project Name</div>
	                  <div className="rt-resizer"></div>
	                </div>
	                <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '200 0 auto', width: '200px'}}>
	                  <div className="rt-resizable-header-content">Stage</div>
	                  <div className="rt-resizer"></div>
	                </div>
	                <div className="Number rt-resizable-header -cursor-pointer rt-th" style={{flex: '150 0 auto', minWidth: '150px'}}>
	                  <div className="rt-resizable-header-content">Stage Ends</div>
	                  <div className="rt-resizer"></div>
	                </div>
                    <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '200 0 auto', width: '200px'}}>
                      <div className="rt-resizable-header-content">Action</div>
                      <div className="rt-resizer"></div>
                    </div>
	              </div>
	            </div>
	            <div className="rt-tbody" style={{minHeight: '400px'}}>
	              {projectElems}
	            </div>
	          </div>
	          <div className="pagination-bottom">
	            <div className="-pagination">
	              <div className="-previous">
	                <button type="button" disabled className="-btn">Previous</button>
	              </div>
	              <div className="-center"><span className="-pageInfo">Page&nbsp;
	                <div className="-pageJump"><input type="number" value="1" /></div>
	  &nbsp;of&nbsp;
	  <span className="-totalPages">12</span></span>
	              </div>
	              <div className="-next">
	                <button type="button" className="-btn">Next</button>
	              </div>
	            </div>
	          </div>
	          <div className="-loading">
	            <div className="-loading-inner">Loading...</div>
	          </div>
	        </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CSSModules(ProgramList, styles);
