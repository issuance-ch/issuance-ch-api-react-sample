import React from 'react';
import CollapsibleCard from '../CollapsibleCard';
import Annex1Form from '../Annex1Form';

function Step2Annex1(props) {
  const groupName = 'annexes';
  const fieldName = 'annex1';
  const componentId = groupName + '_' + fieldName;
  const { fillStatus, ...otherProps } = props;
  const { header, fields } = fillStatus.groups[groupName];
  const annex = fields[fieldName];

  if (!header.required) {
    return null;
  }

  return (
    <CollapsibleCard
      active={annex.required}
      name={componentId}
      fields={header.active ? { annex } : null}
      considerAsForm
      header={annex.description}
      {...otherProps}
    >
      <Annex1Form
        groupName={groupName}
        fieldName={fieldName}
        fieldData={fields[fieldName]}
        subscriptionId={fillStatus.subscription_id}
        annex={annex}
      />
    </CollapsibleCard>
  );
}

export default Step2Annex1;
