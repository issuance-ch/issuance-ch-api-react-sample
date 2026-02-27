import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Container, Col, Row, Media, Spinner, Alert } from 'reactstrap';
import IcoLogo from '../../components/IcoLogo';
import statusParser from '../../helpers/statusParser';
import { CONFERENCE_HOST_NAME } from '../../config';

function SubscriptionVideoConference(props) {
  const { id } = useParams();
  const { SubscriptionStore } = props;
  const { loading } = SubscriptionStore;
  const subscription = SubscriptionStore.getSubscription(id);
  const fillStatus = SubscriptionStore.fillStatus;


  const getVideoConferenceHostname = () => {
    let conferenceHostName = CONFERENCE_HOST_NAME;

    switch (typeof conferenceHostName) {
      case "string":
        return conferenceHostName;
      case "object":
        if (conferenceHostName[window.location.host]) {
          return conferenceHostName[window.location.host];
        } else if (conferenceHostName["default"]) {
          return conferenceHostName["default"];
        } else {
          return "";
        }
      default:
        return "";
    }
  }

  useEffect(() => {
    SubscriptionStore.loadSubscription(id, { acceptCached: true });
    SubscriptionStore.loadFillStatus(id);

  }, [SubscriptionStore, id]);

  if ((!subscription || !fillStatus) && loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!subscription || !fillStatus) {
    return (
      <Alert color="danger">
        Can't load subscription!
      </Alert>
    );
  }

  return (
    <Container className="videoconf-container">
      <Row>
        <Col>
          <Row className="justify-content-md-between align-items-md-center mb-3">
            <Col xs="12" md={{ size: 'auto' }}>
              <h1>Subscription <small>video conference</small></h1>
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

      <iframe allow="camera;microphone" title="video-conference" src={getVideoConferenceHostname() + '/' + fillStatus.video_conference_external_link} className="video-conference" />
    </Container>
  );
}

export default inject('SubscriptionStore')(observer(SubscriptionVideoConference));
