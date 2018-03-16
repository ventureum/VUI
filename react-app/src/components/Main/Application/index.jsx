import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import {Popup} from 'semantic-ui-react'
import styles from './styles.css'
import $ from 'jquery'

class Application extends Component {
  constructor () {
    super()

    this.state = {
      fileInput: '',
      fundingText: 'Corporate Reserves or Foundation Reserves \n\nFounder / Employee / Advisor Allocation \n\nSAFT \n\nPublic Sale \n\nVesting and Lock-up Schedules per Class of Token'
    }
  }

  onUpload () {
  
  }

  componentDidMount () {
    setTimeout("$('div.calendar').calendar()", 0)
  }

  render() {
    return (
      <div className="application">
        <div className="ui grid stackable padded">
          <div className="column sixteen wide">
            <div className="application-form">
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
                          <input type="text" name="name" required="" />
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
                          <input type="text" name="entity" required="" />
                        </div>
                      </div>
                      <div className="field">
                        <label>Location of the Entity</label>
                        <div className="ui input">
                          <input type="text" name="loc" required="" />
                        </div>
                      </div>
                      <div className="field">
                        <label>Ownership Structure of the Entity</label>
                        <div className="ui input">
                          <input type="text" name="struct" required="" />
                        </div>
                      </div>
                      <div className="field">
                        <div className="ui button blue">Add</div>
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
                            <tr>
                              <th>1</th>
                              <th>2</th>
                              <th>3</th>
                              <th><div className="ui button red">Remove</div></th>
                            </tr>
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
                            <input type="text" name="name" required="" />
                          </div>
                        </div>
                        <div className="field">
                          <div className="ui button blue">Add</div>
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
                            <tr>
                              <th>1</th>
                              <th><div className="ui button red">Remove</div></th>
                            </tr>
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
                            <input type="text" name="name" required="" />
                          </div>
                        </div>
                        <div className="field">
                          <div className="ui button blue">Add</div>
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
                            <tr>
                              <th>1</th>
                              <th><div className="ui button red">Remove</div></th>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="field">
                        <label>Operating Committees (Audit Committee, Compensation Committee, etc.)</label>
                        <div className="ui input">
                          <textarea type="text" rows="5" maxlength="10000" name="committee" required="" />
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
                          <div class="ui input left icon">
                            <i class="calendar icon"></i>
                            <input type="text" placeholder="Date/Time" />
                          </div>
                        </div>
                      </div>
                      <div className="inline fields">
                        <label className="four wide field">End Time</label>
                        <div className="ui calendar field">
                          <div class="ui input left icon">
                            <i class="calendar icon"></i>
                            <input type="text" placeholder="Date/Time" />
                          </div>
                        </div>
                      </div>
                      <div className="field">
                        <label>Total Anticipated Funding Raised by Funding Type</label>
                        <div className="ui input">
                          <textarea type="text" rows="5" maxlength="10000" name="funding" required="" />
                        </div>
                      </div>
                      <div className="field">
                        <label>Tokens Authorized and Outstanding by Class</label>
                        <div className="ui input">
                          <textarea type="text" rows="10" maxlength="10000" name="funding" required="" value={this.state.fundingText}></textarea> </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CSSModules(Application, styles);
