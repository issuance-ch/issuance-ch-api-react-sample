import React, { useEffect, useMemo } from 'react';
import { inject, observer } from 'mobx-react';
import { Input, Spinner } from 'reactstrap';
import Select from './Select';

function CountriesSelect(props) {
  const { CountriesStore, optionValue = 'alpha_code2', optionLabel = 'short_name', ...formProps } = props;
  const { loading, countries } = CountriesStore;

  useEffect(() => {
    CountriesStore.loadCountries();
  }, [CountriesStore]);

  // Sort countries alphabetically by the displayed label
  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) =>
      (a[optionLabel] || '').localeCompare(b[optionLabel] || '')
    );
  }, [countries, optionLabel]);

  if (loading) {
    return (
      <Spinner color="secondary" className="d-block" />
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
    <Select
      searchable
      {...formProps}
    >
      <option value="">Select one</option>
      {
        sortedCountries.map(country =>
          <option
            key={country.id}
            value={country[optionValue]}
          >
            {country[optionLabel]}
          </option>
        )
      }
    </Select>
  );
}

export default inject('CountriesStore')(observer(CountriesSelect));
