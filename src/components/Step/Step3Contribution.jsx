import React from 'react';
import CollapsibleCard from '../CollapsibleCard';
import ContributionForm from '../ContributionForm';

function Step3Contribution(props) {
  const groupName = 'finalization';
  const fieldName = 'contribution';
  const componentId = groupName + '_' + fieldName;
  const { fillStatus, subscription, ico, ...otherProps } = props;
  const { header, fields } = fillStatus.groups[groupName];
  const contribution = fields[fieldName];

  return (
    <CollapsibleCard
      active={header.active}
      name={componentId}
      fields={header.active ? { contribution } : null} considerAsForm
      header="Contribution details"
      {...otherProps}
    >
      <ContributionForm
        ico={ico}
        groupName={groupName}
        fieldName={fieldName}
        fieldData={contribution}
        subscriptionId={fillStatus.subscription_id}
        subscription={subscription}
        contribution={contribution}
      />
    </CollapsibleCard>
  );
}

export default Step3Contribution;
