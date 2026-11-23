/**
 * "source_of_funds" group of the fill status: the source of funds questionnaire that some projects
 * ask above a contributed amount (primary source of the funds, origin of the tokens, supporting
 * documentation). The group only exists in the fill status when the project asks for it.
 */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from 'reactstrap';
import CollapsibleCard from '../CollapsibleCard';
import StepField from '../StepField';

/**
 * Card of the source of funds questionnaire.
 *
 * @param {object} props
 * @returns {JSX.Element|null}
 */
function Step4SourceOfFunds(props) {
  const groupName = 'source_of_funds';
  const { SubscriptionStore, fillStatus, ...otherProps } = props;
  const group = fillStatus.groups[groupName];

  if (!group || !group.header.required) {
    return null;
  }

  const { header, fields } = group;

  return (
    <CollapsibleCard
      active={header.active}
      name={groupName}
      fields={header.active ? fields : null}
      header="Source of funds"
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

export default inject('SubscriptionStore')(observer(Step4SourceOfFunds));
