import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './styles.css'

class ProgramList extends Component {
  render() {
    return (
      <div className="program-list">
        <div className="ui grid stackable padded">
        	<div className="column eight wide">
        		<div className="ReactTable ui table">
	            <div className="rt-table">
	              <div className="rt-thead -header" style={{minWidth: '600px'}}>
	                <div className="rt-tr">
	                  <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '200 0 auto', width: '200px'}}>
	                    <div className="rt-resizable-header-content">Domain</div>
	                    <div className="rt-resizer"></div>
	                  </div>
	                  <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '120 0 auto', width: '120px'}}>
	                    <div className="rt-resizable-header-content">Action</div>
	                    <div className="rt-resizer"></div>
	                  </div>
	                  <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '130 0 auto', width: '130px'}}>
	                    <div className="rt-resizable-header-content">Stage</div>
	                    <div className="rt-resizer"></div>
	                  </div>
	                  <div className="Number rt-resizable-header -cursor-pointer rt-th" style={{flex: '150 0 auto', width: '150px'}}>
	                    <div className="rt-resizable-header-content">Stage Ends</div>
	                    <div className="rt-resizer"></div>
	                  </div>
	                </div>
	              </div>
	              <div className="rt-tbody" style={{minWidth: '600px'}}>
	                <div className="rt-tr-group">
	                  <div className="rt-tr -odd">
	                    <div className="rt-td" style={{flex: '200 0 auto', width: '200px'}}>
	                      <a href="#!" className="Domain" title="View profile">
	                        test.com
	                      </a>
	                    </div>
	                    <div className="rt-td" style={{flex: '120 0 auto', width: '120px'}}><a className="ui mini button purple" href="#!" title="Challenge">Challenge</a></div>
	                    <div className="rt-td" style={{flex: '130 0 auto', width: '130px'}}><span className="">In Application</span></div>
	                    <div className="rt-td Number" style={{flex: '150 0 auto', width: '150px'}}>2018-03-10 22:16:58</div>
	                  </div>
	                </div>
	                <div className="rt-tr-group">
	                  <div className="rt-tr -even">
	                    <div className="rt-td" style={{flex: '200 0 auto', width: '200px'}}>
	                      <a href="#!" className="Domain" title="View profile">
	                        numbbbbb.com
	                      </a>
	                    </div>
	                    <div className="rt-td" style={{flex: '120 0 auto', width: '120px'}}><a className="ui mini button purple" href="#!" title="Challenge">Challenge</a></div>
	                    <div className="rt-td" style={{flex: '130 0 auto', width: '130px'}}></div>
	                    <div className="rt-td Number" style={{flex: '150 0 auto', width: '150px'}}><span className="error">2018-03-09 15:39:51</span></div>
	                  </div>
	                </div>
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
