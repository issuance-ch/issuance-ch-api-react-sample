import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from 'reactstrap';
import CollapsibleCard from '../CollapsibleCard';
import StepField from '../StepField';

function Step4Crypto(props) {
  const groupName = 'crypto_tracing';
  const { SubscriptionStore, fillStatus, ...otherProps } = props;
  const { header, fields } = fillStatus.groups[groupName];

  if (!header.required) {
    return null;
  }

  return (
    <CollapsibleCard
      active={header.active}
      name={groupName}
      fields={header.active ? fields : null}
      header="Crypto corroboration"
      {...otherProps}
    >
      {
        Object.keys(fields).map(fieldName => {
          return (
            <StepField key={fieldName}
              groupName={groupName}
              fieldName={fieldName}
              fieldData={fields[fieldName]}
            />
          );
        })
      }

      <Button color="primary"
        onClick={() => { SubscriptionStore.patchSubscription(groupName); }}
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

export default inject('SubscriptionStore')(observer(Step4Crypto));
