import React from "react";
import { Navigate } from "react-router-dom";
import { inject, observer } from "mobx-react";

function PrivateRoute({ CustomerStore, children }) {
  if (!CustomerStore.currentCustomer) {
    return <Navigate to="/" />;
  }

  if (!CustomerStore.currentCustomer.roles) {
    return <Navigate to="/validate" />;
  }

  if (!CustomerStore.currentCustomer.roles.includes("ROLE_USER_CONFIRMED")) {
    return <Navigate to="/" />;
  }

  return children;
}

export default inject("CustomerStore")(observer(PrivateRoute));
