import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Container, Col, Row, Media, Spinner, Alert } from 'reactstrap';
import IcoLogo from '../../components/IcoLogo';
import statusParser from '../../helpers/statusParser'
import VideoConferenceForm from '../../components/VideoConferenceForm';

function SubscriptionVideoConferenceBooking(props) {
  const { id } = useParams();
  const { SubscriptionStore } = props;
  const { loading } = SubscriptionStore;
  const subscription = SubscriptionStore.getSubscription(id);

  useEffect(() => {
    SubscriptionStore.loadSubscription(id, { acceptCached: true });
    SubscriptionStore.loadFillStatus(id);

  }, [SubscriptionStore, id]);

  if (!subscription && loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!subscription) {
    return (
      <Alert color="danger">
        Can't load subscription!
      </Alert>
    );
  }

  return (
    <Container className="videoconf-booding-container">
      <Row>
        <Col>
          <Row className="justify-content-md-between align-items-md-center mb-3">
            <Col xs="12" md={{ size: 'auto' }}>
              <h1>Subscription <small>video conference booking</small></h1>
            </Col>
            <Col xs="12" md={{ size: 'auto' }}>
              <Link to={'/subscription'} className="btn btn-secondary w-100">Back</Link>
            </Col>
          </Row>
        </Col>
      </Row>

      <Media className="mb-3">
        <Media left top className="align-self-start mr-3">
          <IcoLogo icoId={subscription.ico_subscribed[0].ico.id} />
        </Media>
        <Media body>
          <Media heading tag="h3">
            {subscription.ico_subscribed[0].ico.name}
          </Media>
          {subscription.ico_subscribed[0].ico.description}
        </Media>
      </Media>

      <Row className="justify-content-md-between align-items-md-center">
        <Col xs="12" className="mb-12 mb-md-3 text-right">
          <strong>Status of your subscription: </strong>
          <div className="badge badge-info">
            {statusParser(subscription.status)}
          </div>
        </Col>
      </Row>

      <VideoConferenceForm
        subscriptionId={id}
      />
    </Container>
  );
}

export default inject('SubscriptionStore')(observer(SubscriptionVideoConferenceBooking));
