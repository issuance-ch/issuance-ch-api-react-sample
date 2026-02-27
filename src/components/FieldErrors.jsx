import React from 'react';
import { FormFeedback } from 'reactstrap';

function FieldErrors(props) {
  const errors = findError();

  /**
   * Overrides messages coming from the API.
   */
  const MSG_OVERRIDE = {
    "Please confirm that your id document has no MRZ before to attach this document to the project": "Your ID was not properly recognized. Please check the box hereafter to proceed to a manual verification (longer process)."
  }

  function findError() {
    const path = Array.isArray(props.field) ? props.field : [props.field];
    const errorFields = props.errors && props.errors.fields;
    if (!errorFields) {
      return null;
    }

    let errors = path.reduce((prev, curr) => {
      if (null === prev || typeof prev !== 'object') {
        return null;
      }

      return curr in prev ? prev[curr] : null;
    }, errorFields);

    return errors;
  }

  if (errors) {
    if (typeof errors === 'string') {
      return (
        <FormFeedback>{errors}</FormFeedback>
      );
    }

    if (Array.isArray(errors)) {
      return errors.map((error, index) => {
        let errMsg = error && error.msg ? error.msg : error;
        errMsg = MSG_OVERRIDE[errMsg] ? MSG_OVERRIDE[errMsg] : errMsg;
        return (
          <FormFeedback key={index}>{errMsg}</FormFeedback>
        );
      });
    }
  }

  return null;
}

export default FieldErrors;
