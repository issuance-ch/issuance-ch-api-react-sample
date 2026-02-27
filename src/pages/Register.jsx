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
import FieldErrors from "../components/FieldErrors";

function Register(props) {
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
  function handleEmailChange(e) {
    AccountStore.setEmail(e.target.value);
  }
  function handlePasswordChange(e) {
    AccountStore.setPassword(e.target.value);
  }
  function handleSubmitForm(e) {
    e.preventDefault();

    AccountStore.register()
      .then(() => navigate("/validate", { replace: true }))
      .catch((err) => {});
  }

  return (
    <Container className="register-container">
      <Row>
        <Col xs="12" md={{ size: 6, offset: 3 }}>
          <h1>Sign Up</h1>
          <p>
            <Link to="/login">Have an account?</Link>
          </p>

          <FormErrors errors={errors} />

          <Form onSubmit={handleSubmitForm}>
            <FormGroup>
              <Input
                type="text"
                placeholder="Username"
                bsSize="lg"
                value={values.username}
                onChange={handleUsernameChange}
                className={
                  errors &&
                  errors.fields &&
                  errors.fields.username &&
                  "is-invalid"
                }
              ></Input>
              <FieldErrors errors={errors} field="username" />
            </FormGroup>

            <FormGroup>
              <Input
                type="email"
                placeholder="Email"
                bsSize="lg"
                value={values.email}
                onChange={handleEmailChange}
                className={
                  errors && errors.fields && errors.fields.email && "is-invalid"
                }
              ></Input>
              <FieldErrors errors={errors} field="email" />
            </FormGroup>

            <FormGroup>
              <Input
                type="password"
                placeholder="Password"
                bsSize="lg"
                value={values.password}
                onChange={handlePasswordChange}
                className={
                  errors &&
                  errors.fields &&
                  errors.fields.plainPassword &&
                  "is-invalid"
                }
              ></Input>
              <FieldErrors errors={errors} field="plainPassword" />
            </FormGroup>

            <Button
              color="primary"
              size="lg"
              disabled={loading}
              className="d-flex align-items-center"
            >
              {loading && <Spinner size="sm" className="mr-2" />}
              Sign Up
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default inject("AccountStore")(observer(Register));
