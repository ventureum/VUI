import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Popup, Modal } from 'semantic-ui-react'
import styles from './styles.css'
import Challenge from './Challenge'
import VoteCommit from './VoteCommit'
import VoteReveal from './VoteReveal'

class ProgramList extends Component {
	constructor (props) {
    super()

    this.state = {
      programList: [
				{
					projectName: 'project-1',
					stage: 'Proxy Vote - Delegate',
					stageEnd: '2018-04-10 00:00:00',
					action: 'delegate',
					currentMileStone: 'MileStone B'
				}, {
					projectName: 'project-2',
					stage: 'Proxy Vote - Commit',
					stageEnd: '2018-04-15 00:00:00',
					action: 'vote',
					currentMileStone: 'MileStone B'
				}, {
					projectName: 'project-3',
					stage: 'Proxy Vote - Reveal',
					stageEnd: '2018-04-20 00:00:00',
					action: 'reveal',
					currentMileStone: 'MileStone B'
				}, {
					projectName: 'project-4',
					stage: 'Put Option - Commit',
					stageEnd: '2018-06-10 00:00:00',
					action: 'vote',
					currentMileStone: 'MileStone B'
				}, {
					projectName: 'project-5',
					stage: 'Put Option - Reveal',
					stageEnd: '2018-06-15 00:00:00',
					action: 'reveal',
					currentMileStone: 'MileStone B'
				}, {
					projectName: 'project-6',
					stage: 'Refund',
					stageEnd: '2018-06-20 00:00:00',
					action: 'withdraw',
					currentMileStone: 'MileStone B'
				}, {
					projectName: 'project-7',
					stage: 'Circuit Breaker Trigger',
					stageEnd: '2018-06-20 00:00:00',
					action: 'merge',
					currentMileStone: 'MileStone B'
				}
      ]
    }
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
              <a href="#!" className="domain" title="View profile">
                {project.projectName}
              </a>
            </div>
            <div className="rt-td" style={{flex: '200 0 auto', width: '200px'}}><span className="">{project.currentMileStone}</span></div>
            <div className="rt-td" style={{flex: '200 0 auto', width: '200px'}}>
              <Modal trigger={<a className="ui mini button blue" href="#!" title="Challenge">{project.action}</a>}>
                <Modal.Header>{project.stage}</Modal.Header>
                <Modal.Content>
                  {project.action === 'delegate' && <Challenge />}
                  {project.action === 'vote' && <VoteCommit />}
                  {project.action === 'reveal' && <VoteReveal />}
                  {project.action === 'withdraw' && 
                    <div className="column five wide">
                      <div className='withdraw-voting-rights-container'>
                        <div className='ui grid stackable center aligned'>
                          <div className='column sixteen wide'>
                            <p>Withdraw Voting Rights
                              <Popup
                                trigger={<i className='icon info circle' />}
                                content='Withdraw vToken held by the PLCR contract. VToken is locked up during voting and unlocked after the reveal stage. When it is unlocked you may withdraw the vToken to your account at any time.'
                              />
                            </p>
                            <div><small>Available unlocked VTH: 100<strong> (Locked VTH: 10)</strong></small></div>
                            <div>
                              <button className='ui button blue tiny'>
                                Withdraw ADT
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  {project.action === 'merge' && 'merge'}
                </Modal.Content>
              </Modal>
            </div>
            <div className="rt-td" style={{flex: '200 0 auto', width: '200px'}}><span className="">{project.stage}</span></div>
            <div className="rt-td Number" style={{flex: '150 0 auto', width: '150px'}}>{project.stageEnd}</div>
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
	                    <div className="rt-resizable-header-content">Current Milestone</div>
	                    <div className="rt-resizer"></div>
	                  </div>
	                  <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '200 0 auto', width: '200px'}}>
	                    <div className="rt-resizable-header-content">Action</div>
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
	                </div>
	              </div>
	              <div className="rt-tbody" style={{minWidth: '600px'}}>
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
