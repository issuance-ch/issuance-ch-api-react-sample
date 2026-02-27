import React from 'react';
import { CustomInput } from 'reactstrap';

function TiersSelect(props) {
  const { tiers, ...formProps } = props;

  return (
    <CustomInput
      type="select"
      {...formProps}
    >
      <option value="">Select one</option>
      {
        Object.keys(tiers).map(id =>
          <option
            key={tiers[id].id}
            value={tiers[id].name}
          >
            {tiers[id].name} - From {tiers[id].amounts.from.amount} {tiers[id].amounts.from.currency.code} to {tiers[id].amounts.to.amount} {tiers[id].amounts.to.currency.code}
          </option>
        )
      }
    </CustomInput>
  );
}

export default TiersSelect;
