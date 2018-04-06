import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Modal } from 'semantic-ui-react'
import moment from 'moment'
import styles from './styles.css'
import Delegate from '../Delegate'
import ChallengeVoteCommit from '../ChallengeVoteCommit'
import ChallengeVoteReveal from '../ChallengeVoteReveal'
import Countdown from '../Countdown'
import ProjectInfo from './ProjectInfo'
import MilestoneInfo from './MilestoneInfo'
import MilestoneObjCost from './MilestoneObjCost'

class ProjectProfile extends Component {
  constructor (props) {
    super()
    let addressType = props.addressType;
    //addressType = "proxies";
    var secondMilestone = {
      'DTrust-Demo #0': {
        milestoneId: 2,
        milestoneName: 'Client API, Wallet Web App',
		stage: 'Inactive',
		stageEnd: '2018-04-15 03:33:02',
		milestoneDeadline: '2018-06-15 00:00',
        action: '',
      },
      'DTrust-Demo #1': {
        milestoneId: 2,
        milestoneName: 'Client API, Wallet Web App',
		stage: 'In Progress',
		stageEnd: '2018-04-15 03:33:02',
		milestoneDeadline: '2018-06-15 00:00',
        action: '',
      },
      'DTrust-Demo #2': {
        milestoneId: 2,
        milestoneName: 'Client API, Wallet Web App',
		stage: 'Proxy Vote - Delegate',
		stageEnd: '2018-04-10 00:00:00',
		milestoneDeadline: '2018-06-15 00:00',
        action: addressType == 'investors' ? 'delegate' : '',
      },
      'DTrust-Demo #3': {
        milestoneId: 2,
        milestoneName: 'Client API, Wallet Web App',
		stage: 'Audit Cost Evaluation',
		stageEnd: '2018-04-10 00:00:00',
		milestoneDeadline: '2018-06-15 00:00',
        action: addressType != 'investors' ? 'cost evaluation' : '',
      },
      'DTrust-Demo #4': {
        milestoneId: 2,
        milestoneName: 'Client API, Wallet Web App',
		stage: 'Proxy Vote - Commit',
		stageEnd: '2018-04-15 00:00:00',
		milestoneDeadline: '2018-06-15 00:00',
        action: addressType == 'proxies' ? 'vote' : '',
      },
      'DTrust-Demo #5': {
        milestoneId: 2,
        milestoneName: 'Client API, Wallet Web App',
		stage: 'Proxy Vote - Reveal',
		stageEnd: '2018-04-20 00:00:00',
		milestoneDeadline: '2018-06-15 00:00',
        action: addressType == 'proxies' ? 'reveal' : '',
      },
      'DTrust-Demo #6': {
        milestoneId: 2,
        milestoneName: 'Client API, Wallet Web App',
		stage: 'Put Option',
		stageEnd: '2018-06-15 00:00:00',
		milestoneDeadline: '2018-06-15 00:00',
        action: addressType == 'investors' ? 'vote' : '',
      },
      'DTrust-Demo #7': {
        milestoneId: 2,
        milestoneName: 'Client API, Wallet Web App',
		stage: 'Refund',
		stageEnd: '2018-06-20 00:00:00',
		milestoneDeadline: '2018-06-20 00:00',
        action: addressType == 'investors' ? 'withdraw' : '',
      },
      'DTrust-Demo #8': {
        milestoneId: 2,
        milestoneName: 'Client API, Wallet Web App',
		stage: 'Circuit Breaker Triggered',
		stageEnd: '2018-06-20 00:00:00',
		milestoneDeadline: '2018-06-15 00:00',
        action: addressType == 'projectFounders' ? 'merge' : '',
      },
      'DTrust-Demo #9': {
        milestoneId: 2,
        milestoneName: 'Client API, Wallet Web App',
		stage: 'Complete',
		stageEnd: '2018-06-20 00:00:00',
		milestoneDeadline: '2018-06-15 00:00',
        action: addressType == 'projectFounders' ? 'withdraw' : '',
      }
    };
    var milestones = [
      {
        milestoneId: 0,
		milestoneName: 'Token Sale',
		stage: props.projectName!="project-0" ? 'Complete' : 'Inactive',
		stageEnd: '',
		milestoneDeadline: props.projectName!="project-0"?'2018-02-15 00:00':'',
        action: '',
	  },
      {
        milestoneId: 1,
		milestoneName: 'Platform Test API for Merchants',
		stage: props.projectName!="project-0" ? 'Complete' : 'Inactive',
		stageEnd: '',
		milestoneDeadline: props.projectName!="project-0"?'2018-02-15 00:00':'',
        action: '',
	  },
    ];
    milestones.push(secondMilestone[props.projectName]);
    milestones.push(
      {
        milestoneId: 3,
        milestoneName: 'Native apps iOS, Android',
		stage: 'Inactive',
		stageEnd: '',
		milestoneDeadline: '2018-08-15 00:00',
        action: '',
      }
    );
    milestones.push(
      {
        milestoneId: 4,
        milestoneName: 'Platform Refinements & Expansion',
		stage: 'Inactive',
		stageEnd: '',
		milestoneDeadline: '2018-12-15 00:00',
        action: '',
      }
    );

    milestones[0].obj = []
    // set milestone objectives
    milestones[1].obj = [
      {
        objTitle : "Integrate with merchant checkout mechanisms",
        objContent : "Integration between Platform APIs and merchant checkout mechanisms will be implemented and fully tested.",
        objScore :4.5,
      },
      {
        objTitle : "Test mediated chat mode",
        objContent : "Mediated chat mode will be implemented and fully tested.",
        objScore : 1.5
      }
    ]
    milestones[2].obj = [
      {
        objTitle : "Check your balance & transactions",
        objContent : "Clients will be able to use the Wallet Web App which is a HTML5 Single Page Application (SPA) to check the balance and make transactions.",
        objScore : 4.5,
        proxyList: [
          {
            address: "0x9e859...abd5a",
            name: "Regulator A",
            votes: 1302018,
          },
          {
            address: "0x80b13...66e7d",
            name: "Regulator B",
            votes: 12000,
          },
          {
            address: "0x60b14...34e7d",
            name: "Regulator C",
            votes: 6020001,
          }
        ],
        currentRewards: 120000,
        rewardSet: false,
      },
      {
        objTitle : "Integration with major eCommerce platforms",
        objContent : "Integration with major eCommerce platforms, such as eBay, AliExpress, will be implemented and fully tested. Merchants on these eCommerce platforms will be able to join the DTRUST platform and make transactions with customers. ",
        objScore : 1.5,
        proxyList: [
          {
            address: "0x00eee...a141f",
            name: "Regulator D",
            votes: 288282,
          },
          {
            address: "0x2617e...030f5",
            name: "Regulator E",
            votes: 59222,
          },
          {
            address: "0xea5ac...03fff",
            name: "Regulator B",
            votes: 120300,
          }
        ],
        currentRewards: 240350,
        rewardSet: true,
      }
    ]
    milestones[3].obj = [
      {
        objTitle : "200+ Merchants",
        objContent : "More than 200 merchants will join the DTRUST platform.",
        objScore : 4.5
      },
      {
        objTitle : "Live Transactions",
        objContent : "Merchants and customers will be able to make transactions in real-time.",
        objScore : 1.5
      }
    ]
    milestones[4].obj = [
      {
        objTitle : "1000+ Merchants",
        objContent : "More than 1000 merchants will join the DTRUST platform.",
        objScore : 4.5
      },
      {
        objTitle : "Progressive hiring of mediators",
        objContent : "Mediators who resolve disputes between merchants and customers will be progressively hired, and a community of mediators will form.",
        objScore : 1.5
      }
    ]
    this.state = {
      addressType: addressType,
      milestoneList:milestones,
      projectName: props.projectName,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({addressType: nextProps.addressType})
  }

  render() {
    var milestoneElems = []
    for (var i = 0; i < this.state.milestoneList.length; i++) {
      let milestone = this.state.milestoneList[i];
      milestoneElems.push(
        <div className="rt-tr-group">
          <div className="rt-tr -odd">
            <div className="rt-td" style={{flex: '200 0 auto', width: '100px'}}>

              <Modal trigger={ <a href="#!" className="domain" title="View profile"> {milestone.milestoneName} </a>}>
                <Modal.Header>{"Milestone #" + milestone.milestoneId + " " + milestone.milestoneName}</Modal.Header>
                <Modal.Content>
                  <MilestoneInfo milestone = {milestone} />
                </Modal.Content>
              </Modal>

            </div>
            <div className="rt-td" style={{flex: '200 0 auto', width: '100px'}}><span className="">{milestone.stage}</span></div>
            <div className="rt-td Number" style={{flex: '150 0 auto', width: '150px'}}>{milestone.stageEnd}</div>
            <div className="rt-td" style={{flex: '200 0 auto', width: '100px'}}>
              <Modal trigger={milestone.action != '' && <a className={"ui mini button" + (milestone.stage === 'Proxy Vote - Delegate' ? ' purple' : ' blue')} href="#!" title="Challenge">{milestone.action}</a>}>
                <Modal.Header>{milestone.stage}</Modal.Header>
                <Modal.Content>
                  {milestone.action === 'cost evaluation' && <MilestoneObjCost milestone = {milestone} addressType = {this.state.addressType} endDate={moment(milestone.stageEnd, "YYYY-MM-DD HH:mm:ss").unix()} />}
                  {milestone.action === 'delegate' && <Delegate stage={milestone.stage} endDate={moment(milestone.stageEnd, "YYYY-MM-DD HH:mm:ss").unix()} />}
                  {milestone.action === 'vote' && <ChallengeVoteCommit obj = {milestone.obj} stage={milestone.stage} endDate={moment(milestone.stageEnd, "YYYY-MM-DD HH:mm:ss").unix()} />}
                  {milestone.action === 'reveal' && <ChallengeVoteReveal obj = {milestone.obj} stage={milestone.stage} endDate={moment(milestone.stageEnd, "YYYY-MM-DD HH:mm:ss").unix()} />}
                  {milestone.action === 'withdraw' && 
                   <div className="column five wide">
                     <div className='withdraw-voting-rights-container'>
                       <div className='ui grid stackable center aligned'>
                         <div className='column sixteen wide ui form'>
                           <div className='column sixteen wide center aligned field'>
                             <div className='ui message info'>
                               <p>
                                 Withdraw stage ends
                               </p>
                               <p><strong>{milestone.stageEnd}</strong></p>
                               <p>Remaining time: <Countdown endDate={moment(moment(milestone.stageEnd, "YYYY-MM-DD HH:mm:ss").valueOf())} /></p>
                             </div>
                           </div>
                           <div className="inline field">
                             <label>Withdraw Amount </label>
                             <div className="ui input">
                               <input type="text" placeholder="10" />
                             </div>
                           </div>
                           <div className="field">
                             <label>Available ETH: <strong>1200</strong></label>
                           </div>
                           <div>
                             <button className='ui button blue tiny'>
                               Withdraw
                             </button>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                  }
                  {milestone.action === 'merge' && 'merge'}
                </Modal.Content>
              </Modal>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="milestone-list">
        <div className="ui grid stackable padded">
          <div className="column four wide">
            <ProjectInfo projectName = {this.state.projectName} />
          </div>
          <div className="column twelve wide">
            <div className="ReactTable ui table">
	          <div className="rt-table">
	            <div className="rt-thead -header" style={{minWidth: '600px'}}>
	              <div className="rt-tr">
	                <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '200 0 auto', width: '100px'}}>
	                  <div className="rt-resizable-header-content">Milestone Name</div>
	                  <div className="rt-resizer"></div>
	                </div>
	                <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '200 0 auto', width: '100px'}}>
	                  <div className="rt-resizable-header-content">Stage</div>
	                  <div className="rt-resizer"></div>
	                </div>
	                <div className="Number rt-resizable-header -cursor-pointer rt-th" style={{flex: '150 0 auto', minWidth: '100px'}}>
	                  <div className="rt-resizable-header-content">Stage Ends</div>
	                  <div className="rt-resizer"></div>
	                </div>
                    <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '200 0 auto', width: '100px'}}>
                      <div className="rt-resizable-header-content">Action</div>
                      <div className="rt-resizer"></div>
                    </div>
	              </div>
	            </div>
	            <div className="rt-tbody" style={{minWidth: '400px'}}>
	              {milestoneElems}
	            </div>
	          </div>

	        </div>
          </div>
        </div>
      </div>
    );
  }
}
export default CSSModules(ProjectProfile, styles);
