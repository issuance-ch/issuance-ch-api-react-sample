import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Alert, FormGroup, Button, InputGroup, InputGroupAddon, InputGroupText, Label, Input, Spinner, Col, Row } from 'reactstrap';
import FieldErrors from './FieldErrors';
import TiersSelect from './TiersSelect';
import CurrencySelect from './CurrencySelect';

function ContributionForm(props) {
  const { SubscriptionStore, ContributionStore, groupName, fieldName, subscriptionId, contribution, fieldData, ico } = props;
  const { loading, data, errors } = ContributionStore;
  const formId = groupName + '_' + fieldName;
  const [modifying, setModifying] = useState(fieldData.status === 'EMPTY');
  const [pdf, setPdf] = useState(null);
  const [tokenAmount, setTokenAmount] = useState('');
  const [autoGuessError, setAutoGuessError] = useState(null);

  /**
   * Handle token amount change in autoGuessPrice mode.
   * Calls the API and receives back the tier + all compoatible currencies with amounts.
   * @param {string} value - The token amount entered by the user.
   * @param {string} subId - The subscription ID.
   * @param {Object} currency - The current currency object from store data.
   */
  const handleTokenAmountChange = async (value, subId, currency) => {
    setTokenAmount(value);
    setAutoGuessError(null);

    if (!value || value === '0') {
      return;
    }

    try {
      const estimation = await ContributionStore.fetchSharePriceEstimation(subId, value);

      // No compatible tier found
      if (!estimation.currencies || estimation.currencies.length === 0) {
        setAutoGuessError('The requested amount exceeds the maximum allowed contribution. Please reduce the quantity.');
        return;
      }

      // Assign the tier returned by the API
      if (estimation.tier) {
        ContributionStore.setData('tier', estimation.tier.toLowerCase());
      }

      // Set the amount for the currently selected currency
      const currentCode = currency.currency_code;
      const amountForCurrency = ContributionStore.getEstimatedAmountForCurrency(currentCode);
      if (amountForCurrency) {
        ContributionStore.setInvestment(currency, 'amount', amountForCurrency);
      } else {
        // Current currency not in the list, pick the first available one
        const first = estimation.currencies[0];
        ContributionStore.setInvestment(currency, 'currency_code', first.currency.code);
        ContributionStore.setInvestment(currency, 'amount', first.amount);
      }

      // Run contribution estimation for the CHF equivalent
      await ContributionStore.getContributionEstimation(subId);
    } catch (err) {
      setAutoGuessError('The requested amount exceeds the maximum allowed contribution. Please reduce the quantity.');
    }
  };

  /**
   * Handle currency change in autoGuessPrice mode.
   * Uses the cached estimation data to set the amount without a new API call.
   * @param {string} newCurrencyCode - The newly selected currency code.
   * @param {Object} currency - The currency object from store data.
   */
  const handleAutoGuessCurrencyChange = (newCurrencyCode, currency) => {
    ContributionStore.setInvestment(currency, 'currency_code', newCurrencyCode);
    const amount = ContributionStore.getEstimatedAmountForCurrency(newCurrencyCode);
    if (amount) {
      ContributionStore.setInvestment(currency, 'amount', amount);
    }
    ContributionStore.getContributionEstimation(subscriptionId);
  };

  async function b64toBlob(base64, type = 'application/octet-stream') {
    const res = await fetch(`data:${type};base64,${base64}`);
    return await res.blob();
  }

  if (loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!modifying) {
    return (
      <>
        <FormGroup>
          <InputGroup className="crypted">
            <InputGroupAddon addonType="prepend">
              <InputGroupText
                className={`status-${contribution.status}`}
                onClick={() => {
                  setModifying(true);
                }}
              >
                {contribution.status} (click to change)
              </InputGroupText>
            </InputGroupAddon>

            {
              pdf &&
              <>
                <InputGroupAddon addonType="append">
                  <InputGroupText>
                    <a href={pdf.href} download={pdf.name}>Download</a>
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupAddon addonType="append">
                  <InputGroupText>
                    <a href={pdf.href} rel="noopener noreferrer" target="_blank">Open</a>
                  </InputGroupText>
                </InputGroupAddon>
              </>
            }
          </InputGroup>
        </FormGroup>

        {pdf && pdf.href && <Button
          color="primary"
          onClick={() => {
            SubscriptionStore.loadFillStatus(subscriptionId);
            SubscriptionStore.loadSubscription(subscriptionId, { acceptCached: false });
          }}
        >
          I've downloaded my contribution and want to submit
        </Button>}
      </>
    );
  }

  const getTiersList = (ico) => {
    let tiersList = [];
    let currencies = {};
    ico.tiers_configuration.forEach((tier, id) => {
      if (!tier.hidden) {
        tiersList[`tier${id + 1}`] = {
          id,
          name: `tier${id + 1}`,
          amounts: toJS(tier.amounts),
          currencies: {
            fiat: toJS(ico.investment_potential[id].currencies_fiat),
            crypto: toJS(ico.investment_potential[id].currencies_crypto),
          }
        };
      }
      ico.investment_potential[id].currencies_fiat.forEach(el => {
        currencies[el.currency.code] = el.currency;
      });
      ico.investment_potential[id].currencies_crypto.forEach(el => {
        currencies[el.currency.code] = el.currency;
      });
    });
    return {
      tiersList,
      currencies
    };
  }

  const { tiersList, currencies } = getTiersList(ico);

  const isCrypto = (currencyCode) => {
    if (!currencies[currencyCode]) {
      return true;
    } else {
      return toJS(currencies[currencyCode].type) === 'TYPE_CRYPTO';
    }
  }

  const autoGuessPrice = !!(toJS(ico).auto_guess_price);
  const tokenName = toJS(ico).token_name || "";

  const cryptoCurrencies = data['tier'] && tiersList[data['tier']] && tiersList[data['tier']].currencies ? tiersList[data['tier']].currencies.crypto : [];
  const fiatCurrencies = data['tier'] && tiersList[data['tier']] && tiersList[data['tier']] && tiersList[data['tier']].currencies ? tiersList[data['tier']].currencies.fiat : [];
  const mergedCurrencies = cryptoCurrencies.concat(fiatCurrencies);

  if (!autoGuessPrice && cryptoCurrencies.length + fiatCurrencies.length === 1) {
    // If only one currency is possible, automatically select it...
    let currencies = toJS(data.currencies);
    if (currencies && currencies.length === 1 && currencies[0].currency_code !== mergedCurrencies[0].currency.code) {
      currencies[0].currency_code = mergedCurrencies[0].currency.code;
      ContributionStore.setData("currencies", currencies);
    }
  }

  if (!ContributionStore.getTotalChf() && !autoGuessPrice) {
    ContributionStore.getContributionEstimation(subscriptionId);
  }

  // In autoGuessPrice mode, build the currency list from the API estimation response
  const estimation = ContributionStore.sharePriceEstimation;
  const estimationCurrencies = estimation && estimation.currencies ? estimation.currencies : [];
  const estimationFiat = estimationCurrencies.filter(c => c.currency && c.currency.type === 'TYPE_FIAT');
  const estimationCrypto = estimationCurrencies.filter(c => c.currency && c.currency.type !== 'TYPE_FIAT');

  const showExceedsWarning = autoGuessPrice && autoGuessError && tokenAmount && tokenAmount !== '0';

  return (
    <>
      {!autoGuessPrice && (
        <FormGroup>
          <Label className="required" for={formId + 'tier'}>Tiers</Label>
          <TiersSelect
            id={formId + 'tier'}
            value={data['tier']}
            tiers={tiersList}
            invalid={ContributionStore.hasError('tier')}
            onChange={ev => {
              ContributionStore.setData('tier', ev.target.value);
              ContributionStore.getContributionEstimation(subscriptionId);
            }}
          />
          <FieldErrors errors={errors} field="tier" />
        </FormGroup>
      )}

      {ContributionStore.getData("currencies").map((currency, index) => {
        return <div key={currency.id}>
          {autoGuessPrice &&
            <Row className="justify-content-md-between align-items-md-center">
              <Col className="mb-4 mb-md-0">
                <FormGroup>
                  <Label className="required" for={formId + '_tokens'}>How many <strong>{tokenName}</strong> would you like to buy?</Label>
                  <Input type="text" id={formId + '_tokens'}
                    required
                    value={tokenAmount}
                    onChange={(ev) => {
                      handleTokenAmountChange(ev.target.value, subscriptionId, currency);
                    }}
                  />
                  <FieldErrors errors={errors} field={['currencies', index, 'amount']} />
                </FormGroup>
              </Col>
            </Row>
          }

          {showExceedsWarning ? (
            <Alert color="warning">
              {autoGuessError}
            </Alert>
          ) : (
            <Row className="align-items-md-start">
              <Col>
                <FormGroup>
                  <Label className="required" for={formId + '_amount'}>Amount</Label>
                  <Input type="text" id={formId + '_amount'}
                    disabled={autoGuessPrice}
                    required
                    value={currency.amount}
                    invalid={ContributionStore.hasError(['currencies', index, 'amount'])}
                    onChange={ev => {
                      ContributionStore.setInvestment(currency, 'amount', ev.target.value);
                      ContributionStore.getContributionEstimation(subscriptionId);
                    }}
                  />
                  <FieldErrors errors={errors} field={['currencies', index, 'amount']} />
                </FormGroup>
              </Col>

              <Col className="mb-4 mb-md-0">
                <FormGroup>
                  <Label className="required" for={formId + '_currency_code'}>In which currency would you pay?</Label>
                  {autoGuessPrice ? (
                    <CurrencySelect
                      id={formId + 'currency_code'}
                      value={currency.currency_code}
                      fiat={estimationFiat.map(c => ({ currency: c.currency }))}
                      crypto={estimationCrypto.map(c => ({ currency: c.currency }))}
                      invalid={ContributionStore.hasError(['currencies', index, 'currency_code'])}
                      onChange={ev => {
                        handleAutoGuessCurrencyChange(ev.target.value, currency);
                      }}
                    />
                  ) : (
                    <CurrencySelect
                      id={formId + 'currency_code'}
                      value={currency.currency_code}
                      fiat={fiatCurrencies}
                      crypto={cryptoCurrencies}
                      invalid={ContributionStore.hasError(['currencies', index, 'currency_code'])}
                      onChange={ev => {
                        ContributionStore.setInvestment(currency, 'currency_code', ev.target.value);
                        ContributionStore.getContributionEstimation(subscriptionId);
                      }}
                    />
                  )}
                  <FieldErrors errors={errors} field={['currencies', index, 'currency_code']} />
                </FormGroup>
              </Col>
              <Col className="mb-4 mb-md-0">
                {isCrypto(toJS(ContributionStore.getData('currencies')[index].currency_code)) && <FormGroup>
                  <Label className="required" for={formId + '_address'}>Address</Label>
                  <Input type="text" id={formId + '_address'}
                    required
                    value={currency.address}
                    invalid={ContributionStore.hasError(['currencies', index, 'address'])}
                    onChange={ev => {
                      ContributionStore.setInvestment(currency, 'address', ev.target.value);
                    }}
                  />
                  <FieldErrors errors={errors} field={['currencies', index, 'address']} />
                </FormGroup>}
              </Col>
            </Row>
          )}
        </div>
      })}

      {!showExceedsWarning && (<>
        <Row className="justify-content-md-between align-items-md-center">
          <Col xs="12" md={{ size: 'auto' }} className="mb-3">
            <strong>CHF equivalent :</strong> {ContributionStore.getTotalChf()}<br />
            You must use a personal wallet. Do not send funds from an exchange. Please ensure that the address you indicate is already funded with the contribution amount.
          </Col>
        </Row>

        {ico.has_coupons && <Row>
          <Col xs="12" className="mb-4 mb-md-0">
            <FormGroup>
              <Label for="coupon">Coupon</Label>
              <Input type="text" id="coupon"
                placeholder="Enter a coupon code"
                invalid={ContributionStore.hasError(['coupon'])}
                onChange={ev => {
                  ContributionStore.checkCoupon(ico.id, ev.target.value).then(couponData => {
                    ContributionStore.setCoupon(couponData.code)
                    ContributionStore.getContributionEstimation(subscriptionId);
                  }).catch(err => { })
                }}
              />
              <FieldErrors errors={errors} field={"coupon"} />
            </FormGroup>
          </Col>
        </Row>}

        {ContributionStore.getFormErrors().map((err, index) => {
          return <div className="error" key={index}>{err}</div>
        })}

        <Row className="justify-content-md-between align-items-md-center">
          <Col xs="12" md={{ size: 'auto' }} className="mb-3 mb-md-0">
            <Button
              className="w-100"
              color="primary"
              onClick={() => {
                ContributionStore.postContribution(subscriptionId)
                  .then(res => {
                    b64toBlob(res.clear_binary_content, 'application/pdf')
                      .then(blob => {
                        setPdf({
                          name: res.original_filename,
                          href: URL.createObjectURL(blob)
                        });
                      })
                      ;

                    SubscriptionStore.setModified(groupName, fieldName, res.id);
                    setModifying(false);
                  })
                  .catch(err => { })
                  ;
              }}
            >
              Submit
            </Button>
          </Col>
          <Col xs="12" md={{ size: 'auto' }}>
            <Button
              className="w-100"
              color="secondary"
              onClick={() => { setModifying(false); }}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </>)}
    </>
  );

}

export default inject('SubscriptionStore', 'ContributionStore')(observer(ContributionForm));
