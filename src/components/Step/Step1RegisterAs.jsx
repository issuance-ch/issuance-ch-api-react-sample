import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from 'reactstrap';
import CollapsibleCard from '../CollapsibleCard';
import StepField from '../StepField';

function Step1RegisterAs(props) {
  const groupName = 'basics';
  const { SubscriptionStore, fillStatus, ...otherProps } = props;
  const { header, fields } = fillStatus.groups[groupName];
  const processFields = ['subscribed_as'];

  return (
    <CollapsibleCard
      active={header.active}
      name={groupName}
      header="Main details"
      {...otherProps}
    >
      {
        Object.keys(fields).map(fieldName => {
          if (!processFields.includes(fieldName)) {
            return null;
          }

          return (
            <StepField
              key={fieldName}
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

export default inject('SubscriptionStore')(observer(Step1RegisterAs));
