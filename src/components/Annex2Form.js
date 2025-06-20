import React, { useState, useRef, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { FormGroup, Button, InputGroup, InputGroupAddon, InputGroupText, Label, Input, Spinner, Col, Row } from 'reactstrap';
import SignaturePad from 'react-signature-pad-wrapper';
import FieldErrors from './FieldErrors';
import DatePicker from './DatePicker';
import CountriesSelect from './CountriesSelect';
import { asyncSessionStorage } from '../helpers/sessionStorage';

function Annex2Form(props) {
  const { SubscriptionStore, Annex2Store, groupName, fieldName, subscriptionId, annex, fieldData } = props;
  const { loading, data, errors, signatureData } = Annex2Store;
  const formId = groupName + '_' + fieldName;
  const [modifying, setModifying] = useState(fieldData.status === 'EMPTY');
  const [pdf, setPdf] = useState(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    if (signaturePadRef.current) {
      if (signatureData) {
        signaturePadRef.current.fromData(signatureData);
      } else {
        signaturePadRef.current.clear();
      }
    }
  }, [signatureData]);

  useEffect(() => {
    const wrapper = signaturePadRef.current;

    const pad = wrapper && wrapper.signaturePad;
    if (!pad) return;

    const handleEndStroke = () => {
      const svgData = pad.toDataURL('image/svg+xml');
      const pointData = pad.toData();
      Annex2Store.setData('sign', svgData);
      Annex2Store.setSignatureData(pointData);

    };

    pad.addEventListener('endStroke', handleEndStroke);

    return () => {
      pad.removeEventListener('endStroke', handleEndStroke);
    };
  }, [Annex2Store]);

  useEffect(() => {
    asyncSessionStorage
      .getItems(subscriptionId)
      .then(sessionData => {
        if ('company_name' in sessionData && !data.corporate_name) {
          data.corporate_name = sessionData.company_name;
        }

        if ('company_name' in sessionData && !data.people[0].name) {
          data.people[0].name = sessionData.company_name;
        }
        if ('corporate_address' in sessionData && !data.people[0].address) {
          data.people[0].address = sessionData.corporate_address;
        }
        if ('nationality' in sessionData && !data.people[0].nationality) {
          data.people[0].nationality = sessionData.nationality;
        }
      })
      ;
  }, [data, subscriptionId]);

  async function b64toBlob(base64, type = 'application/octet-stream') {
    const res = await fetch(`data:${type};base64,${base64}`);

    return await res.blob();
  }

  if (loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!modifying) {
    return (
      <>
        <FormGroup>
          <InputGroup className="crypted">
            <InputGroupAddon addonType="prepend">
              <InputGroupText
                className={`status-${annex.status}`}
                onClick={() => {
                  setModifying(true);
                }}
              >
                {annex.status} (click to change)
              </InputGroupText>
            </InputGroupAddon>

            {
              pdf &&
              <>
                <InputGroupAddon addonType="append">
                  <InputGroupText>
                    <a href={pdf.href} download={pdf.name}>Download</a>
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupAddon addonType="append">
                  <InputGroupText>
                    <a href={pdf.href} rel="noopener noreferrer" target="_blank">Open</a>
                  </InputGroupText>
                </InputGroupAddon>
              </>
            }
          </InputGroup>
        </FormGroup>

        <Button
          color="primary"
          onClick={() => { SubscriptionStore.patchSubscription(groupName); }}
          disabled={!SubscriptionStore.isStepModified(groupName, fieldName)}
        >
          {
            SubscriptionStore.isStepModified(groupName, fieldName)
              ? 'I confirm that I\'ve read the generated document'
              : 'No changes'
          }
        </Button>
      </>
    );
  }

  return (
    <>
      <FormGroup>
        <Label className="required" for={formId + '_corporate_name'}>Corporate name of the contracting party</Label>
        <Input type="text" id={formId + '_corporate_name'}
          required
          value={data['corporate_name']}
          invalid={Annex2Store.hasError('corporate_name')}
          onChange={ev => { Annex2Store.setData('corporate_name', ev.target.value); }}
        />
        <FieldErrors errors={errors} field="corporate_name" />
      </FormGroup>

      <h4>Please repeat the following for each beneficial</h4>
      {
        data.people.map((personData, index) => {
          return (
            <React.Fragment key={formId + '_people_' + index}>
              <Row className="justify-content-md-between align-items-md-center">
                <Col xs="12" md={{ size: 'auto' }}>
                  <h5>Party <small>{index + 1}</small></h5>
                </Col>
                <Col xs="12" md={{ size: 'auto' }}>
                  <Button
                    className="w-100"
                    color="warning"
                    disabled={data.people.length <= 1}
                    onClick={() => { Annex2Store.removePerson(index); }}
                  >
                    Remove current
                  </Button>
                </Col>
              </Row>

              <FormGroup>
                <Label className="required" for={formId + '_people_' + index + '_name'}>Company Name / Individual Name</Label>
                <Input type="text" id={formId + '_people_' + index + '_name'}
                  required
                  value={personData['name']}
                  invalid={Annex2Store.hasError(['people', index, 'name'])}
                  onChange={ev => { Annex2Store.setPersonData(index, 'name', ev.target.value); }}
                />
                <FieldErrors errors={errors} field={['people', index, 'name']} />
              </FormGroup>

              <FormGroup>
                <Label className="required" for={formId + '_people_' + index + '_date_of_birth'}>Date of Incorporation / Date of Birth</Label>
                <DatePicker
                  id={formId + '_people_' + index + '_date_of_birth'}
                  date={personData['date_of_birth']}
                  invalid={Annex2Store.hasError(['people', index, 'date_of_birth'])}
                  onChange={date => { Annex2Store.setPersonData(index, 'date_of_birth', date); }}
                  tillToday
                />
                <FieldErrors errors={errors} field={['people', index, 'date_of_birth']} />
              </FormGroup>

              <FormGroup>
                <Label className="required" for={formId + '_people_' + index + '_address'}>Address</Label>
                <Input type="text" id={formId + '_people_' + index + '_address'}
                  required
                  value={personData['address']}
                  invalid={Annex2Store.hasError(['people', index, 'address'])}
                  onChange={ev => { Annex2Store.setPersonData(index, 'address', ev.target.value); }}
                />
                <FieldErrors errors={errors} field={['people', index, 'address']} />
              </FormGroup>

              <FormGroup>
                <Label className="required" for={formId + '_people_' + index + '_nationality'}>State of Incorporation / Nationality</Label>
                <CountriesSelect
                  id={formId + '_people_' + index + '_nationality'}
                  value={personData['nationality']}
                  optionValue="alpha_code2"
                  optionLabel="nationality"
                  invalid={Annex2Store.hasError(['people', index, 'nationality'])}
                  onChange={ev => { Annex2Store.setPersonData(index, 'nationality', ev.target.value); }}
                />
                <FieldErrors errors={errors} field={['people', index, 'nationality']} />
              </FormGroup>
            </React.Fragment>
          );
        })
      }

      <Row className="justify-content-md-between align-items-md-center mb-3">
        <Col xs="12" md={{ size: 'auto' }} className="mb-3 mb-md-0">
          <Button
            className="w-100"
            color="info"
            onClick={() => {
              const length = Annex2Store.addPerson();

              asyncSessionStorage
                .getItems(subscriptionId)
                .then(sessionData => {
                  if ('company_name' in sessionData && !data.people[length - 1].name) {
                    data.people[length - 1].name = sessionData.company_name;
                  }
                  if ('corporate_address' in sessionData && !data.people[length - 1].address) {
                    data.people[length - 1].address = sessionData.corporate_address;
                  }
                  if ('nationality' in sessionData && !data.people[length - 1].nationality) {
                    data.people[length - 1].nationality = sessionData.nationality;
                  }
                })
                ;
            }}
          >
            Add another
          </Button>
        </Col>
        <Col xs="12" md={{ size: 'auto' }}>
          <Button
            className="w-100"
            color="warning"
            disabled={data.people.length <= 1}
            onClick={() => { Annex2Store.removePerson(); }}
          >
            Remove last
          </Button>
        </Col>
      </Row>

      <FormGroup>
        <Label className="required" for={formId + '_place'}>Place</Label>
        <Input type="text" id={formId + '_place'}
          required
          value={data['place']}
          invalid={Annex2Store.hasError('place')}
          onChange={ev => { Annex2Store.setData('place', ev.target.value); }}
        />
        <FieldErrors errors={errors} field="place" />
      </FormGroup>

      <FormGroup>
        <Label className="required">Signature of the counterparty</Label>
        <div className={'wrapper-signature-pad' + (Annex2Store.hasError('sign') ? ' is-invalid' : '')}>
          <SignaturePad
            options={{
              onEnd: () => {
                const dataIRL = signaturePadRef.current.toDataURL('image/svg+xml'); // goes to server
                const data = signaturePadRef.current.toData(); // to store sign between component updates

                Annex2Store.setData('sign', dataIRL);
                Annex2Store.setSignatureData(data);
              }
            }}
            ref={signaturePadRef}
            height={350}
          />
        </div>

        <Row className="justify-content-md-between align-items-md-center">
          <Col xs="12" md={{ size: 'auto' }}>
            <FieldErrors errors={errors} field="sign" />
          </Col>
          <Col xs="12" md={{ size: 'auto' }}>
            <Button
              className="w-100"
              color="warning"
              onClick={() => {
                Annex2Store.setSignatureData(null);
                Annex2Store.setData('sign', '');
              }}
            >
              Clear
            </Button>
          </Col>
        </Row>
      </FormGroup>

      <Row className="justify-content-md-between align-items-md-center">
        <Col xs="12" md={{ size: 'auto' }} className="mb-3 mb-md-0">
          <Button
            className="w-100"
            color="primary"
            onClick={() => {
              Annex2Store.postAnnex2(subscriptionId)
                .then(res => {
                  b64toBlob(res.clear_binary_content, 'application/pdf')
                    .then(blob => {
                      setPdf({
                        name: res.original_filename,
                        href: URL.createObjectURL(blob)
                      });
                    })
                    ;

                  SubscriptionStore.setModified(groupName, fieldName, res.id);
                  setModifying(false);
                })
                .catch(err => { })
                ;
            }}
          >
            Submit
          </Button>
        </Col>
        <Col xs="12" md={{ size: 'auto' }}>
          <Button
            className="w-100"
            color="secondary"
            onClick={() => { setModifying(false); }}
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </>
  );
}

export default inject('SubscriptionStore', 'Annex2Store')(observer(Annex2Form));
