import React from 'react';
import { Alert } from 'reactstrap';

function GlobalErrors(props) {
  const fieldsErrors = props.errors && props.errors.fields;

  const SHOW_UNIQUE_MESSAGE = false;

  if (fieldsErrors) {

    if (SHOW_UNIQUE_MESSAGE) {
      return <Alert color="danger">There are some errors in your subscription. Please fix them before to submit again.</Alert>
    }
    if (typeof fieldsErrors === 'string') {
      return (
        <Alert color="danger">{fieldsErrors}</Alert>
      );
    }


    return (
      Object.keys(fieldsErrors).map(key => {
        return Object.keys(fieldsErrors[key]).map(arrayKey => {
          return (
            <Alert color="danger" key={key}>
              <strong>{fieldsErrors[key][arrayKey].field.description}:</strong>{" "}
              {fieldsErrors[key][arrayKey].msg}
            </Alert>
          );
        })
        // return (
        //   <Alert color="danger" key={key}>
        //     {key} {fieldsErrors[key]}
        //   </Alert>
        // );
      })
    );
  }

  return null;
}

export default GlobalErrors;
