import React, { useEffect, useRef } from 'react';
import { inject, observer } from 'mobx-react';
import { FormGroup, Label, Input, CustomInput, Button, Row, Col } from 'reactstrap';
import SignaturePad from 'react-signature-pad-wrapper';
import FieldErrors from './FieldErrors';
import DatePicker from './DatePicker';
import CountriesSelect from './CountriesSelect';

function ExtraDocumentField(props) {
  const { IcoDocumentStore, field, fieldId, fieldValue, errors, handleExtraDocumentDataChange } = props;
  const signaturePadRef = useRef(null);
  const signatureData = IcoDocumentStore.getSignature(fieldId);

  useEffect(() => {
    if (signatureData) {
      signaturePadRef.current.fromData(signatureData);
    } else if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  }, [signatureData]);

  useEffect(() => {
    const wrapper = signaturePadRef.current;

    const pad = wrapper && wrapper.signaturePad;
    if (!pad) return;

    const handleEndStroke = () => {
      const svgData = pad.toDataURL('image/svg+xml');
      const pointData = pad.toData();


      IcoDocumentStore.setSignature(fieldId, pointData);
      handleExtraDocumentDataChange(svgData);

    };

    pad.addEventListener('endStroke', handleEndStroke);

    return () => {
      pad.removeEventListener('endStroke', handleEndStroke);
    };
  }, [IcoDocumentStore]);

  function handleChangeCheckbox(ev) {
    const value = ev.target.checked;

    handleExtraDocumentDataChange(value);
  }

  function handleChangeDefault(ev) {
    const value = ev.target.value;

    handleExtraDocumentDataChange(value);
  }

  function getLabel() {
    return <Label for={fieldId} className={field.required ? 'required' : ''}>{field.field_label}</Label>;
  }

  if (field.field_privacy !== 'PRIVACY_PUBLIC') {
    return null;
  }

  if (field.field_type === 'FIELD_TYPE_CHECKBOX') {
    return (
      <FormGroup>
        <CustomInput type="checkbox" id={fieldId}
          required={field.required}
          label={field.field_label}
          checked={fieldValue}
          onChange={handleChangeCheckbox}
          invalid={errors && errors.fields && errors.fields[field.field_name] ? true : false}
        >
          {
            field.required &&
            <span className="required"></span>
          }
          <FieldErrors errors={errors} field={field.field_name} />
        </CustomInput>
      </FormGroup>
    );
  }

  if (field.field_type === 'FIELD_TYPE_SIGNATURE') {
    return (
      <FormGroup>
        {getLabel()}
        <div className={'wrapper-signature-pad' + (errors && errors.fields && errors.fields[field.field_name] ? ' is-invalid' : '')}>
          <SignaturePad
            ref={signaturePadRef}
            height={350}
          />
        </div>

        <Row className="justify-content-md-between align-items-md-center">
          <Col xs="12" md={{ size: 'auto' }}>
            <FieldErrors errors={errors} field={field.field_name} />
          </Col>
          <Col xs="12" md={{ size: 'auto' }}>
            <Button
              className="w-100"
              color="warning"
              onClick={() => {
                IcoDocumentStore.resetSignature(fieldId);
                handleExtraDocumentDataChange('');
              }}
            >
              Clear
            </Button>
          </Col>
        </Row>
      </FormGroup>
    );
  }

  if (field.field_type === 'FIELD_TYPE_DOB') {
    return (
      <FormGroup>
        {getLabel()}
        <DatePicker
          id={fieldId}
          date={fieldValue}
          invalid={errors && errors.fields && errors.fields[field.field_name] ? true : false}
          onChange={date => { handleExtraDocumentDataChange(date); }}
          tillToday
        />
        <FieldErrors errors={errors} field={field.field_name} />
      </FormGroup>
    );
  }

  if (field.field_type === 'FIELD_TYPE_COUNTRY' || field.field_type === 'FIELD_TYPE_STATE_OF_INCORPORATION') {
    return (
      <FormGroup>
        {getLabel()}
        <CountriesSelect
          id={fieldId}
          value={fieldValue}
          optionValue="short_name"
          optionLabel="short_name"
          invalid={errors && errors.fields && errors.fields[field.field_name] ? true : false}
          onChange={handleChangeDefault}
        />
        <FieldErrors errors={errors} field={field.field_name} />
      </FormGroup>
    );
  }

  return (
    <FormGroup>
      {getLabel()}
      <Input type="text" id={fieldId}
        required={field.required}
        value={fieldValue}
        onChange={handleChangeDefault}
        invalid={errors && errors.fields && errors.fields[field.field_name] ? true : false}
      />
      <FieldErrors errors={errors} field={field.field_name} />
    </FormGroup>
  );
}

export default inject('IcoDocumentStore')(observer(ExtraDocumentField));
