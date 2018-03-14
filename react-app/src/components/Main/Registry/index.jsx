import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './styles.css'
import { Popup, Icon } from 'semantic-ui-react'
import Challenge from './Challenge'

class Registry extends Component {
  render() {
    return (
      <div className="registry-wrapper">
        <div className="ui grid stackable padded">
          <div className="column twelve wide">
            <div className="registry">
              <div className="ui grid stackable">
                <div className="column sixteen wide">
                  <div className="ui mini statistics">
                    <div className="statistic">
                      <div className="value">680,000</div>
                      <div className="label">
                        TOTAL ADT STAKED&nbsp;
                        <Popup
                          trigger={<Icon name='info circle' />}
                          content='This is an info'
                        />
                      </div>
                    </div>
                    <div className="statistic">
                      <div className="value">3</div>
                      <div className="label">
                        IN APPLICATION&nbsp;
                        <Popup
                          trigger={<Icon name='info circle' />}
                          content='This is an info'
                        />
                      </div>
                    </div>
                    <div className="statistic">
                      <div className="value">0</div>
                      <div className="label">
                        IN VOTING COMMIT&nbsp;
                        <Popup
                          trigger={<Icon name='info circle' />}
                          content='This is an info'
                        />
                      </div>
                    </div>
                    <div className="statistic">
                      <div className="value">0</div>
                      <div className="label">
                        IN VOTING REVEAL&nbsp;
                        <Popup
                          trigger={<Icon name='info circle' />}
                          content='This is an info'
                        />
                      </div>
                    </div>
                    <div className="statistic">
                      <div className="value">65</div>
                      <div className="label">
                        IN REGISTRY&nbsp;
                        <Popup
                          trigger={<Icon name='info circle' />}
                          content='This is an info'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
     {/*   <div className="column eight wide">
          <Challenge />
        </div>*/}
      </div>

    );
  }
}

export default CSSModules(Registry, styles);
