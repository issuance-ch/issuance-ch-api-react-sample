import React, { useState } from 'react';
import { Alert, Button, Spinner, Table, Form, FormGroup, CustomInput } from 'reactstrap';
import moment from 'moment';
import IcoLogo from '../IcoLogo';

function SubscriptionNewWrapper(props) {
  const { icos, loadingIco, loadingSubscription, participate } = props;
  const [registerAs, setRegisterAs] = useState('individual');

  function handleRegisterAsChange(e) {setRegisterAs(e.target.value);}

  if (loadingIco) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!icos.length) {
    return (
      <Alert color="warning">
        There is no ICOs, yet!
      </Alert>
    );
  }

  return (
    <>
      <Form inline className="mb-3">
        <h3 className="mr-3">I want to register as:</h3>
        <FormGroup>
          <CustomInput type="radio" id="registerAsIndividual" name="registerAs" label="An individual" value="individual" checked={registerAs === 'individual'} onChange={handleRegisterAsChange} className="mr-3" />
          <CustomInput type="radio" id="registerAsCompany" name="registerAs" label="A company" value="company" checked={registerAs === 'company'} onChange={handleRegisterAsChange} />
        </FormGroup>
      </Form>

      <Table>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Name</th>
            <th>Description</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {
            icos.map(ico => {
              const now = moment();
              const dateTo = moment(ico.date_to);
              const isExpired = dateTo < now;

              return (
                <tr key={ico.id}>
                  <td>
                    <IcoLogo icoId={ico.id} />
                  </td>
                  <td>{ico.name}</td>
                  <td>{ico.description}</td>
                  <td>
                    {
                      !isExpired &&
                      <Button color="primary" disabled={loadingSubscription} onClick={() => {participate(ico, registerAs)}} className="d-flex align-items-center ml-auto">
                        {loadingSubscription && <Spinner size="sm" className="mr-2" />}
                        Participate
                      </Button>
                    }
                    {
                      isExpired &&
                      <Button color="secondary" disabled={true} className="d-flex ml-auto">
                        Completed {dateTo.from(now)}
                      </Button>
                    }
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    </>
  );
}

export default SubscriptionNewWrapper;
