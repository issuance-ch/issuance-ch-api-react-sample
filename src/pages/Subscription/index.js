import React from "react";
import { Routes, Route } from "react-router-dom";
import SubscriptionList from "./List";
import SubscriptionNew from "./New";
import SubscriptionEdit from "./Edit";
import SubscriptionPaymentStatus from "./PaymentStatus";
import SubscriptionVideoConference from "./VideoConference";
import SubscriptionVideoConferenceBooking from "./VideoConferenceBooking";

function Subscription(props) {
  return (
    <Routes>
      <Route path={``} element={<SubscriptionList />} />
      <Route path={`new`} element={<SubscriptionNew />} />
      <Route
        path={`payment-status/:id`}
        element={<SubscriptionPaymentStatus />}
      />
      <Route
        path={`video-conference/:id`}
        element={<SubscriptionVideoConference />}
      />
      <Route
        path={`video-conference-booking/:id`}
        element={<SubscriptionVideoConferenceBooking />}
      />
      <Route path={`:id`} element={<SubscriptionEdit />} />
    </Routes>
  );
}

export default Subscription;
