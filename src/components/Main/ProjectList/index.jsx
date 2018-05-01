import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Modal } from 'semantic-ui-react'
import moment from 'moment'
import toastr from 'toastr'
import styles from './styles.css'
import Challenge from './Challenge'
import ChallengeVoteCommit from './ChallengeVoteCommit'
import ChallengeVoteReveal from './ChallengeVoteReveal'
import ProjectProfile from './ProjectProfile'
import registry from '../../../services/registry'
import store from '../../../store'
import InProgress from '../InProgress'

var $ = window.jQuery

class ProjectList extends Component {
  constructor (props) {
    super()

    this.state = {
      projectList: [],
      addressType: props.addressType,
      perPage: 10,
      currentPage: 1,
      totalPage: null,
      inProgress: false
    }

    this.updatePerPage = this.updatePerPage.bind(this)
    this.handlePageChange = this.handlePageChange.bind(this)
    this.nextPage = this.nextPage.bind(this)
    this.prevPage = this.prevPage.bind(this)
    this.updateStatus = this.updateStatus.bind(this)
  }

  async updateStatus (e, project) {
    e.preventDefault()

    try {
      await registry.updateStatus(project.projectName)
      toastr.success('Transaction successfully sent')
    } catch (error) {
      toastr.error(error.message)
    }
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

  componentWillReceiveProps (nextProps) {
    this.setState({addressType: nextProps.addressType})
  }

  componentDidMount () {
    this.setState({
      inProgress: true
    })
    this.getProjectList()

    store.subscribe(x => {
      const state = store.getState()
      if (state.type === 'REGISTRY_EVENT' || state.type === 'REGISTRY_PROJECT_UPDATE_STATUS') {
        this.getProjectList()
      }
    })
  }

  updatePerPage () {
    var newPerPage
    newPerPage = Math.floor(($(window).height() - $('.top-bar').height() - 160) / $('.rt-tr-group').height()) || 10
    this.setState({
      perPage: newPerPage,
      totalPage: Math.ceil(this.state.projectList.length / newPerPage)
    })
  }

  actionNeedModal (project) {
    var actionsNeedModal = ['challenge', 'commit', 'reveal', 'view']
    if (actionsNeedModal.indexOf(project.action) >= 0) {
      return true
    } else {
      return false
    }
  }

  getProjectAction (projectObj) {
    var actionMap = {
      'In Application': 'challenge',
      'In Voting Commit': 'commit',
      'In Voting Reveal': 'reveal',
      'Pending to Whitelist': 'whitelist',
      'Pending to Resolve': 'resolve challenge',
      'Unresolved': 'refresh status',
      'In Registry': 'view'
    }
    return actionMap[projectObj.stage]
  }

  async getProjectList () {
    try {
      var projectList = await registry.getProjectList()
      
      for (let i = 0; i < projectList.length; i++) {
        projectList[i].action = this.getProjectAction(projectList[i])
      }
      console.log(projectList)
      this.setState({
        inProgress: false,
        projectList: projectList,
        totalPage: Math.ceil(projectList.length / this.state.perPage)
      })
      setTimeout(this.updatePerPage, 0)
    } catch (error) {
      toastr.error(error.message)
    }
  }

  render () {
    const {
      perPage,
      currentPage,
      totalPage,
      projectList,
      inProgress
    } = this.state

    var projectElems = []
    for (var i = (currentPage - 1) * perPage; i < Math.min(currentPage * perPage, projectList.length); i++) {
      let project = projectList[i]
      projectElems.push(
        <div className='rt-tr-group' key={project.projectName}>
          <div className='rt-tr -odd'>
            <div className='rt-td' style={{flex: '200 0 auto', width: '200px'}}>
              <Modal size='large' trigger={<a href='#!' className='domain' title='View profile'>{project.projectName}</a>}>
                <Modal.Header>{project.projectName}</Modal.Header>
                <Modal.Content>
                  <ProjectProfile project={project}/>
                </Modal.Content>
              </Modal>
            </div>
            <div className='rt-td' style={{flex: '200 0 auto', width: '200px'}}><span className=''>{project.stage}</span></div>
            <div className='rt-td Number' style={{flex: '150 0 auto', width: '150px'}}>{moment.unix(project.applicationExpiry).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div className='rt-td' style={{flex: '200 0 auto', width: '200px'}}>
              {!this.actionNeedModal(project) &&
                <a onClick={(e) => { this.updateStatus(e, project) }} className='ui mini button purple' href='#!'>{project.action}</a>
              }
              {this.actionNeedModal(project) &&
                <Modal size={project.action === 'view' ? 'large' : 'mini'} trigger={<a className='ui mini button purple' href='#!'>{project.action}</a>}>
                  <Modal.Header>{project.stage}</Modal.Header>
                  <Modal.Content>
                    {project.action === 'challenge' && <Challenge project={project} />}
                    {project.action === 'commit' && <ChallengeVoteCommit project={project} stage={project.stage} />}
                    {project.action === 'reveal' && <ChallengeVoteReveal project={project} stage={project.stage} />}
                    {project.action === 'view' && <ProjectProfile projectName={project.projectName} />}
                  </Modal.Content>
                </Modal>
              }
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className='program-list'>
        <div className='ui grid stackable padded'>
          <div className='column sixteen wide'>
            <div className='ReactTable ui table'>
              <div className='rt-table'>
                <div className='rt-thead -header' style={{minWidth: '600px'}}>
                  <div className='rt-tr'>
                    <div className=' rt-resizable-header -cursor-pointer rt-th' style={{flex: '200 0 auto', width: '200px'}}>
                      <div className='rt-resizable-header-content'>Project Name</div>
                      <div className='rt-resizer' />
                    </div>
                    <div className=' rt-resizable-header -cursor-pointer rt-th' style={{flex: '200 0 auto', width: '200px'}}>
                      <div className='rt-resizable-header-content'>Stage</div>
                      <div className='rt-resizer' />
                    </div>
                    <div className='Number rt-resizable-header -cursor-pointer rt-th' style={{flex: '150 0 auto', minWidth: '150px'}}>
                      <div className='rt-resizable-header-content'>Stage Ends</div>
                      <div className='rt-resizer' />
                    </div>
                    <div className=' rt-resizable-header -cursor-pointer rt-th' style={{flex: '200 0 auto', width: '200px'}}>
                      <div className='rt-resizable-header-content'>Action</div>
                      <div className='rt-resizer' />
                    </div>
                  </div>
                </div>
                <div className='rt-tbody'>
                  {projectElems}
                </div>
              </div>
              <div className='pagination-bottom'>
                <div className='-pagination'>
                  <div className='-previous'>
                    <button onClick={this.prevPage} type='button' disabled={currentPage === 1} className='-btn'>Previous</button>
                  </div>
                  <div className='-center'>
                    <span className='-pageInfo'>Page&nbsp;</span>
                    <div className='-pageJump'>
                      <input type='number' value={currentPage} onChange={this.handlePageChange} />
                    </div>
                    &nbsp;of&nbsp;
                    <span className='-totalPages'>{totalPage}</span>
                  </div>
                  <div className='-next'>
                    <button onClick={this.nextPage} type='button' disabled={currentPage === totalPage} className='-btn'>Next</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {inProgress ? <InProgress /> : null}
      </div>
    )
  }
}

export default CSSModules(ProjectList, styles)
