import React from 'react';
import CollapsibleCard from '../CollapsibleCard';
import Annex2Form from '../Annex2Form';

function Step2Annex2(props) {
  const groupName = 'annexes';
  const fieldName = 'annex2';
  const componentId = groupName + '_' + fieldName;
  const { fillStatus, ...otherProps } = props;
  const { header, fields } = fillStatus.groups[groupName];
  const annex = fields[fieldName];

  if (!header.required) {
    return null;
  }

  if (!annex.required) {
    return null;
  }

  return (
    <CollapsibleCard
      active={header.active}
      name={componentId}
      fields={header.active ? { annex } : null} considerAsForm
      header={annex.description}
      {...otherProps}
    >
      <Annex2Form
        groupName={groupName}
        fieldName={fieldName}
        fieldData={fields[fieldName]}
        subscriptionId={fillStatus.subscription_id}
        annex={annex}
      />
    </CollapsibleCard>
  );
}

export default Step2Annex2;
