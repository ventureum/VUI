import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import CSSModules from 'react-css-modules'
import styles from './styles.css'
import JSONFormatter from 'json-formatter-js'
import saveFile from '../../../../utils/saveFile'

var $ = window.jQuery
var basePath = 'https://15mw7pha3h.execute-api.us-west-1.amazonaws.com/alpha'

class ProjectProfile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      projectName: props.projectName,
      projectInfo: null,
      perPage: 10,
      currentPage: 1,
      totalPage: 1
    }

    this.onDownload = this.onDownload.bind(this)
    this.getProjectInfo()
  }

  getProjectInfo () {
    $.getJSON(basePath + '/application/' + this.state.projectName, (data) => {
      this.setState({
        projectInfo: data
      })
      if (data) {
        var jsonTree = (new JSONFormatter(this.state.projectInfo)).render()
        var elem = ReactDOM.findDOMNode(this)
        elem.querySelector('.json-tree-content').append(jsonTree)
      }
    })
  }

  onDownload (event) {
    event.preventDefault()
    saveFile(JSON.stringify(this.state.projectInfo), this.state.projectName + '.json')
  }

  render () {
    const {
      currentPage,
      totalPage
    } = this.state

    return (
      <div class='project-profile'>
        <div className='json-tree'>
          <div className='json-tree-content' />
          <div className='ui field'>
            <button onClick={this.onDownload} className='ui button purple'>
              Download
            </button>
          </div>
        </div>
        <div className='milestones'>
          <div className='ui grid stackable padded'>
            <div className='column sixteen wide'>
              <div className='ReactTable ui table'>
                <div className='rt-table'>
                  <div className='rt-thead -header' style={{minWidth: '600px'}}>
                    <div className='rt-tr'>
                      <div className=' rt-resizable-header -cursor-pointer rt-th' style={{flex: '200 0 auto', width: '200px'}}>
                        <div className='rt-resizable-header-content'>Milestone Name</div>
                        <div className='rt-resizer' />
                      </div>
                      <div className=' rt-resizable-header -cursor-pointer rt-th' style={{flex: '200 0 auto', width: '200px'}}>
                        <div className='rt-resizable-header-content'>Description</div>
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
        </div>
      </div>
    )
  }
}
export default CSSModules(ProjectProfile, styles)
