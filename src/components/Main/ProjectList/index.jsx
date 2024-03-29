import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Modal } from 'semantic-ui-react'
import moment from 'moment'
import toastr from 'toastr'
import update from 'immutability-helper'
import styles from './styles.css'
import Challenge from './Challenge'
import ChallengeVoteCommit from './ChallengeVoteCommit'
import ChallengeVoteReveal from './ChallengeVoteReveal'
import ProjectProfile from './ProjectProfile'
import TokenSale from './TokenSale'
import registry from '../../../services/registry'
import plcr from '../../../services/plcr'
import store from '../../../store'
import InProgress from '../InProgress'
import { wrapWithTransactionInfo } from '../../../utils/utils'

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
    this.projectInProgress = this.projectInProgress.bind(this)
    this.unlock = this.unlock.bind(this)
  }

  async updateStatus (project) {
    try {
      await registry.updateStatus(project.projectName)
      toastr.success('Transaction successfully sent')
    } catch (error) {
      toastr.error(error)
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
    this._isMounted = true
    this.setState({
      inProgress: true
    })
    this.getProjectList()

    store.subscribe(x => {
      const state = store.getState()
      const eventList = ['REGISTRY_EVENT', 'REGISTRY_PROJECT_UPDATE_STATUS', 'TOKEN_SALE_EVENT', 'MILESTONE_EVENT', 'PLCR_EVENT']
      if (eventList.indexOf(state.type) >= 0) {
        this.getProjectList()
      }
    })
  }

  componentWillUnmount () {
    this._isMounted = false
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

  async getProjectList () {
    try {
      var projectList = await registry.getProjectList()

      if (this._isMounted) {
        this.setState({
          inProgress: false,
          projectList: projectList,
          totalPage: Math.ceil(projectList.length / this.state.perPage)
        })
        setTimeout(this.updatePerPage, 0)
      }
    } catch (error) {
      toastr.error(error)
    }
  }

  projectInProgress (name, value = true) {
    let index = -1
    for (index = 0; index < this.state.projectList.length; index++) {
      if (this.state.projectList[index].projectName === name) {
        break
      }
    }
    if (index !== -1) {
      this.setState({
        projectList: update(this.state.projectList, {
          [index]: {
            inProgress: {
              $set: value
            }
          }
        })
      })
    }
  }

  async unlock (project) {
    try {
      await plcr.unlock(project.challengeId)
      toastr.success('Token unlocked successfully.')
    } catch (error) {
      toastr.error(error)
    }
  }

  canCall (name, project) {
    if (name === 'unlock') {
      let actionArr = ['whitelist', 'resolve challenge', 'refresh status', 'view']
      return project.didCommit && actionArr.indexOf(project.action) >= 0 && !project.hasBeenRevealed
    }
  }

  getProjectStage (project) {
    if (project.stage !== 'In Registry') {
      return project.stage
    } else if (project.controllerStageStr === 'token-sale') {
      return 'In Tokensale'
    } else if (project.controllerStageStr === 'milestone') {
      return 'In Milestone'
    } else if (project.controllerStageStr === 'complete') {
      return 'complete'
    } else {
      return 'In Registry'
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
              <Modal size='large' closeIcon trigger={<a href='#!' className='domain' title='View profile'>{project.projectName}{project.isOwner && ' (is owner)'}</a>}>
                <Modal.Header>{project.projectName}{project.isOwner && ' (is owner)'}</Modal.Header>
                <Modal.Content>
                  <ProjectProfile project={project} />
                </Modal.Content>
              </Modal>
            </div>
            <div className='rt-td' style={{flex: '200 0 auto', width: '200px'}}><span className=''>{this.getProjectStage(project)}</span></div>
            <div className='rt-td Number' style={{flex: '150 0 auto', width: '150px'}}>{moment.unix(project.applicationExpiry).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div className='rt-td' style={{flex: '200 0 auto', width: '200px'}}>
              {!this.actionNeedModal(project) &&
                <a onClick={wrapWithTransactionInfo('update-status', this.updateStatus, project)} className='ui mini button purple' href='#!'>{project.action}</a>
              }
              {this.actionNeedModal(project) &&
                <Modal closeIcon size={project.action === 'view' ? 'large' : 'mini'} trigger={<a className='ui mini button purple' href='#!'>{project.action}</a>}>
                  <Modal.Header>{project.stage}</Modal.Header>
                  <Modal.Content>
                    {project.action === 'challenge' && <Challenge project={project} />}
                    {project.action === 'commit' && <ChallengeVoteCommit project={project} stage={project.stage} />}
                    {project.action === 'reveal' && <ChallengeVoteReveal project={project} stage={project.stage} />}
                    {project.action === 'view' && <ProjectProfile project={project} />}
                  </Modal.Content>
                </Modal>
              }
              {this.canCall('unlock', project) && <a onClick={wrapWithTransactionInfo('unlock-token', this.unlock, project)} className='ui mini button blue' href='#!'>unlock token</a>}
              {project.action === 'view' && (project.controllerStageStr === 'accepted' || (project.controllerStageStr === 'token-sale' && !project.tokenInfo.finalized)) && <TokenSale projectInProgress={this.projectInProgress} project={project} />}
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
                    <span className='-totalPages'>{totalPage || 1}</span>
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
