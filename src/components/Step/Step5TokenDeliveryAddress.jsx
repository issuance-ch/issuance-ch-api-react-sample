import React from 'react';
import { inject, observer } from 'mobx-react';
import { Alert, Button } from 'reactstrap';
import CollapsibleCard from '../CollapsibleCard';
import StepField from '../StepField';

function Step5TokenDeliveryAddress(props) {
  const groupName = 'finalization';
  const fieldName = 'token_delivery_address';
  const componentId = groupName + '_' + fieldName;
  const { SubscriptionStore, fillStatus, subscription, ico, identificationAfterPayment, isPaymentConfirmed, ...otherProps } = props;
  const { header, fields } = fillStatus.groups[groupName];
  const tokendeliveryaddress = fields[fieldName];

  if (tokendeliveryaddress.hidden) {
    return null;
  }

  return (
    <CollapsibleCard
      active={header.active}
      name={componentId}
      fields={header.active ? { tokendeliveryaddress } : null}
      header="Token delivery address"
      {...otherProps}
    >
      {identificationAfterPayment && !isPaymentConfirmed ? (
        <Alert color="info">
          You will be able to continue the process once our team has confirmed the reception of your payments, this may take a few days.
        </Alert>
      ) : (
      <>
        <StepField
          groupName={groupName}
          fieldName={fieldName}
          fieldData={tokendeliveryaddress}
        />

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
      </>
      )}
    </CollapsibleCard>
  );
}

export default inject('SubscriptionStore')(observer(Step5TokenDeliveryAddress));
