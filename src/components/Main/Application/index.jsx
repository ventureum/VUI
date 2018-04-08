import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import toastr from 'toastr'
import { Popup, Checkbox, Modal } from 'semantic-ui-react'
import styles from './styles.css'
import registry from '../../../services/registry'

var $ = window.jQuery

const basicState = function () {
  return {
    fileInput: '',
    fundingText: 'Corporate Reserves or Foundation Reserves \n\nFounder / Employee / Advisor Allocation \n\nSAFT \n\nPublic Sale \n\nVesting and Lock-up Schedules per Class of Token',
    legalEntity: '',
    legalLoc: '',
    legalOwner: '',
    legalList: [],
    boardMemberName: '',
    boardMemberList: [],
    teamMemberName: '',
    teamMemberList: [],
    objective: '',
    objectiveList: [],
    msName: '',
    msDeadline: '',
    msPercent: '',
    msList: [],
    projectName: ''
  }
}

class Application extends Component {
  constructor () {
    super()

    this.state = basicState()

    var that = this
    window.calendarChange = function (target, date, text, mode) {
      if (target == 'msDeadline') {
        that.setState({
          msDeadline: text
        })
      }
    }

    this.resetForm = this.resetForm.bind(this)
    this.submit = this.submit.bind(this)
  }

  async submit () {
    if (!this.state.projectName) {
      toastr.error('Project name is required')
      return
    }
    await registry.apply(this.state.projectName)
    toastr.success('Success')
  }

  onUpload () {
  
  }

  resetForm () {
    $.each($('form.form.ui'), function (i, val) {
      val.reset()
    })
    this.setState(basicState())
  }

  handleChange (key, e) {
    var newState = {}
    newState[key] = e.target.value
    this.setState(newState)
  }
  
