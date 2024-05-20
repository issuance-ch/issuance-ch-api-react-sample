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

function PasswordResetRequest(props) {
  const { AccountStore } = props;
  const { values, errors, loading } = AccountStore;
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      AccountStore.reset();
    };
  }, [AccountStore]);

  function handleEmailChange(e) {
    AccountStore.setEmail(e.target.value);
  }
  function handleSubmitForm(e) {
    e.preventDefault();

    AccountStore.passwordResetRequest()
      .then(() => navigate("/password-reset/update", { replace: true }))
      .catch((err) => {});
  }

  return (
    <Container className="password-reset-container">
      <Row>
        <Col xs="12" md={{ size: 6, offset: 3 }}>
          <h1>Request a password reset code</h1>
          <p>
            <Link to="/password-reset/update">Already have a code</Link>
          </p>

          <FormErrors errors={errors} />

          <Form onSubmit={handleSubmitForm}>
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

            <Button
              color="primary"
              size="lg"
              disabled={loading}
              className="d-flex align-items-center"
            >
              {loading && <Spinner size="sm" className="mr-2" />}
              Request
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default inject("AccountStore")(observer(PasswordResetRequest));
