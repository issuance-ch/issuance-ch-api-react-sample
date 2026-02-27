import React from 'react';
import { inject, observer } from 'mobx-react';
import { Alert, Button } from 'reactstrap';
import CollapsibleCard from '../CollapsibleCard';
import StepField from '../StepField';
import { asyncSessionStorage } from '../../helpers/sessionStorage';

/** @constant {string[]} Corporate by-law document field names */
const CORPORATE_DOCUMENTS = [
  'article_of_association',
  'certificate_of_good_standing',
  'reliable_directory_proof',
  'swiss_trade_register_document',
  'authorized_signatories_document',
];

/**
 * Step2Company - Company personal details form.
 *
 * Displays the "State of Incorporation" (nationality) field first.
 * Other fields are only revealed once the incorporation country is selected.
 * Documents are split into two groups: corporate documents vs alternative documents.
 */
function Step2Company(props) {
  const groupName = 'company';
  const { SubscriptionStore, fillStatus, subscription, ...otherProps } = props;
  const { header, fields } = fillStatus.groups[groupName];

  if (!header.required) {
    return null;
  }

  // Use the server-confirmed status (not mutated by local changes)
  const isNationalityFilled = !!(fields.nationality && fields.nationality.status && fields.nationality.status !== 'EMPTY');

  // Categorize fields
  const fieldNames = Object.keys(fields);
  const basicFields = fieldNames.filter(
    name => name !== 'nationality'
      && !CORPORATE_DOCUMENTS.includes(name)
      && !name.startsWith('other_document')
  );
  const corporateDocFields = fieldNames.filter(name => CORPORATE_DOCUMENTS.includes(name));
  const otherDocFields = fieldNames.filter(name => name.startsWith('other_document'));

  return (
    <CollapsibleCard
      active={header.active}
      subscription={subscription}
      name={groupName}
      fields={header.active ? fields : null}
      header="Personal details"
      {...otherProps}
    >
      {/* State of Incorporation - always displayed first */}
      {fields.nationality && (
        <StepField
          key="nationality"
          groupName={groupName}
          fieldName="nationality"
          fieldData={fields.nationality}
          subscription={subscription}
        />
      )}

      {isNationalityFilled && (
        <>
          {/* Basic company fields */}
          {basicFields.map(fieldName => (
            <StepField
              key={fieldName}
              groupName={groupName}
              fieldName={fieldName}
              fieldData={fields[fieldName]}
              subscription={subscription}
            />
          ))}

          {/* Documents section */}
          {(corporateDocFields.length > 0 || otherDocFields.length > 0) && (
            <Alert color="info" className="mt-3 mb-3">
              Please provide either the <strong>corporate documents</strong> below
              or <strong>alternative documents</strong> at the bottom of this section.
            </Alert>
          )}

          {/* Corporate documents */}
          {corporateDocFields.length > 0 && (
            <>
              <h5 className="mt-4 mb-3 pb-2 border-bottom">Corporate documents</h5>
              {corporateDocFields.map(fieldName => (
                <StepField
                  key={fieldName}
                  groupName={groupName}
                  fieldName={fieldName}
                  fieldData={fields[fieldName]}
                  subscription={subscription}
                />
              ))}
            </>
          )}

          {/* Alternative documents */}
          {otherDocFields.length > 0 && (
            <>
              <h5 className="mt-4 mb-3 pb-2 border-bottom">Alternative documents</h5>
              {otherDocFields.map(fieldName => (
                <StepField
                  key={fieldName}
                  groupName={groupName}
                  fieldName={fieldName}
                  fieldData={fields[fieldName]}
                  subscription={subscription}
                />
              ))}
            </>
          )}
        </>
      )}

      <Button color="primary"
        onClick={() => {
          const modifiedFields = {};

          Object.keys(SubscriptionStore.modified[groupName])
            .forEach(modifiedFieldName => {
              if (modifiedFieldName in fields && fields[modifiedFieldName].type !== 'id')
                modifiedFields[modifiedFieldName] = SubscriptionStore.modified[groupName][modifiedFieldName].value;
            })
            ;

          SubscriptionStore.patchSubscription(groupName)
            .then(() => {
              Object.keys(modifiedFields)
                .forEach(modifiedFieldName => {
                  asyncSessionStorage.setItem(fillStatus.subscription_id, modifiedFieldName, modifiedFields[modifiedFieldName]);
                })
                ;
            })
            ;
        }}
        disabled={!SubscriptionStore.isStepModified(groupName)}
      >
        {
          SubscriptionStore.isStepModified(groupName)
            ? 'Submit'
            : 'No changes'
        }
      </Button>
    </CollapsibleCard>
  );
}

export default inject('SubscriptionStore')(observer(Step2Company));
