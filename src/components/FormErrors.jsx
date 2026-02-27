import React from 'react';
import { Alert } from 'reactstrap';

function FormErrors(props) {
  const errors = props.errors && props.errors.form;

  if (errors) {
    if (typeof errors === 'string') {
      return (
        <Alert color="danger">{errors}</Alert>
      );
    }

    return (
      Object.keys(errors).map(key => {
        return (
          <Alert color="danger" key={key}>
            {key} {errors[key]}
          </Alert>
        );
      })
    );
  }

  return null;
}

export default FormErrors;
