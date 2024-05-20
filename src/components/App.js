import React, { useEffect } from "react";
import { Routes, Route, withRouter, useNavigate } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { Container, Col, Row, Spinner } from "reactstrap";
import Header from "./Header";
import PrivateRoute from "./PrivateRoute";
import Register from "../pages/Register";
import Validate from "../pages/Validate";
import ValidateResend from "../pages/ValidateResend";
import PasswordResetRequest from "../pages/PasswordResetRequest";
import PasswordResetUpdate from "../pages/PasswordResetUpdate";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Subscription from "../pages/Subscription";
import Footer from "./Footer";

const urlParams = new URLSearchParams(window.location.search);
const referral = urlParams.get("referral");
if (referral) {
  sessionStorage.setItem("referral", referral);
  window.history.pushState({}, null, "/" + window.location.hash);
}

function App(props) {
  const { CommonStore, CustomerStore } = props;
  const navigate = useNavigate();

  useEffect(() => {
    document.title = CommonStore.appName;

    if (CommonStore.token) {
      CustomerStore.loadCustomer()
        .catch((err) => {
          if (err && err.response && err.response.status === 403) {
            navigate("/validate", { replace: true });
          }
        })
        .finally(() => CommonStore.setAppLoaded());
    } else {
      CommonStore.setAppLoaded();
    }
  }, [CommonStore, CustomerStore, navigate]);

  if (CommonStore.appLoaded) {
    return (
      <>
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/validate" element={<Validate />} exact />
          <Route path="/validate/resend" element={<ValidateResend />} />
          <Route
            path="/password-reset/request"
            element={<PasswordResetRequest />}
          />
          <Route
            path="/password-reset/update"
            element={<PasswordResetUpdate />}
            exact
          />
          <Route
            path="/password-reset/update/:token"
            element={<PasswordResetUpdate />}
          />
          <Route
            path="/subscription/*"
            element={
              <PrivateRoute>
                <Subscription />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Home />} />
        </Routes>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="global-container">
        <Row>
          <Col className="text-center">
            <Spinner color="secondary " className="m-5 p-5" />
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}

export default inject("CommonStore", "CustomerStore")(observer(App));
