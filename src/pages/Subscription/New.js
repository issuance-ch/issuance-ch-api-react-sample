import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Container, Col, Row, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import NewWrapper from "../../components/Subscription/NewWrapper";
import { toJS } from "mobx";

function SubscriptionNew(props) {
  const { IcoStore, SubscriptionStore } = props;

  // States
  const [existingSubscription, setExistingSubscription] = useState(null);
  const navigate = useNavigate();


  // Closing the modal by removing the found existing subscription
  const closeWarning = () => {
    setExistingSubscription(null);
  }

  useEffect(() => {
    IcoStore.loadIcos();
  }, [IcoStore]);

  useEffect(() => {
    SubscriptionStore.loadSubscriptions();
  }, [SubscriptionStore]);


  /**
   * Request a subscription paritipation
   * @param {object} ico Ico in which the user wants to subscribe
   * @param {string} registerAs Which subscription type (either cmopany or individual)
   */
  function participate(ico, registerAs) {
    const icoId = ico.id;

    const concerned = SubscriptionStore.subscriptions.map(row => toJS(row)).filter((row) => icoId === row.ico_subscribed[0].ico.id);

    let existing = null;
    let important = false;

    for (const subscription of concerned) {
      switch (subscription.status) {
        case "subscription_to_be_fixed":
        case "subscription_pending":
        case "subscription_submitted":
          existing = {
            icoId: concerned[concerned.length - 1].ico_subscribed[0].ico.id,
            id: concerned[concerned.length - 1].id,
            subscripitonStatus: concerned[concerned.length - 1].status,
            registerAs,
            icoName: ico.name
          }
          important = true;
          break;
        case "subscription_onboarded":
        case "subscription_acknowledged":
          existing = {
            icoId: concerned[concerned.length - 1].ico_subscribed[0].ico.id,
            id: concerned[concerned.length - 1].id,
            subscripitonStatus: "subscription_onboarded",
            registerAs,
            icoName: ico.name
          }
          break;
      }

      // Some status are most important, making user unable to create a new subscription...
      if (important) {
        break;
      }
    }

    setExistingSubscription(existing);

    // If the user doest not have any subscription in the chosen ico, we automatically initiate the new subscrption (no modal needed)
    if (!existing) {
      initiateNewSubscription(icoId, registerAs);
    }
  }

  /**
   * Creates a subscription and redirect to it.
   * @param {string} icoId 
   * @param {string} registerAs 
   */
  function initiateNewSubscription(icoId, registerAs) {
    setExistingSubscription(null);
    SubscriptionStore.createSubscription(icoId, registerAs).then(
      (subscription) => {
        navigate(`/subscription/${subscription.id}`, { replace: true });
      }
    );
  }

  // Rendering the list of projects
  return (
    <Container className="new-subscription-container">
      <Modal isOpen={existingSubscription} toggle={closeWarning} backdrop={true} >
        <ModalHeader toggle={closeWarning} close={<button className="close" onClick={closeWarning}>&times;</button>}>
          You already have an active subscription
        </ModalHeader>
        <ModalBody>
          {existingSubscription?.subscripitonStatus === "subscription_pending" && <>
            You already have an ongoing participation for <strong>{existingSubscription.icoName}</strong> awaiting complementary information to be finalized.
          </>}
          {existingSubscription?.subscripitonStatus === "subscription_to_be_fixed" && <>
            You already have an ongoing participation for <strong>{existingSubscription.icoName}</strong> awaiting complementary information for our compliance officers
            to finalize it.
          </>}
          {existingSubscription?.subscripitonStatus === "subscription_submitted" && <>
            You already have an ongoing participation for <strong>{existingSubscription.icoName}</strong>. Our compliance officers are currently checking it.
          </>}
          {existingSubscription?.subscripitonStatus === "subscription_onboarded" && <>
            You already have taken part in the <strong>{existingSubscription.icoName}</strong> project. Please choose wether to update your payment status or start a
            new
            participation.
          </>}
        </ModalBody>
        <ModalFooter>
          {existingSubscription?.subscripitonStatus === "subscription_pending" && <>
            <Link to={`/subscription/${existingSubscription.id}`} className="btn btn-outline-primary mr-1">Finalize contribution</Link>
          </>}
          {existingSubscription?.subscripitonStatus === "subscription_to_be_fixed" && <>
            <Link to={`/subscription/${existingSubscription.id}`} className="btn btn-outline-primary mr-1">Update form</Link>
          </>}
          {existingSubscription?.subscripitonStatus === "subscription_submitted" && <>
            <Link to={`/subscription/payment-status/${existingSubscription.id}`} className="btn btn-outline-primary mr-1">Update payment status</Link>
          </>}
          {existingSubscription?.subscripitonStatus === "subscription_onboarded" && <>
            <Link to={`/subscription/payment-status/${existingSubscription.id}`} className="btn btn-outline-primary mr-1">Update payment status</Link>
            <Button color="primary" onClick={() => { initiateNewSubscription(existingSubscription.icoId, existingSubscription.registerAs) }}>Start new participation</Button>
          </>}

          <Button color="secondary" onClick={closeWarning}>Annuler</Button>
        </ModalFooter>
      </Modal>
      <Row>
        <Col>
          <Row className="justify-content-md-between align-items-md-center mb-3">
            <Col xs="12" md={{ size: "auto" }}>
              <h1>
                Subscription <small>new</small>
              </h1>
            </Col>
            <Col xs="12" md={{ size: "auto" }}>
              <Link to="/subscription" className="btn btn-secondary w-100">
                Cancel
              </Link>
            </Col>
          </Row>

          <NewWrapper
            icos={IcoStore.icos}
            loadingIco={IcoStore.loading}
            loadingSubscription={SubscriptionStore.loading}
            participate={participate}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default inject(
  "IcoStore",
  "SubscriptionStore"
)(observer(SubscriptionNew));