  isDup (item, arr) {
    var keys = Object.keys(item)
    for (var j = 0; j < arr.length; j++) {
      var testItem = arr[j]
      var dup = true
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        if (testItem[key] != item[key]) {
          dup = false
        }
      }
      if (dup) {
        return true
      }
    }
    return false
  }

  addMilestone () {
    var success = this.addItem(['msName', 'msDeadline', 'msPercent', 'objectiveList'], 'msList')
    if (success) {
      alert('Success!')
      this.setState({
        msName: '',
        msDeadline: '',
        msPercent: '',
        objectiveList: [],
        objective: ''
      })
    }
  }

  addItem (src, dist) {
    var newItem = {}
    for (var i = 0; i < src.length; i++) {
      if (this.state[src[i]] === '' || this.state[src[i]] === undefined) {
        alert('You have missed information, please fill all blanks!')
        return
      }
      newItem[src[i]] = this.state[src[i]]
    }
    if (this.isDup(newItem, this.state[dist])) {
      alert('You have added this item, please don\'t add again!')
      return false
    }
    var newDist = {}
    newDist[dist] = this.state[dist]
    newDist[dist].push(newItem)
    this.setState(newDist)
    return true
  }

  removeItem (dist, item) {
    var keys = Object.keys(item)
    for (var j = 0; j < this.state[dist].length; j++) {
      var testItem = this.state[dist][j]
      var same = true
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        if (testItem[key] != item[key]) {
          same = false
        }
      }
      if (same) {
        this.state[dist].splice(j, 1)
        var newDist = {}
        newDist[dist] = this.state[dist]
        this.setState(newDist)
        return
      }
    }
  }

  componentDidMount () {
    this.initCalendar()
  }

  initCalendar () {
    function _initCalendar () {
      $.each($('div.calendar'), function (i, val) {
        $(val).calendar({
          onChange: window.calendarChange.bind(null, $(val).data('target'))
        })
      })
    }

    setTimeout(_initCalendar, 0)
  }

  objectiveToStr (arr, sep) {
    var result = []
    for (var i = 0; i < arr.length; i++) {
      result.push(arr[i].objective)
    }
    return result.join(sep)
  }

  render() {
    var legalElems = []
    for (var i = 0; i < this.state.legalList.length; i++) {
      var item = this.state.legalList[i]
      legalElems.push(
        <tr key={item.legalEntity + item.legalLoc + item.legalOwner}>
          <td>{item.legalEntity}</td>
          <td>{item.legalLoc}</td>
          <td>{item.legalOwner}</td>
          <td><div onClick={this.removeItem.bind(this, 'legalList', item)} className="ui button red">Remove</div></td>
        </tr>
      )
    }

    var boardMemberElems = []
    for (var i = 0; i < this.state.boardMemberList.length; i++) {
      var item = this.state.boardMemberList[i]
      boardMemberElems.push(
        <tr key={item.boardMemberName}>
          <td>{item.boardMemberName}</td>
          <td><div onClick={this.removeItem.bind(this, 'boardMemberList', item)} className="ui button red">Remove</div></td>
        </tr>
      )
    }

    var teamMemberElems = []
    for (var i = 0; i < this.state.teamMemberList.length; i++) {
      var item = this.state.teamMemberList[i]
      teamMemberElems.push(
        <tr key={item.teamMemberName}>
          <td>{item.teamMemberName}</td>
          <td><div onClick={this.removeItem.bind(this, 'teamMemberList', item)} className="ui button red">Remove</div></td>
        </tr>
      )
    }

    var msElems = []
    for (var i = 0; i < this.state.msList.length; i++) {
      var item = this.state.msList[i]
      msElems.push(
        <tr key={item.msName + this.objectiveToStr(item.objectiveList, '')}>
          <td>{item.msName}</td>
          <td>{item.msDeadline}</td>
          <td>{item.msPercent}</td>
          <td>{this.objectiveToStr(item.objectiveList, '<br />')}</td>
          <td><div onClick={this.removeItem.bind(this, 'msList', item)} className="ui button red">Remove</div></td>
        </tr>
      )
    }

    var objectiveElems = []
    for (var i = 0; i < this.state.objectiveList.length; i++) {
      var item = this.state.objectiveList[i]
      objectiveElems.push(
        <tr key={item.objective}>
          <td>{item.objective}</td>
          <td><div onClick={this.removeItem.bind(this, 'objectiveList', item)} className="ui button red">Remove</div></td>
        </tr>
      )
    }

    return (
      <div className="application">
        <div className="ui grid stackable">
          <div className="row">
            <div className="column sixteen wide center aligned">
              <div className="ui large header font-biggest">
                Ventureum Token Curated Registry Application
              </div>
            </div>
          </div>
          {/*<div className="row">
            <div className="column sixteen wide left aligned">
              <p>
                Please fill the form
              </p>
            </div>
          </div>*/}
          <div className="row">
            <div className="column eight wide left aligned">
              <form className="ui form">
                <div className="ui medium header font-bigger">Project Overview</div>
                <div className="field">
                  <label>Project Name</label>
                  <div className="ui input">
                    <input onChange={this.handleChange.bind(this, 'projectName')} value={this.state.projectName} type="text" name="name" required="" />
                  </div>
                </div>
                <div className="field">
                  <label>Project Mission</label>
                  <div className="ui input">
                    <input type="text" name="misson" required="" />
                  </div>
                </div>
                <div className="field">
                  <label>Project Description</label>
                  <div className="ui input">
                    <input type="text" name="desc" required="" />
                  </div>
                </div>
                <div className="ui divider"></div>
                <div className="field">
                  <label className="font-big">Corporate Legal Structure</label>
                </div>
                <div className="ui divider"></div>
                <div className="field">
                  <label>Primary Entity</label>
                  <div className="ui input">
                    <input onChange={this.handleChange.bind(this, 'legalEntity')} value={this.state.legalEntity} type="text" name="entity" required="" />
                  </div>
                </div>
                <div className="field">
                  <label>Location of the Entity</label>
                  <div className="ui input">
                    <input onChange={this.handleChange.bind(this, 'legalLoc')} value={this.state.legalLoc} type="text" name="loc" required="" />
                  </div>
                </div>
                <div className="field">
                  <label>Ownership Structure of the Entity</label>
                  <div className="ui input">
                    <input onChange={this.handleChange.bind(this, 'legalOwner')} value={this.state.legalOwner} type="text" name="struct" required="" />
                  </div>
                </div>
                <div className="field">
                  <div onClick={this.addItem.bind(this, ['legalEntity', 'legalLoc', 'legalOwner'], 'legalList')} className="ui button blue">Add</div>
                </div>
                <div className="field">
                  <table className="ui celled table">
                    <thead>
                      <tr>
                        <th className="four wide">Primary Entities (Companies, Organizations) for the Project</th>
                        <th className="four wide">Location of Primary Entities</th>
                        <th className="four wide">Ownership Structures of Primary Entities</th>
                        <th className="four wide">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {legalElems}
                    </tbody>
                  </table>
                </div>
                <div className="ui divider"></div>
                <div className="field">
                  <label className="font-big">Board Members</label>
                </div>
                <div className="ui divider"></div>
                <div className="inline fields">
                  <div className="field">
                    <label>Name</label>
                    <div className="ui input">
                      <input onChange={this.handleChange.bind(this, 'boardMemberName')} value={this.state.boardMemberName} type="text" name="name" required="" />
                    </div>
                  </div>
                  <div className="field">
                    <div onClick={this.addItem.bind(this, ['boardMemberName'], 'boardMemberList')} className="ui button blue">Add</div>
                  </div>
                </div>
                <div className="field">
                  <table className="ui celled table">
                    <thead>
                      <tr>
                        <th className="eight wide">Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boardMemberElems}
                    </tbody>
                  </table>
                </div>
                <div className="ui divider"></div>
                <div className="field">
                  <label className="font-big">Management Team Members</label>
                </div>
                <div className="ui divider"></div>
                <div className="inline fields">
                  <div className="field">
                    <label>Name</label>
                    <div className="ui input">
                      <input onChange={this.handleChange.bind(this, 'teamMemberName')} value={this.state.teamMembarName}  type="text" name="name" required="" />
                    </div>
                  </div>
                  <div className="field">
                    <div onClick={this.addItem.bind(this, ['teamMemberName'], 'teamMemberList')} className="ui button blue">Add</div>
                  </div>
                </div>
                <div className="field">
                  <table className="ui celled table">
                    <thead>
                      <tr>
                        <th className="eight wide">Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMemberElems}
                    </tbody>
                  </table>
                </div>
                <div className="field">
                  <label>Operating Committees (Audit Committee, Compensation Committee, etc.)</label>
                  <div className="ui input">
                    <textarea type="text" rows="5" maxLength="10000" name="committee" required="" />
                  </div>
                </div>
                <div className="field">
                  <label className="ui icon button">
                    <i className="upload icon"></i>
                    By-laws
                  </label>
                  <input type="file"
                    style={{display: "none"}}
                    onChange={() => {
                      this.onUpload(this.fileInput.files[0]);
                    }}
                    ref={input => {
                      this.fileInput = input;
                    }}
                  />
                </div>
                <div className="field">
                  <label>Legal Counsel Contact</label>
                  <div className="ui input">
                    <input type="text" name="legal" required="" />
                  </div>
                </div>
                <div className="ui divider"></div>
                <div className="field">
                  <label className="font-big">Project Assets</label>
                </div>
                <div className="ui divider"></div>
                <div className="inline fields">
                  <label className="six wide field">Website</label>
                    <div className="ui input ten wide field">
                      <input type="text" name="website" required="" />
                    </div>
                </div>
                <div className="inline fields">
                  <label className="six wide field">Token Sale Site</label>
                  <div className="ui input ten wide field">
                    <input type="text" name="token" required="" />
                  </div>
                </div>
                <div className="field">
                  <label className="ui icon button">
                    <i className="upload icon"></i>
                    Logos
                  </label>
                  <input type="file"
                    style={{display: "none"}}
                    onChange={() => {
                      this.onUpload(this.fileInput.files[0]);
                    }}
                    ref={input => {
                      this.fileInput = input;
                    }}
                  />
                </div>
                <div className="inline fields">
                  <label className="six wide field">GitHub</label>
                  <div className="ui input ten wide field">
                    <input type="text" name="github" required="" />
                  </div>
                </div>
                <div className="inline fields">
                  <label className="six wide field">Social media pages</label>
                  <div className="ui input ten wide field">
                    <input type="text" placeholder="Facebook, Twitter, Telegram, Reddit, Slack, etc." name="social-media" required="" />
                  </div>
                </div>
                <div className="inline fields">
                  <label className="six wide field">Facebook</label>
                  <div className="ui input ten wide field">
                    <input type="text" name="facebook" required="" />
                  </div>
                </div>
                <div className="inline fields">
                  <label className="six wide field">Twitter</label>
                  <div className="ui input ten wide field">
                    <input type="text" name="twitter" required="" />
                  </div>
                </div>
                <div className="inline fields">
                  <label className="six wide field">Telegram</label>
                  <div className="ui input ten wide field">
                    <input type="text" name="telegram" required="" />
                  </div>
                </div>
                <div className="inline fields">
                  <label className="six wide field">Reddit</label>
                  <div className="ui input ten wide field">
                    <input type="text" name="reddit" required="" />
                  </div>
                </div>
                <div className="inline fields">
                  <label className="six wide field">Slack</label>
                  <div className="ui input ten wide field">
                    <input type="text" name="slack" required="" />
                  </div>
                </div>
              </form>
            </div>
            <div className="column eight wide left aligned">
              <form className="ui form">
                <div className="ui medium header font-bigger">Token Sale Details</div>
                <div className="ui divider"></div>
                <div className="field">
                  <label className="font-big">Date of Token Sale or Distribution</label>
                </div>
                <div className="ui divider"></div>
                <div className="inline fields">
                  <label className="four wide field">Start Time</label>
                  <div className="ui calendar field">
                    <div className="ui input left icon">
                      <i className="calendar icon"></i>
                      <input type="text" placeholder="Date/Time" />
                    </div>
                  </div>
                </div>
                <div className="inline fields">
                  <label className="four wide field">End Time</label>
                  <div className="ui calendar field">
                    <div className="ui input left icon">
                      <i className="calendar icon"></i>
                      <input type="text" placeholder="Date/Time" />
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label>Total Anticipated Funding Raised by Funding Type</label>
                  <div className="ui input">
                    <textarea type="text" rows="5" maxLength="10000" name="funding" required="" />
                  </div>
                </div>
                <div className="field">
                  <label>Tokens Authorized and Outstanding by Class</label>
                  <div className="ui input">
                    <textarea type="text" rows="10" maxLength="10000" name="funding" required="" value={this.state.fundingText}></textarea> </div>
                </div>
              </form>
              <form className="ui form">
                <div className="ui medium header font-bigger">Roadmap Definition</div>
                <div className="field">
                  <Modal onMount={this.initCalendar} trigger={<div className="ui button blue">Add Milestone</div>}>
                    <Modal.Header>Add Milestone</Modal.Header>
                    <Modal.Content>
                      <form className="ui form">
                        <div className="inline fields">
                          <label className="four wide field">Milestone Name</label>
                          <div className="ui input eight wide field">
                            <input onChange={this.handleChange.bind(this, 'msName')} value={this.state.msName} type="text" name="twitter" required="" />
                          </div>
                        </div>
                        <div className="inline fields">
                          <label className="four wide field">Deadline</label>
                          <div className="ui calendar field" data-target="msDeadline">
                            <div className="ui input left icon">
                              <i className="calendar icon"></i>
                              <input value={this.state.msDeadline} type="text" placeholder="Date/Time" />
                            </div>
                          </div>
                        </div>
                        <div className="inline fields">
                          <label className="four wide field">Percentage of Funds Locked</label>
                          <div className="ui input right labeled">
                            <input onChange={this.handleChange.bind(this, 'msPercent')} value={this.state.msPercent} type="number" name="percentage" required="" />
                            <div className="ui basic label label">%</div>
                          </div>
                        </div>
                        <div className="ui divider"></div>
                        <div className="inline fields">
                          <div className="field">
                            <label>Objective</label>
                            <div className="ui input">
                              <input onChange={this.handleChange.bind(this, 'objective')} value={this.state.objective} type="text" name="name" required="" />
                            </div>
                          </div>
                          <div className="field">
                            <div onClick={this.addItem.bind(this, ['objective'], 'objectiveList')} className="ui button blue">Add</div>
                          </div>
                        </div>
                        <div className="field">
                          <table className="ui celled table">
                            <thead>
                              <tr>
                                <th className="eight wide">Objective</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {objectiveElems}
                            </tbody>
                          </table>
                        </div>
                        <div className="ui divider"></div>
                        <div className="fields inline">
                          <div onClick={this.addMilestone.bind(this)} className="ui button blue">Add Milestone</div>
                        </div>
                      </form>
                    </Modal.Content>
                  </Modal>
                </div>
                <div className="field">
                  <table className="ui celled table">
                    <thead>
                      <tr>
                        <th className="three wide">Milestone Name</th>
                        <th className="two wide">Deadline</th>
                        <th className="two wide">Percentage of Funds Locked</th>
                        <th className="seven wide">Objectives</th>
                        <th className="two wide">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {msElems}
                    </tbody>
                    {/*<tfoot>
                      <tr colSpan="5">
                        <th colSpan="5"><div className="ui button red">Remove</div></th>
                      </tr>
                    </tfoot>*/}
                  </table>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="fixed-footer">
          <div className="ui grid stackable center aligned">
            <div className="row">
              <div onClick={this.resetForm} className="ui button red">Clear</div>
              {/*<div className="ui button green">Save</div>*/}
              <div onClick={this.submit} className="ui button blue">Submit</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CSSModules(Application, styles);
