/**
 * @file Reusable Select component.
 * Drop-in replacement for reactstrap's CustomInput type="select".
 * When the `searchable` prop is true, renders a filterable dropdown
 * with a text input instead of a native <select>.
 */
import React, { useState, useRef, useEffect, useMemo, Children } from 'react';
import { Input } from 'reactstrap';
import { Search } from 'react-feather';

/**
 * Recursively extracts option data from React children (<option> and <optgroup>).
 * @param {React.ReactNode} children
 * @returns {{ value: string, label: string, group?: string }[]}
 */
function extractOptions(children) {
  const options = [];
  Children.forEach(children, child => {
    if (!child || !child.props) return;
    if (child.type === 'optgroup') {
      Children.forEach(child.props.children, opt => {
        if (opt && opt.props) {
          options.push({
            value: String(opt.props.value ?? ''),
            label: String(opt.props.children ?? ''),
            group: child.props.label,
          });
        }
      });
    } else if (child.type === 'option') {
      options.push({
        value: String(child.props.value ?? ''),
        label: String(child.props.children ?? ''),
      });
    }
  });
  return options;
}

/**
 * Select component with optional search/filter capability.
 *
 * @param {object} props
 * @param {boolean} [props.searchable=false] - Enables a text filter on the dropdown
 * @param {string} [props.value] - Currently selected value
 * @param {function} [props.onChange] - Change handler, receives a synthetic-like event
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.id] - Element id
 * @param {boolean} [props.required] - Whether the field is required
 * @param {boolean} [props.invalid] - Whether the field is in error state
 * @param {React.ReactNode} props.children - <option> elements
 */
function Select({ searchable = false, children, value, onChange, className, id, invalid, ...rest }) {
  // Non-searchable: render a plain native select
  if (!searchable) {
    return (
      <Input
        type="select"
        id={id}
        className={className}
        value={value}
        onChange={onChange}
        invalid={invalid}
        {...rest}
      >
        {children}
      </Input>
    );
  }

  return (
    <SearchableSelect
      id={id}
      className={className}
      value={value}
      onChange={onChange}
      invalid={invalid}
      {...rest}
    >
      {children}
    </SearchableSelect>
  );
}

/**
 * Internal searchable dropdown implementation.
 */
function SearchableSelect({ children, value, onChange, className = '', id, invalid, required, ...rest }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const allOptions = useMemo(() => extractOptions(children), [children]);

  // Find the label for the currently selected value
  const selectedLabel = useMemo(() => {
    const match = allOptions.find(o => o.value === value);
    return match ? match.label : '';
  }, [allOptions, value]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!search) return allOptions;
    const term = search.toLowerCase();
    return allOptions.filter(o =>
      o.value !== '' && o.label.toLowerCase().includes(term)
    );
  }, [allOptions, search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  /**
   * Handles option selection.
   * @param {string} optionValue
   */
  function handleSelect(optionValue) {
    setOpen(false);
    setSearch('');
    if (onChange) {
      onChange({ target: { value: optionValue } });
    }
  }

  const invalidClass = invalid ? ' is-invalid' : '';

  return (
    <div
      ref={containerRef}
      className={`searchable-select ${className}${invalidClass}`}
      id={id}
      {...rest}
    >
      <div
        className={`searchable-select__trigger form-control${invalidClass}`}
        onClick={() => setOpen(!open)}
      >
        <span className={selectedLabel ? '' : 'text-muted'}>
          {selectedLabel || 'Select one'}
        </span>
        <span className="searchable-select__arrow">&#9662;</span>
      </div>

      {/* Hidden native input for form validation */}
      {required && (
        <input
          type="text"
          value={value || ''}
          required={required}
          className="searchable-select__hidden-input"
          tabIndex={-1}
          readOnly
        />
      )}

      {open && (
        <div className="searchable-select__dropdown">
          <div className="searchable-select__search">
            <Search size={14} className="searchable-select__search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="form-control form-control-sm"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ul className="searchable-select__options">
            {!search && (
              <li
                className={`searchable-select__option${!value ? ' active' : ''}`}
                onClick={() => handleSelect('')}
              >
                Select one
              </li>
            )}
            {filteredOptions
              .filter(o => o.value !== '')
              .map(o => (
                <li
                  key={o.value}
                  className={`searchable-select__option${o.value === value ? ' active' : ''}`}
                  onClick={() => handleSelect(o.value)}
                >
                  {o.label}
                </li>
              ))}
            {filteredOptions.filter(o => o.value !== '').length === 0 && (
              <li className="searchable-select__no-results">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Select;
