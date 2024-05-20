import React, { useEffect } from "react";
import { useMatch, Link } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Container, Col, Row } from "reactstrap";
import ListWrapper from "../../components/Subscription/ListWrapper";

function SubscriptionList(props) {
  const match = useMatch("/subscription");
  const { SubscriptionStore } = props;
  const { subscriptions, loading } = SubscriptionStore;

  useEffect(() => {
    SubscriptionStore.loadSubscriptions();
  }, [SubscriptionStore]);

  return (
    <Container className="subscriptions-container">
      <Row>
        <Col>
          <Row className="justify-content-md-between align-items-md-center mb-3">
            <Col xs="12" md={{ size: "auto" }}>
              <h1>
                Subscription <small>list</small>
              </h1>
            </Col>
            <Col xs="12" md={{ size: "auto" }}>
              <Link
                to={`${match.pathnameBase}/new`}
                className="btn btn-primary w-100"
              >
                New
              </Link>
            </Col>
          </Row>

          <ListWrapper subscriptions={subscriptions} loading={loading} />
        </Col>
      </Row>
    </Container>
  );
}

export default inject("SubscriptionStore")(observer(SubscriptionList));
