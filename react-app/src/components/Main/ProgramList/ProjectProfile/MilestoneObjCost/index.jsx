import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Segment, Accordion, Icon, Button } from 'semantic-ui-react'
import moment from 'moment'
import ParticipatingProxyList from './ParticipatingProxyList'

class MilestoneObjCost extends Component {
  constructor (props) {
    super()
    this.state = {
      activeIndex: 0,
      milestone: props.milestone,
      addressType: props.addressType
    }
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }


  render () {
    const { activeIndex } = this.state
    var objElems = []
    var btns = []
    if (this.state.milestone.stage === "Audit Cost Evaluation") {
      if (this.state.addressType === "proxies") {
        btns.push(<Button pri	                  <div className=" rt-resizable-header -cursor-pointer rt-th" style={{flex: '200 0 auto', width: '200px'}}>
	                    <div className="rt-resizable-header-content">Current Milestone</div>
	                    <div className="rt-resizer"></div>
	                  </div>mary>Accept and Join</Button>)
      } else if (this.state.addressType === "projectFounders") {
        btns.push(<Button primary>Bid</Button>)
      }
    }

    if (this.state.milestone.stage === "Audit Cost Evaluation") {
      if (this.state.addressType === "proxies") {
        btns.push(<Button primary>Accept and Join</Button>)
      } else if (this.state.addressType === "projectFounders") {
        btns.push(<Button disabled>Bid</Button>)
      }
    }

    for (var i = 0; i < this.state.milestone.obj.length; i++ ) {
      let obj = this.state.milestone.obj[i];
      if (this.state.milestone.stage === "Audit Cost Evaluation") {
        if (this.state.addressType === "proxies") {
          btns.push(<Button primary>Accept and Join</Button>)
        } else if (this.state.addressType === "projectFounders") {
          btns.push(<Button primary>Bid</Button>)
        }
      }
      objElems.push(
        <Segment padded>
          <Accordion.Title active={activeIndex === i+1} index={i+1} onClick={this.handleClick}>
            <div className="ui grid stackable padded">
              <div className="column fourteen wide">
                <h3> <Icon name='dropdown' /> {obj.objTitle} </h3>
              </div>
            </div>
          </Accordion.Title>
          <Accordion.Content active={activeIndex === i+1}>
            <div className="ui grid stackable padded">
              <div className="column fourteen wide">
                <Segment>
                  <ParticipatingProxyList proxyList = {obj.proxyList} currentRewards = {obj.currentRewards} rewardSet = {obj.rewardSet}/>
                  {btns[i]}
                </Segment>
                <Segment>
                  <p color = 'grey'>
                    {obj.objContent}
                  </p>
                </Segment>
              </div>
            </div>
          </Accordion.Content>
                </Segment>
      )
    }
    return (
      <Accordion>
        {objElems}
      </Accordion>
    )
  }
}

export default CSSModules(MilestoneObjCost);
