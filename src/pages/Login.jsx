import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inject, observer } from "mobx-react";
import {
  Container,
  Col,
  Row,
  Button,
  Spinner,
  Form,
  FormGroup,
  Input,
} from "reactstrap";
import FormErrors from "../components/FormErrors";

function Login(props) {
  const { AccountStore } = props;
  const { values, errors, loading } = AccountStore;
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      AccountStore.reset();
    };
  }, [AccountStore]);

  function handleUsernameChange(e) {
    AccountStore.setUsername(e.target.value);
  }
  function handlePasswordChange(e) {
    AccountStore.setPassword(e.target.value);
  }
  function handleSubmitForm(e) {
    e.preventDefault();

    AccountStore.login()
      .then(() => navigate("/", { replace: true }))
      .catch((err) => {
        if (err && err.response && err.response.status === 403) {
          navigate("/validate", { replace: true });
        }
      });
  }

  return (
    <Container className="login-container">
      <Row>
        <Col xs="12" md={{ size: 6, offset: 3 }}>
          <h1>Sign In</h1>
          <Row className="justify-content-between">
            <Col xs="12" md={{ size: "auto" }}>
              <p>
                <Link to="/register">Need an account?</Link>
              </p>
            </Col>
            <Col xs="12" md={{ size: "auto" }}>
              <Link to="/password-reset/request">Forgot password?</Link>
            </Col>
          </Row>

          <FormErrors errors={errors} />

          <Form onSubmit={handleSubmitForm}>
            <FormGroup>
              <Input
                type="text"
                placeholder="Username"
                bsSize="lg"
                value={values.username}
                onChange={handleUsernameChange}
              ></Input>
            </FormGroup>
            <FormGroup>
              <Input
                type="password"
                placeholder="Password"
                bsSize="lg"
                value={values.password}
                onChange={handlePasswordChange}
              ></Input>
            </FormGroup>

            <Button
              color="primary"
              size="lg"
              disabled={loading}
              className="d-flex align-items-center"
            >
              {loading && <Spinner size="sm" className="mr-2" />}
              Sign In
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default inject("AccountStore")(observer(Login));
