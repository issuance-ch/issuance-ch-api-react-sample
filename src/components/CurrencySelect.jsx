import React from 'react';
import { CustomInput } from 'reactstrap';

function CurrencySelect(props) {
  const { fiat, crypto, ...formProps } = props;

  return (
    <CustomInput
      type="select"
      {...formProps}
    >
      <option value="">Select one</option>
      {fiat.length > 0 && <optgroup label="Fiat currencies">
        {fiat.map(currentCurrency => {
          return <option value={currentCurrency.currency.code} key={currentCurrency.currency.id}>{currentCurrency.currency.code}</option>
        })}
      </optgroup>}
      {crypto.length > 0 && <optgroup label="Crypto currencies">
        {crypto.map(currentCurrency => {
          return <option value={currentCurrency.currency.code} key={currentCurrency.currency.id}>{currentCurrency.currency.code}</option>
        })}
      </optgroup>}
      {/* {
        Object.keys(tiers).map(id =>
          <option
            key={tiers[id].id}
            value={tiers[id].name}
          >
            {tiers[id].name} - From {tiers[id].amounts.from.amount} {tiers[id].amounts.from.currency.code} to {tiers[id].amounts.to.amount} {tiers[id].amounts.to.currency.code}
          </option>
        )
      } */}
    </CustomInput>
  );
}

export default CurrencySelect;
