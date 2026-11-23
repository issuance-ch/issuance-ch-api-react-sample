import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { Alert, Button, Spinner } from "reactstrap";
import CollapsibleCard from "../CollapsibleCard";
import { toJS } from "mobx";
import { polErrorMessage } from "../../stores/PolStore";

// Delay between two checks of the status while the proof of liveness is being checked.
const POL_STATUS_POLL_MS = 10000;

function Step1bProofOfLiveness(props) {
  const groupName = "pol";
  const fieldName = "pol";
  const { PolStore, SubscriptionStore, fillStatus, subscription, identificationAfterPayment, isPaymentConfirmed, ...otherProps } = props;
  const { loadingPol, polError, initPolUrl, polUrl, stopPol } = PolStore;
  const { loading: loadingSubscriptions } = SubscriptionStore;

  const { header, fields } = fillStatus.groups[groupName];
  const pol = fields[fieldName];

  const polStatus = toJS(fields.pol.status);

  // Reason of a rejection known when the page loads (the verdict may arrive after the check window
  // was closed, e.g. an ID already used by another account).
  const refuseReasons = toJS(subscription?.checkin_pol_documents?.refuse_reason);
  const refusedError = polStatus === "REFUSED" && refuseReasons?.length ? polErrorMessage(refuseReasons) : null;

  // While the check is being reviewed, ask its status regularly and show the verdict as soon as it
  // is known, without reloading the page.
  useEffect(() => {
    if (polStatus !== "FILLED") {
      return undefined;
    }
    let stopped = false;
    const timer = setInterval(() => {
      PolStore.checkPol(fillStatus.subscription_id)
        .then((response) => {
          if (stopped || !response || ["pending", "need-review"].includes(response.pol_status)) {
            return;
          }
          SubscriptionStore.refreshPolStatus(fillStatus.subscription_id);
        })
        .catch(() => {
          // Network error: the next tick tries again.
        });
    }, POL_STATUS_POLL_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [polStatus, fillStatus.subscription_id, PolStore, SubscriptionStore]);

  const receiveMessage = async (evt) => {

    if (evt.data?.name === "verifyPage") {
      stopPol();

      // Get pol status update, thn re-fetch subscription
      PolStore.completePol(toJS(fillStatus.subscription_id))
        .then((result) => {
          if (!result) {
            return;
          }

          SubscriptionStore.loadFillStatus(fillStatus.subscription_id);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  // Run the checkin iframe to start the proof of liveness
  const startPol = () => {
    initPolUrl(fillStatus.subscription_id);
    window.addEventListener("message", receiveMessage);
  };

  const cancelPol = () => {
    window.removeEventListener("message", receiveMessage);
    stopPol();
  };

  let display = {
    msg: {
      refused:
        "Sorry, your proof of liveness did not pass. Please do it again.",
      accepted: "You completed your proof of liveness.",
      filled: "Your proof of liveness is being checked.",
    },
    btns: {
      retry: "Retry my proof of liveness",
      update: "Update my proof of liveness",
      start: "Start the proof of liveness",
    },
  };

  if (
    toJS(fillStatus.groups.basics.fields.subscribed_as.value) !== "individual"
  ) {
    display = {
      msg: {
        refused: "Sorry, your documents were not valid. Please do it again.",
        accepted: "Your id documents have been accepted.",
        filled: "Your id documents are being checked.",
      },
      btns: {
        retry: "Send my documents again",
        update: "Update my id documents",
        start: "Securely send my id documents",
      },
    };
  }

  // Display loader if pol is validating
  if (loadingPol || loadingSubscriptions) {
    return <Spinner color="secondary" />;
  }

  // Display the form
  return (
    <CollapsibleCard
      active={header.active}
      name={groupName}
      header={
        toJS(fillStatus.groups.basics.fields.subscribed_as.value) ===
          "individual"
          ? "Proof of liveness"
          : "Signatory identification documents"
      }
      fields={header.active ? { pol } : null}
      considerAsForm
      {...otherProps}
    >
      {identificationAfterPayment && !isPaymentConfirmed ? (
        <Alert color="info">
          You will be able to continue the process once our team has confirmed the reception of your payments, this may take a few days.
        </Alert>
      ) : (
      <>
        {toJS(fillStatus.groups.basics.fields.subscribed_as.value) ===
          "individual" ? (
          <>
            <p>We use an automated identity checking process.</p>
            <p>
              The self onboarding requires you to undergo proof of liveness
              process.
            </p>
            <p>
              Uploading an ID document containing an MRZ (passport or ID card)
              ensures the fastest on boarding. Any other documents will require
              our KYC officers to look into your application on a case by case,
              and might be refused.
            </p>
            <p>
              Do not worry if this one fails, a compliance officer will get back
              to you to resolve it.
            </p>
          </>
        ) : (
          <>
            <p>Please upload the identifications documents of the signatory.</p>
            <p>
              Uploading an ID document containing an MRZ (passport or ID card)
              ensures the fastest on boarding. Any other documents will require
              our KYC officers to look into your application on a case by case,
              and might be refused.
            </p>
            <p>
              Do not worry if this one fails, a compliance officer will get back
              to you to resolve it.
            </p>
          </>
        )}
        {polUrl && (
          <div class="full-screen-overlay">
            <div className="full-screen-content">
              <div class="close-iframe">
                <button class="btn btn-close" onClick={cancelPol}>
                  &times; Cancel
                </button>
              </div>
              <iframe
                title="Proof of liveness session"
                src={polUrl}
                frameborder="0"
                allow="camera; microphone"
                class="full-screen bg-white"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {polStatus === "REFUSED" && (
          <div className="alert alert-danger">
            {polError || refusedError || display.msg.refused}
          </div>
        )}
        {polStatus === "ACCEPTED" && (
          <div className="alert alert-success">{display.msg.accepted}</div>
        )}
        {polStatus === "FILLED" && (
          <div className="alert alert-info">
            <Spinner size="sm" color="info" className="mr-2" />
            {display.msg.filled}
          </div>
        )}

        {polStatus !== "ACCEPTED" && <Button color="primary" onClick={() => startPol()}>
          {(polStatus === "REFUSED" || polError)
            ? display.btns.retry
            : polStatus === "FILLED"
              ? display.btns.update
              : display.btns.start}
        </Button>}
      </>
      )}
    </CollapsibleCard>
  );
}

export default inject(
  "SubscriptionStore",
  "PolStore"
)(observer(Step1bProofOfLiveness));
