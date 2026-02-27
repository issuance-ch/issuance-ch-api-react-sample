import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Container, Col, Row } from 'reactstrap';
import EditWrapper from '../../components/Subscription/EditWrapper';

function SubscriptionEdit(props) {
  const { id } = useParams();
  const { SubscriptionStore, Annex1Store, Annex2Store, IcoDocumentStore } = props;
  const { loading, finalizing } = SubscriptionStore;
  const subscription = SubscriptionStore.getSubscription(id);
  const fillStatus = SubscriptionStore.fillStatus;

  useEffect(() => {
    SubscriptionStore.loadSubscription(id, { acceptCached: true });
    SubscriptionStore.loadFillStatus(id);

    Annex1Store.reset();
    Annex2Store.reset();

    IcoDocumentStore.reset();

    return () => { SubscriptionStore.resetFillStatus() };
  }, [SubscriptionStore, Annex1Store, Annex2Store, IcoDocumentStore, id]);

  return (
    <Container className="subscription-container">
      <Row>
        <Col>
          <Row className="justify-content-md-between align-items-md-center mb-3">
            <Col xs="12" md={{ size: 'auto' }}>
              <h1>Subscription <small>edit</small></h1>
            </Col>
            <Col xs="12" md={{ size: 'auto' }}>
              <Link to={'/subscription'} className="btn btn-secondary w-100">Cancel</Link>
            </Col>
          </Row>

          <EditWrapper
            subscription={subscription}
            fillStatus={fillStatus}
            loading={loading}
            finalizing={finalizing}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default inject('SubscriptionStore', 'Annex1Store', 'Annex2Store', 'IcoDocumentStore')(observer(SubscriptionEdit));
