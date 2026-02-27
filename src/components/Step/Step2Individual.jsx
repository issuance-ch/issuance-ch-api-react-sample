import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from 'reactstrap';
import CollapsibleCard from '../CollapsibleCard';
import StepField from '../StepField';
import { asyncSessionStorage } from '../../helpers/sessionStorage';

function Step2Individual(props) {
  const groupName = 'individual';
  const { SubscriptionStore, fillStatus, subscription, ...otherProps } = props;
  const { header, fields } = fillStatus.groups[groupName];

  if (!header.required) {
    return null;
  }

  return (
    <CollapsibleCard
      active={header.active}
      name={groupName}
      fields={header.active ? fields : null}
      header="Personal details"
      {...otherProps}
    >
      {
        Object.keys(fields).map(fieldName => {
          return (
            <StepField key={fieldName}
              groupName={groupName}
              fieldName={fieldName}
              fieldData={fields[fieldName]}
              subscription={subscription}
            />
          );
        })
      }

      <Button
        color="primary"
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

export default inject('SubscriptionStore')(observer(Step2Individual));
