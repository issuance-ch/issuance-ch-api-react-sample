import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Col, Row } from 'reactstrap';
import PaymentStatusWrapper from '../../components/Subscription/PaymentStatusWrapper';

function SubscriptionPaymentStatus(props) {
  const { id } = useParams();

  return (
    <Container className="payment-status-container">
      <Row>
        <Col>
          <Row className="justify-content-md-between align-items-md-center mb-3">
            <Col xs="12" md={{ size: 'auto' }}>
              <h1>Subscription <small>payment status</small></h1>
            </Col>
            <Col xs="12" md={{ size: 'auto' }}>
              <Link to={'/subscription'} className="btn btn-secondary w-100">Back</Link>
            </Col>
          </Row>

          <PaymentStatusWrapper
            id={id}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default SubscriptionPaymentStatus;
