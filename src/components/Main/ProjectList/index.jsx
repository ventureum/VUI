import React, { Component } from 'react'
import Eth from 'ethjs'
import CSSModules from 'react-css-modules'
import { Popup, Modal } from 'semantic-ui-react'
import moment from 'moment'
import toastr from 'toastr'
import styles from './styles.css'
import Delegate from './Delegate'
import Challenge from './Challenge'
import VoteCommit from './VoteCommit'
import VoteReveal from './VoteReveal'
import Countdown from './Countdown'
import ProjectProfile from './ProjectProfile'
import registry from '../../../services/registry'
import store from '../../../store'
import InProgress from '../InProgress'

class ProjectList extends Component {
  constructor (props) {
    super()

    this.state = {
      projectList: [],
      addressType: props.addressType,
      perPage: 2,
      currentPage: 1,
      totalPage: null,
      inProgress: false
    }

    this.handlePageChange = this.handlePageChange.bind(this)
    this.nextPage = this.nextPage.bind(this)
    this.prevPage = this.prevPage.bind(this)
  }

  nextPage () {
    if (this.state.currentPage + 1 <= this.state.totalPage) {
      this.setState({
        currentPage: this.state.currentPage + 1
      })
    }
  }

  prevPage () {
    if (this.state.currentPage - 1 >= 1) {
      this.setState({
        currentPage: this.state.currentPage - 1
      })
    }
  }

  handlePageChange (e) {
    var page = e.target.value
    if (page < 1) {
      page = 1
    } else if (page > this.state.totalPage) {
      page = this.state.totalPage
    }
    this.setState({
      currentPage: page
    })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({addressType: nextProps.addressType})
  }

  componentDidMount () {
    this.setState({
      inProgress: true
    })
    this.getProjectList()

    store.subscribe(x => {
      const state = store.getState()
      if (state.type === 'REGISTRY_EVENT') {
        this.getProjectList()
      }
    })
  }

  async getProjectList () {
    try {
      var projectList = await registry.getProjectList()
      var actionMap = {
        'In Application': 'challenge',
        'In Voting Commit': 'commit',
        'In Voting Reveal': 'reveal',
        'Unresolved': 'refresh status',
        'In Registry': 'view'
      }
      for (let i = 0; i < projectList.length; i++) {
        projectList[i].action = actionMap[projectList[i].stage]
      }
      this.setState({
        inProgress: false,
        projectList: projectList,
        totalPage: Math.ceil(projectList.length / this.state.perPage)
      })
    } catch (error) {
      toastr.error(error.message)
    }
  }

  render() {
    const {
      perPage,
      currentPage,
      totalPage,
      projectList,
      inProgress
    } = this.state

  	var projectElems = []
  	var project
  	for (var i = (currentPage - 1) * perPage; i < Math.min(currentPage * perPage, projectList.length); i++) {
  	  project = projectList[i]
  	  projectElems.push(
		    <div className="rt-tr-group" key={project.projectName}>
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
            <div className="rt-td Number" style={{flex: '150 0 auto', width: '150px'}}>{moment.unix(project.applicationExpiry).format("YYYY-MM-DD")}</div>
            <div className="rt-td" style={{flex: '200 0 auto', width: '200px'}}>
              {project.action &&
              <Modal trigger={<a className="ui mini button purple" href="#!">{project.action}</a>}>
                <Modal.Header>{project.stage}</Modal.Header>
                <Modal.Content>
                  {project.action == 'challenge' && <Challenge project={project} />}
                  {project.action == 'commit' && <VoteCommit />}
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
	                <button onClick={this.prevPage} type="button" disabled={currentPage === 1} className="-btn">Previous</button>
	              </div>
	              <div className="-center"><span className="-pageInfo">Page&nbsp;
	                <div className="-pageJump"><input type="number" value={currentPage} onChange={this.handlePageChange} /></div>
	  &nbsp;of&nbsp;
	  <span className="-totalPages">{totalPage}</span></span>
	              </div>
	              <div className="-next">
	                <button onClick={this.nextPage} type="button" disabled={currentPage === totalPage} className="-btn">Next</button>
	              </div>
	            </div>
	          </div>
	        </div>
          </div>
        </div>
        {inProgress ? <InProgress /> : null}
      </div>
    );
  }
}

export default CSSModules(ProjectList, styles);
