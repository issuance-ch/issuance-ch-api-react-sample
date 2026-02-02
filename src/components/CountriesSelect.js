import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Input, CustomInput, Spinner } from 'reactstrap';

function CountriesSelect(props) {
  const { CountriesStore, optionValue = 'alpha_code2', optionLabel = 'short_name', ...formProps } = props;
  const { loading, countries } = CountriesStore;

  useEffect(() => {
    CountriesStore.loadCountries();
  }, [CountriesStore]);

  if (loading) {
    return (
      <Spinner color="secondary" className="d-block"/>
    );
  }

  if (!countries.length) {
    return (
      <Input
        type="text"
        {...formProps}
      />
    );
  }

  return (
    <CustomInput
      type="select"
      {...formProps}
    >
      <option value="">Select one</option>
      {
        [...countries].sort((a, b) => (a[optionLabel] || '').localeCompare(b[optionLabel] || '')).map(country =>
          <option
            key={country.id}
            value={country[optionValue]}
          >
            {country[optionLabel]}
          </option>
        )
      }
    </CustomInput>
  );
}

export default inject('CountriesStore')(observer(CountriesSelect));
