import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { Alert, Media, Spinner, Row, Col } from 'reactstrap';
import IcoLogo from '../IcoLogo';
import statusParser from '../../helpers/statusParser';
import PaymentStatusForm from '../PaymentStatusForm';

function SubscriptionPaymentStatusWrapper(props) {
  const { id, SubscriptionStore } = props;
  const { loading } = SubscriptionStore;
  const subscription = SubscriptionStore.getSubscription(id);

  useEffect(() => {
    SubscriptionStore.loadSubscription(id, { acceptCached: true });
  }, [SubscriptionStore, id]);

  if (loading) {
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
    <>
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
        <Col xs="12" className="mb-3 text-right">
          <strong>Status of your subscription: </strong>
          <div className="badge badge-info">
            {statusParser(subscription.status)}
          </div>
        </Col>
        <Col xs="12" className="mb-3 text-right">
          <strong>Token delivery address: </strong>
          <div className="badge badge-info">
            {subscription.ico_subscribed[0].investment.crypto_address_for_token_delivry.value}
          </div>
        </Col>
      </Row>

      <PaymentStatusForm subscription={subscription} />
    </>
  );
}

export default inject('SubscriptionStore')(observer(SubscriptionPaymentStatusWrapper));
