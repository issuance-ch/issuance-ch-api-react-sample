import React from "react";
import { inject, observer } from "mobx-react";
import { Button, Spinner } from "reactstrap";
import CollapsibleCard from "../CollapsibleCard";
import { toJS } from "mobx";

function Step1bProofOfLiveness(props) {
  const groupName = "pol";
  const fieldName = "pol";
  const { PolStore, SubscriptionStore, fillStatus, ...otherProps } = props;
  const { loadingPol, polError, initPolUrl, polUrl, stopPol } = PolStore;
  const { loading: loadingSubscriptions } = SubscriptionStore;

  const { header, fields } = fillStatus.groups[groupName];
  const pol = fields[fieldName];

  const polStatus = toJS(fields.pol.status);

  const receiveMessage = async (evt) => {
    console.log("Received_message", evt);
    console.log("Received_message2", evt.data?.name);

    if (evt.data?.name === "verifyPage") {
      console.log("Process is completed");
      stopPol();

      // Get pol status update, thn re-fetch subscription
      PolStore.completePol(toJS(fillStatus.subscription_id))
        .then((result) => {
          console.log("Receive result from completePol", result);
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
              src={polUrl}
              frameborder="0"
              allow="camera"
              class="full-screen bg-white"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {polStatus === "REFUSED" && (
        <div className="alert alert-danger">
          {polError || display.msg.refused}
        </div>
      )}
      {polStatus === "ACCEPTED" && (
        <div className="alert alert-success">{display.msg.accepted}</div>
      )}
      {polStatus === "FILLED" && (
        <div className="alert alert-info">{display.msg.filled}</div>
      )}

      {polStatus !== "ACCEPTED" && <Button color="primary" onClick={() => startPol()}>
        {(polStatus === "REFUSED" || polError) && display.btns.retry}
        {(polStatus === "FILLED") &&
          !polError &&
          display.btns.update}
        {polStatus === "EMPTY" && !polError && display.btns.start}
      </Button>}
    </CollapsibleCard>
  );
}

export default inject(
  "SubscriptionStore",
  "PolStore"
)(observer(Step1bProofOfLiveness));
