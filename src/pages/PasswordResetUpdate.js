import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

function PasswordResetUpdate(props) {
  const { AccountStore } = props;
  const { values, errors, loading } = AccountStore;
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (token) {
      AccountStore.setCode(token);
    }

    return () => {
      AccountStore.reset();
    };
  }, [AccountStore, token]);

  function handleCodeChange(e) {
    AccountStore.setCode(e.target.value);
  }
  function handlePasswordChange(e) {
    AccountStore.setPassword(e.target.value);
  }
  function handleSubmitForm(e) {
    e.preventDefault();

    AccountStore.passwordResetUpdate()
      .then(() => navigate("/", { replace: true }))
      .catch((err) => {});
  }

  return (
    <Container className="reset-password-container">
      <Row>
        <Col xs="12" md={{ size: 6, offset: 3 }}>
          <h1>Reset password</h1>
          <p>
            <Link to="/password-reset/request">
              Request a password reset code
            </Link>
          </p>

          <FormErrors errors={errors} />

          <Form onSubmit={handleSubmitForm}>
            <FormGroup>
              <Input
                type="text"
                placeholder="Code"
                bsSize="lg"
                value={values.code}
                onChange={handleCodeChange}
                className={
                  errors && errors.fields && errors.fields.code && "is-invalid"
                }
              ></Input>
              <FieldErrors errors={errors} field="code" />
            </FormGroup>

            <FormGroup>
              <Input
                type="password"
                placeholder="New password"
                bsSize="lg"
                value={values.password}
                onChange={handlePasswordChange}
                className={
                  errors &&
                  errors.fields &&
                  errors.fields.password &&
                  "is-invalid"
                }
              ></Input>
              <FieldErrors errors={errors} field="password" />
            </FormGroup>

            <Button
              color="primary"
              size="lg"
              disabled={loading}
              className="d-flex align-items-center"
            >
              {loading && <Spinner size="sm" className="mr-2" />}
              Reset
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default inject("AccountStore")(observer(PasswordResetUpdate));
