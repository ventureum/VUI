import React from 'react'
import { Container, Header, Segment } from 'semantic-ui-react'
import CSSModules from 'react-css-modules'

import styles from './styles.css'

class Home extends React.Component {
  render () {
    return (
      <div class='home'>
        <Segment compact>
          <Container text>
            <Segment color='orange'>
              Warning: As the Ventureum Protocol is being frequently updated, some functions work intermittently.
              <br />
              Current Version: 62c6c74
            </Segment>
            <Header size='huge'>How does this work?</Header>
            <p>Ventureum Token-Curated Registry (VTCR) implements the pre-ICO governance of the Ventureum protocol.</p>
            <Header size='medium'>Application</Header>
            <p>Project founders can submit an application to list their projects in VTCR. Founders are required to provide detailed disclosure about their project by using the form in the <strong>Application</strong> page. Please note founders need to stake an non-refundable amount of 50,000 VTH for an application.</p>
            <Header size='medium'>Projects</Header>
            <p>All projects which are either accepted (in "WHITELIST") into VTCR or still in the application stage are demonstrated here. VTH holders can stake an non-refundable amount of 50,000 VTH and challenge an application during its application stage (by clicking the “CHALLENGE” button). If an application is being challenged, other VTH holders can stake voting rights and participate in a vote to decide the winning party of the challenge, employing the classical "COMMIT" and "REVEAL" process. In the "COMMIT" stage, voters can cast their voting rights in favor of the project founder or the challenger. Their votes are invisible to others. In the "REVEAL" stage, voters are required to reveal their votes. If they failed to do so, their voting rights and the corresponding VTH would be confiscated by the contract. After the "REVEAL" stage, either the founder or the challenger needs to "RESOLVE CHALLENGE" to reveal the result of the vote. If the challenger wins the vote, 50% of the deposit by the project founder will be transferred to the challenger once "RESOLVE CHALLENGE" is clicked. </p>
            <Header size='medium'>Account Dashboard</Header>
            <p>Users can stake VTH and "Request Voting Rights". They can also use the interface to withdraw voting rights by clicking the "Withdraw VTH" button. If a user participated in a vote to resolve a challenge and she is in the winning voting bloc, she can use "Claim Reward" to retrieve VTH disbursed from 50% of the deposit by the losing party (either the project founder or the challenger).</p>
            <Header size='medium'>VTH Faucet</Header>
            <p>To facilitate testing the functionality of VTCR, a VTH faucet is available on the top panel. Users can convert ETH into VTH. The current exchange rate is 1 ETH = 10,000 VTH.</p>
          </Container>
        </Segment>
      </div>
    )
  }
}

export default CSSModules(Home, styles)
