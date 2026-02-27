import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Alert, Badge, Card, CardBody, CardHeader, Media, Spinner, Row, Col, Button, Tooltip } from 'reactstrap';
import statusParser from '../../helpers/statusParser'
import paymentStatusParser, { isPaymentFilled, areAllPaymentsFilled, areAllPaymentsConfirmed } from '../../helpers/paymentStatusParser'
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
import CollapsibleCard from '../CollapsibleCard';
import PaymentStatusForm from '../PaymentStatusForm';
import moment from 'moment';
import CustomInput from 'reactstrap/lib/CustomInput';

function SubscriptionEditWrapper(props) {
  const { subscription, fillStatus, loading, SubscriptionStore, finalizing } = props;
  const { globalErrors, finalizingError } = SubscriptionStore;
  const terms = SubscriptionStore.getTerms();
  const [stepOpen, setStepOpen] = useState();
  const [shown, setShown] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const [finalizeTooltipOpen, setFinalizeTooltipOpen] = useState(false);

  const identificationAfterPayment = subscription?.ico_subscribed?.[0]?.ico?.identification_after_payment;

  const isContributionCompleted = fillStatus?.groups?.finalization?.fields?.contribution?.status === 'FILLED';

  const isPaymentStatusFilled = areAllPaymentsFilled(fillStatus?.payment_status);
  const isPaymentConfirmed = areAllPaymentsConfirmed(fillStatus?.payment_status);

  const stepComponents = [
    Step1RegisterAs,
    ...(identificationAfterPayment ? [] : [Step1bProofOfLiveness]),
    Step2Individual,
    Step2Company,
    Step2Annex1,
    Step2Annex2,
    Step2ExtraDocument,
    Step3Contribution,
    Step4Crypto,
    Step4Fiat,
    ...(identificationAfterPayment ? [] : [Step5TokenDeliveryAddress]),
    Step6VideoConference,
  ];

  const afterPaymentSteps = [Step1bProofOfLiveness, Step5TokenDeliveryAddress];

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
            identificationAfterPayment={identificationAfterPayment}
            isPaymentConfirmed={isPaymentConfirmed}
          />)
        }

        {identificationAfterPayment && (() => {
          const paymentFields = {};
          if (isContributionCompleted && Array.isArray(fillStatus.payment_status)) {
            fillStatus.payment_status.forEach((p, i) => {
              paymentFields[`payment_${i}`] = {
                required: true,
                hidden: false,
                status: isPaymentFilled(p.payment_status) ? 'FILLED' : 'EMPTY',
              };
            });
          }
          return (
            <CollapsibleCard
              name="payment_status"
              header="Payment status"
              active={isContributionCompleted}
              fields={isContributionCompleted ? paymentFields : null}
              considerAsForm
              stepOpen={stepOpen}
              setStepOpen={setStepOpen}
              shown={shown}
              setShown={setShown}
            >
              <PaymentStatusForm subscription={subscription} idPrefix="edit_" />
            </CollapsibleCard>
          );
        })()}

        {identificationAfterPayment && isPaymentStatusFilled && (
          <Card className={`mt-3 mb-2 ${isPaymentConfirmed ? 'border-primary' : 'border-secondary is-not-active after-payment-section'}`}>
            <CardHeader className={`d-flex justify-content-between align-items-start ${isPaymentConfirmed ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
              <div>
                <strong>Steps after payment reception</strong>
                {!isPaymentConfirmed && (
                  <div className="small mt-1" style={{ fontWeight: 'normal' }}>
                    You will be able to continue the process once our team has confirmed the reception of your payments, this may take a few days.
                  </div>
                )}
              </div>
              {Array.isArray(fillStatus.payment_status) && fillStatus.payment_status.length > 0 && (
                <div className="d-flex flex-wrap justify-content-end" style={{ gap: '0.25rem' }}>
                  {fillStatus.payment_status.map((p, i) => {
                    const parsed = paymentStatusParser(p.payment_status);
                    return (
                      <Badge key={i} color={parsed.color}>
                        {p.currency && <span>{p.currency}: </span>}
                        {parsed.label}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardHeader>
            <CardBody>
              {afterPaymentSteps.map((Component, index) =>
                <Component key={`after-payment-${index}`}
                  subscription={subscription}
                  fillStatus={fillStatus}
                  stepOpen={stepOpen}
                  setStepOpen={setStepOpen}
                  shown={shown}
                  setShown={setShown}
                  ico={subscription.ico_subscribed[0].ico}
                  identificationAfterPayment={identificationAfterPayment}
                  isPaymentConfirmed={isPaymentConfirmed}
                />)
              }
            </CardBody>
          </Card>
        )}
      </div>

      <GlobalErrors errors={globalErrors}></GlobalErrors>
      {successMessage && <Alert color="success">{successMessage}</Alert>}

      <Row className="justify-content-md-between align-items-md-end mb-4">
        <Col className="col-12 col-md-6">
          {!(identificationAfterPayment && !isPaymentConfirmed) && (
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
          )}

          <div id="finalize-btn-wrapper" className="d-inline-block w-100 mt-5">
            <Button
              className={`w-100 ${finalizing ? "loading" : ''}`}
              color="primary"
              disabled={finalizing || (identificationAfterPayment && !isPaymentConfirmed)}
              style={(identificationAfterPayment && !isPaymentConfirmed) ? { pointerEvents: 'none' } : {}}
              onClick={() => {
                setSuccessMessage(null);
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
          </div>
          {identificationAfterPayment && !isPaymentConfirmed && (
            <Tooltip
              placement="top"
              isOpen={finalizeTooltipOpen}
              target="finalize-btn-wrapper"
              toggle={() => setFinalizeTooltipOpen(prev => !prev)}
            >
              Toutes les étapes doivent être complétées (y compris le Proof of Liveness et le Token Delivery Address) avant de pouvoir finaliser votre souscription.
            </Tooltip>
          )}

        </Col>


        {
          fillStatus.status !== 'subscription_pending'
          && !identificationAfterPayment
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
