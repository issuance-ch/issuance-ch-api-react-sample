import React from 'react';
import { inject, observer } from 'mobx-react';
import { Container, Jumbotron, Col, Row } from 'reactstrap';

function Home(props) {
  return (
    <Jumbotron>
      <Container className="home-container">
        <Row>
          <Col xs="12" md={{ size: 8, offset: 2 }}>
            <h1>Welcome to {props.CommonStore.appName}</h1>
            <p>
              We implement a simple and user-friendly procedure in line with the Swiss regulatory framework,
              that’s why you are asked to complete a brief « Know Your Customer » process.
            </p>
            <p>
              <strong>
                Altcoinomy is a Swiss-based supervised KYC operator who will be conducting anti money laundering analysis.
                Altcoinomy SA (CHE-209.239.695) is bound by Swiss laws on banking secrecy,
                and will never distribute confidential information about you.
              </strong>
            </p>
            <p>
              All data is encrypted and stored offline.
            </p>
            <p>
              Let’s get started!
            </p>
          </Col>
        </Row>
      </Container>
    </Jumbotron>
  );
}

export default inject('CommonStore')(observer(Home));
