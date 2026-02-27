import React from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { format, parseISO } from 'date-fns';
import enGB from 'date-fns/locale/en-GB';

import 'react-datepicker/dist/react-datepicker.css';

registerLocale('en-GB', enGB);

function DatePicker(props) {
  const { id, className, dateFormat, date, invalid, onChange, fromToday, tillToday, required } = props;
  const dateFormatDefault = 'yyyy-MM-dd';
  const invalidClassName = ' is-invalid';
  const limit = {};

  let classNameNew = className || 'form-control';

  if (invalid) {
    classNameNew += invalidClassName;
  }

  if (fromToday) {
    limit.minDate = new Date();
  }
  if (tillToday) {
    limit.maxDate = new Date();
  }

  return (
    <ReactDatePicker
      id={id || null}
      required={required}
      autoComplete="none"
      className={classNameNew}
      wrapperClassName={invalid ? invalidClassName : null}
      dateFormat={dateFormat || dateFormatDefault}
      selected={date ? parseISO(date) : null}
      onChange={date => {
        const dateTxt = date ? format(date, dateFormat || dateFormatDefault) : '';

        onChange(dateTxt);
      }}
      locale="en-GB"
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      {...limit}
    />
  );
}

export default DatePicker;
