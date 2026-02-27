import React, { useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Alert, FormGroup, Button, InputGroup, InputGroupAddon, InputGroupText, Spinner, Col, Row } from 'reactstrap';
import ExtraDocumentField from './ExtraDocumentField';
import { asyncSessionStorage } from '../helpers/sessionStorage';

function ExtraDocumentForm(props) {
  const { SubscriptionStore, IcoDocumentStore, groupName, subscriptionId, documentId, extraDocument } = props;
  const [ modifying, setModifying ] = useState(extraDocument.status === 'EMPTY' || extraDocument.status === null);
  const [ pdf, setPdf ] = useState(null);
  const formId = groupName +'_'+ documentId;
  const document = IcoDocumentStore.getDocument(documentId);
  const documentData = IcoDocumentStore.getData(documentId);
  const documentErrors = IcoDocumentStore.getErrors(documentId);

  useEffect(() => {
    IcoDocumentStore
      .loadDocument(documentId, { acceptCached: true })
      .then(res => {
        if (!documentData) {
          return;
        }

        asyncSessionStorage
          .getItems(subscriptionId)
          .then(sessionData => {
            Object.keys(sessionData).forEach(fieldName => {
              if (fieldName in documentData && !documentData[fieldName]) {
                IcoDocumentStore.setData(documentId, fieldName, sessionData[fieldName]);
              }
            });
          })
        ;
      })
    ;
  }, [IcoDocumentStore, documentId, subscriptionId, documentData]);

  async function b64toBlob(base64, type = 'application/octet-stream') {
    const res = await fetch(`data:${type};base64,${base64}`);

    return await res.blob();
  }

  if (IcoDocumentStore.loading) {
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
                className={`status-${extraDocument.status}`}
                onClick={() => {
                  setModifying(true);
                }}
              >
                {extraDocument.status} (click to change)
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
          onClick={() => { SubscriptionStore.patchSubscription(groupName, 'documents'); }}
          disabled={!SubscriptionStore.isStepModified(groupName, documentId)}
        >
          {
            SubscriptionStore.isStepModified(groupName, documentId)
            ? 'Submit'
            : 'No changes'
          }
        </Button>
      </>
    );
  }

  if (!document) {
    return (
      <Alert color="danger">
        Can't load document!
      </Alert>
    );
  }

  return (
    <>
      <iframe className="iframe-extra-document" title={formId +'_iframe'} srcDoc={document.html} />
      {
        document.fields.map((field, index) => {
          const fieldName = field.field_name;
          const fieldId = formId +'_'+ fieldName;

          return (
            <ExtraDocumentField key={fieldId}
              field={field}
              fieldId={fieldId}
              fieldValue={documentData[fieldName]}
              errors={documentErrors}
              handleExtraDocumentDataChange={fieldValue => {
                IcoDocumentStore.setData(documentId, fieldName, fieldValue);
              }}
            />
          );
        })
      }

      <Row className="justify-content-md-between align-items-md-center">
        <Col xs="12" md={{size: 'auto'}} className="mb-3 mb-md-0">
          <Button
            className="w-100"
            color="primary"
            onClick={() => {
              IcoDocumentStore.postExtraDocument(subscriptionId, documentId, documentData)
                .then(res => {
                  b64toBlob(res.clear_binary_content, 'application/pdf')
                    .then(blob => {
                      setPdf({
                        name: res.original_filename,
                        href: URL.createObjectURL(blob)
                      });
                    })
                  ;

                  SubscriptionStore.setModified(groupName, documentId, res.id);
                  setModifying(false);
                })
                .catch(err => {})
              ;
            }}
          >
            Submit
          </Button>
        </Col>
        <Col xs="12" md={{size: 'auto'}}>
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

export default inject('SubscriptionStore', 'IcoDocumentStore')(observer(ExtraDocumentForm));