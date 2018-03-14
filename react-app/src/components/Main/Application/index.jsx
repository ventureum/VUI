import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './styles.css'

class Application extends Component {
  render() {
    return (
      <div className="application">
        <div className="ui grid stackable padded">
          <div className="column eight wide">
            <div className="application-form">
              <div className="ui grid stackable">
                <div className="column sixteen wide left aligned">
                  <div className="ui large header">
                    Program Application
                  </div>
                </div>
                <div className="column sixteen wide left aligned">
                  <p>
                    Please fill the form
                  </p>
                </div>
                <div className="column sixteen wide left aligned">
                  <form className="ui form">
                    <div className="field required">
                      <label>Project Name</label>
                      <div className="ui input">
                        <input type="text" placeholder="example.com" name="domain" required="" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Site Name</label>
                      <div className="ui input">
                        <input type="text" placeholder="Site Name" name="siteName" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Country Based In</label>
                      <div className="ui input">
                        <input type="text" placeholder="United States" name="country" />
                      </div>
                    </div>
                    <div className="two fields">
                      <div className="field">
                        <label>First Name</label>
                        <div className="ui input">
                          <input type="text" placeholder="John" name="firstName" />
                        </div>
                      </div>
                      <div className="field">
                        <label>Last Name</label>
                        <div className="ui input">
                          <input type="text" placeholder="Doe" name="lastName" />
                        </div>
                      </div>
                    </div>
                    <div className="field">
                      <label>Email Address</label>
                      <div className="ui input">
                        <input type="text" placeholder="john@example.com" name="email" />
                      </div>
                    </div>
                    <div className="field required">
                      <label>
                        Total VTH to Stake (Min:
                        <a href="#!">
                                    10,000 VTH
                                </a>)
                      </label>
                      <div className="ui input">
                        <input type="text" id="PublisherApplicationFormStakeInput" placeholder="10000" name="stake" required="" />
                      </div>
                    </div>
                    <div className="field">
                      <button type="submit" className="ui blue submit button">APPLY</button>
                    </div>
                  </form>
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
