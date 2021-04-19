import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Container, Col, Row, Button, Spinner, Form, FormGroup, Input, CustomInput, FormFeedback } from 'reactstrap';
import FormErrors from '../components/FormErrors';
import FieldErrors from '../components/FieldErrors';
import { API_ROOT } from '../config';

function Register(props) {
  const { AccountStore } = props;
  const { values, errors, loading } = AccountStore;
  const history = useHistory();
  const [termsStatus, setTermsStatus] = useState('pending');
  const termsURL = `${API_ROOT}/terms`;

  useEffect(() => {
    return () => {AccountStore.reset();}
  }, [AccountStore]);

  function handleUsernameChange(e) {AccountStore.setUsername(e.target.value);}
  function handleEmailChange(e) {AccountStore.setEmail(e.target.value);}
  function handlePasswordChange(e) {AccountStore.setPassword(e.target.value);}
  function handleSubmitForm(e) {
    e.preventDefault();

    AccountStore.register()
      .then(() => history.replace('/validate'))
      .catch(err => {})
    ;
  }

  function getTerms() {
    return (
      <>
        <iframe src={termsURL} frameBorder="0" className="terms-text" title="Terms and Conditions"></iframe>

        <FormGroup>
          <CustomInput type="checkbox" id="terms-and-conditions"
            required={true}
            label="I agree to the terms and conditions and want to proceed to my account creation. "
            checked={termsStatus === 'checked'}
            onChange={() => {setTermsStatus(termsStatus === 'checked' ? 'pending' : 'checked')}}
            invalid={termsStatus === 'failed'}
          >
            <span className="required"></span>
            {
              termsStatus === 'failed'
              &&
              <FormFeedback>You have to agree to the terms and conditions.</FormFeedback>
            }
          </CustomInput>
        </FormGroup>

        <Button color="primary" size="lg" className="d-flex align-items-center"
          onClick={() => {setTermsStatus(termsStatus === 'checked' ? 'accepted' : 'failed')}}
        >
          Create my account
        </Button>
      </>
    )
  }

  function getForm() {
    return (
      <>
        <FormErrors errors={errors} />

        <Form onSubmit={handleSubmitForm}>
          <FormGroup>
            <Input
              type="text" placeholder="Username" bsSize="lg" value={values.username} onChange={handleUsernameChange}
              className={errors && errors.fields && errors.fields.username && 'is-invalid'}
            ></Input>
            <FieldErrors errors={errors} field="username" />
          </FormGroup>

          <FormGroup>
            <Input
              type="email" placeholder="Email" bsSize="lg" value={values.email} onChange={handleEmailChange}
              className={errors && errors.fields && errors.fields.email && 'is-invalid'}
            ></Input>
            <FieldErrors errors={errors} field="email" />
          </FormGroup>

          <FormGroup>
            <Input
              type="password" placeholder="Password" bsSize="lg" value={values.password} onChange={handlePasswordChange}
              className={errors && errors.fields && errors.fields.plainPassword && 'is-invalid'}
            ></Input>
            <FieldErrors errors={errors} field="plainPassword" />
          </FormGroup>

          <Button color="primary" size="lg" disabled={loading} className="d-flex align-items-center">
            {loading && <Spinner size="sm" className="mr-2" />}
            Sign Up
          </Button>
        </Form>
      </>
    )
  }

  return (
    <Container>
      <Row>
        <Col xs="12" md={termsStatus === 'accepted' ? {size: 6, offset: 3} : {size: 12}}>
          <h1>Sign Up</h1>
          <p>
            <Link to="/login">Have an account?</Link>
          </p>

          {
          termsStatus === 'accepted'
            ? getForm()
            : getTerms()
          }
        </Col>
      </Row>
    </Container>
  );
}

export default inject('AccountStore')(observer(Register));
