import React, { useState, useRef, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { FormGroup, Button, InputGroup, InputGroupAddon, InputGroupText, Label, Input, Spinner, Col, Row } from 'reactstrap';
import SignaturePad from 'react-signature-pad-wrapper';
import FieldErrors from './FieldErrors';
import { asyncSessionStorage } from '../helpers/sessionStorage';
import CustomInput from 'reactstrap/lib/CustomInput';

function Annex1Form(props) {
  const { SubscriptionStore, Annex1Store, groupName, fieldName, subscriptionId, annex, fieldData } = props;
  const { loading, data, errors, signatureData } = Annex1Store;
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
    asyncSessionStorage
      .getItems(subscriptionId)
      .then(sessionData => {
        if (('firstname' in sessionData || 'lastname' in sessionData) && !data.name) {
          data.name = [sessionData.firstname, sessionData.lastname].join(' ').trim();
        }
        if ('company_name' in sessionData && !data.name) {
          data.name = sessionData.company_name;
        }
        if ('residential_address' in sessionData && !data.address) {
          data.address = sessionData.residential_address;
        }
        if ('corporate_address' in sessionData && !data.address) {
          data.address = sessionData.corporate_address;
        }
        if ('nationality' in sessionData && !data.nationality) {
          data.nationality = sessionData.nationality;
        }
        if ('date_of_birth' in sessionData && !data.date_of_birth) {
          data.date_of_birth = sessionData.date_of_birth;
        }
      })
      ;
  }, [data, subscriptionId]);


  useEffect(() => {
    const wrapper = signaturePadRef.current;

    const pad = wrapper && wrapper.signaturePad;
    if (!pad) return;

    const handleEndStroke = () => {
      const svgData = pad.toDataURL('image/svg+xml');
      const pointData = pad.toData();
      Annex1Store.setData('sign', svgData);
      Annex1Store.setSignatureData(pointData);

    };

    pad.addEventListener('endStroke', handleEndStroke);

    return () => {
      pad.removeEventListener('endStroke', handleEndStroke);
    };
  }, [Annex1Store]);


  async function b64toBlob(base64, type = 'application/octet-stream') {
    const res = await fetch(`data:${type};base64,${base64}`);

    return await res.blob();
  }

  if (loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!modifying && SubscriptionStore.isStepModified(groupName, fieldName)) {
    // Simplified annex1 can't be read by the customer as they are generated afterward. Automatically attach file to subscription...
    SubscriptionStore.patchSubscription(groupName);
  }
  else if (!modifying) {
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
          No changes
        </Button>
      </>
    );
  }

  return (
    <>
      <div>
        <p>The undersigned counterparty declares</p>
        <p>
          <CustomInput type="checkbox" id={'iHaveNoMrz'}
            required={true}
            readonly={true}
            className="required"
            label=" being the only beneficial owner of the assets subject to the contractual relationship with ALTCOINOMY SA;"
            checked={true}
            invalid={false}
          >
          </CustomInput>
        </p>
        <p>
          <strong>
            The counterparty undertakes to inform Altcoinomy SA without undue delay about any modification relating to the
            beneficial owner of the assets subject to the contractual relationship.
            The counterparty acknowledges that it is a criminal offence to deliberately provide false information on this form
            (article 251 of the Swiss Criminal Code, document forgery).
          </strong>
        </p>
      </div>
      <FormGroup>
        <Label className="required" for={formId + '_place'}>Current Location</Label>
        <Input type="text" id={formId + '_place'}
          required
          value={data['place']}
          invalid={Annex1Store.hasError('place')}
          onChange={ev => { Annex1Store.setData('place', ev.target.value); }}
        />
        <FieldErrors errors={errors} field="place" />
      </FormGroup>

      <FormGroup>
        <Label className="required">Signature of the counterparty</Label>
        <div className={'wrapper-signature-pad' + (Annex1Store.hasError('sign') ? ' is-invalid' : '')}>
          <SignaturePad
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
                Annex1Store.setSignatureData(null);
                Annex1Store.setData('sign', '');
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
              Annex1Store.postAnnex1(subscriptionId)
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

export default inject('SubscriptionStore', 'Annex1Store')(observer(Annex1Form));
