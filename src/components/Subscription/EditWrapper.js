import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Alert, Media, Spinner, Row, Col, Button } from 'reactstrap';
import statusParser from '../../helpers/statusParser'
import IcoLogo from '../IcoLogo';
import Step1RegisterAs from '../Step/Step1RegisterAs';
import Step1bProofOfLiveness from '../Step/Step1bProofOfLiveness';
import Step2Individual from '../Step/Step2Individual';
import Step2Company from '../Step/Step2Company';
import Step2Annex1 from '../Step/Step2Annex1';
import Step2Annex2 from '../Step/Step2Annex2';
import Step2ExtraDocument from '../Step/Step2ExtraDocument';
import Step3Contribution from '../Step/Step3Contribution';
import Step4Crypto from '../Step/Step4Crypto';
import Step4Fiat from '../Step/Step4Fiat';
import Step5TokenDeliveryAddress from '../Step/Step5TokenDeliveryAddress';
import Step6VideoConference from '../Step/Step6VideoConference';
import GlobalErrors from '../GlobalErrors';
import moment from 'moment';
import CustomInput from 'reactstrap/lib/CustomInput';

function SubscriptionEditWrapper(props) {
  const { subscription, fillStatus, loading, SubscriptionStore, finalizing } = props;
  const { globalErrors, finalizingError } = SubscriptionStore;
  const terms = SubscriptionStore.getTerms();
  const [stepOpen, setStepOpen] = useState();
  const [shown, setShown] = useState();
  const [successMessage, setSuccessMessage] = useState();

  const stepComponents = [
    Step1RegisterAs,
    Step1bProofOfLiveness,
    Step2Individual,
    Step2Company,
    Step2Annex1,
    Step2Annex2,
    Step2ExtraDocument,
    Step3Contribution,
    Step4Crypto,
    Step4Fiat,
    Step5TokenDeliveryAddress,
    Step6VideoConference,
  ];

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

  if (!fillStatus) {
    return (
      <Alert color="danger">
        Can't load current subscription state!
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
        <Col xs="12" className="mb-12 mb-md-3 text-right">
          <strong>Status of your subscription: </strong>
          <div className="badge badge-info">
            {statusParser(subscription.status)}
          </div>
        </Col>
      </Row>

      {
        fillStatus.video_conference_date &&
        <Row className="justify-content-md-between align-items-md-center">
          <Col xs="12" className="mb-12 mb-md-3 text-right">
            <strong>Video conference date: </strong>
            <div className="badge badge-info">
              {
                moment(fillStatus.video_conference_date).format('DD/MM/YYYY HH:mm')
              }
            </div>
          </Col>
        </Row>
      }

      <div className={`${subscription && SubscriptionStore.isSubmitted(subscription.id) ? 'subscription-submitted' : ''}`}>
        {stepComponents.map((Component, index) =>
          <Component key={index}
            subscription={subscription}
            fillStatus={fillStatus}
            stepOpen={stepOpen}
            setStepOpen={setStepOpen}
            shown={shown}
            setShown={setShown}
            ico={subscription.ico_subscribed[0].ico}
          />)
        }
      </div>

      <GlobalErrors errors={globalErrors}></GlobalErrors>
      {successMessage && <Alert color="success">{successMessage}</Alert>}

      <Row className="justify-content-md-between align-items-md-end mb-4">
        <Col className="col-12 col-md-6">
          <CustomInput type="checkbox" id={'terms'}
            required={true}
            className="required"
            label="I have read the terms and conditions"
            checked={terms}
            onChange={(ev) => {
              SubscriptionStore.setTerms(ev.target.checked);
            }}
            invalid={false}
          >
            <span className="required"></span>
          </CustomInput>

          <Button
            className={`w-100 mt-5 ${finalizing ? "loading" : ''}`}
            color="primary"
            disabled={finalizing}
            onClick={() => {
              setSuccessMessage(null);
              // setGlobalErrors(null);
              SubscriptionStore.setGlobalErrors(null);
              SubscriptionStore.finalize(subscription.id, terms)
                .then(res => {
                  SubscriptionStore.setFillStatus(res);
                  setSuccessMessage("Thanks for your submission. You will be updated soon.");
                })
                .catch(err => {
                  SubscriptionStore.setGlobalErrors(err.response ? err.response.body : "Unknown error occurred. Please try again or contact us.");
                });
            }}
          >
            {finalizing ? 'Submission in progress...' : 'Finalize my KYC'}
          </Button>

        </Col>


        {
          fillStatus.status !== 'subscription_pending'
          &&
          <Col className="col-12 col-md-6 mt-3 mt-md-0">
            <Link to={`/subscription/payment-status/${subscription.id}`} className="btn btn-outline-success w-100">Go to payment status page</Link>
          </Col>
        }
      </Row>
      {finalizingError && <Row><Col className='text-danger'>{finalizingError}</Col></Row>}
    </>
  );
}

export default inject('SubscriptionStore')(observer(SubscriptionEditWrapper));
