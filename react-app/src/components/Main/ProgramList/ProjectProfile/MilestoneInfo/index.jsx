import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { Segment, Accordion, Icon, Button } from 'semantic-ui-react'
import moment from 'moment'

class MilestoneInfo extends Component {
  constructor (props) {
    super()
    this.state = {
      activeIndex: 0,
      milestone: props.milestone
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
    for (var i = 0; i < this.state.milestone.obj.length; i++ ) {
      let obj = this.state.milestone.obj[i];
      objElems.push(
        <Segment padded>
          <Accordion.Title active={activeIndex === i+1} index={i+1} onClick={this.handleClick}>
            <div className="ui grid stackable padded">
              <div className="column fourteen wide">
                <h3> <Icon name='dropdown' /> {obj.objTitle} </h3>
              </div>
              { (this.state.milestone.stage === "Complete" ||  this.state.milestone.stage === "Put Option" ||  this.state.milestone.stage === "Refund" || this.state.milestone.stage === "Circuit Breaker Triggered") &&  <div className="column two wide"> <Button color = 'green'>{obj.objScore}/5</Button> </div>}
            </div>
          </Accordion.Title>
          <Accordion.Content active={activeIndex === i+1}>
            <div className="ui grid stackable padded">
              <div className="column fourteen wide">
                <p color = 'grey'>
                  {obj.objContent}
                </p>
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

export default CSSModules(MilestoneInfo);
