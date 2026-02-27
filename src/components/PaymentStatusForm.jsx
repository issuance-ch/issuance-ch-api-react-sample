
import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { Alert, Row, Col, Button, CustomInput, Input, FormGroup, InputGroup, InputGroupAddon, InputGroupText, Label } from 'reactstrap';
import FormErrors from './FormErrors';

/**
 * @param {Object} props
 * @param {Object} props.subscription - The subscription object.
 * @param {Object} props.SubscriptionStore - The MobX subscription store.
 * @param {string} [props.idPrefix=''] - Optional prefix for input IDs to avoid collisions when used multiple times on a page.
 */
function PaymentStatusForm(props) {
  const { subscription, SubscriptionStore, idPrefix = '' } = props;
  const { errors } = SubscriptionStore;

  const [formData, setFormData] = useState({
    fiat: null,
    crypto: null
  });
  const [currencies, setCurrencies] = useState();
  const [modified, setModified] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const [editingTxid, setEditingTxid] = useState({});

  // Build form data from subscription
  useEffect(() => {
    const data = {
      fiat: null,
      crypto: null
    };

    if (!subscription) {
      setFormData(data);
      return;
    }

    const investmentPotential = subscription.ico_subscribed[0].ico.investment_potential.filter(
      potential => potential.tier.toUpperCase() === subscription.ico_subscribed[0].tier.toUpperCase()
    )[0] || null;

    const info = investmentPotential && investmentPotential.currencies_fiat
      ? investmentPotential.currencies_fiat.filter(fiat => fiat.currency.code === subscription.ico_subscribed[0].investment.fiat.currency)
      : {};

    if (subscription.ico_subscribed[0].investment.fiat && subscription.ico_subscribed[0].investment.fiat.currency && info.length) {
      data.fiat = {
        info: investmentPotential.currencies_fiat.filter(fiat => fiat.currency.code === subscription.ico_subscribed[0].investment.fiat.currency)[0].info,
        currency: subscription.ico_subscribed[0].investment.fiat.currency,
        amount: subscription.ico_subscribed[0].investment.fiat.amount?.value || subscription.ico_subscribed[0].investment.fiat.amount,
        init_status: subscription.ico_subscribed[0].investment.fiat.payment,
        status: subscription.ico_subscribed[0].investment.fiat.payment,
        init_label: subscription.ico_subscribed[0].investment.fiat.payment_label || '',
        label: subscription.ico_subscribed[0].investment.fiat.payment_label || ''
      };
    }

    if (subscription.ico_subscribed[0].investment.cryptos && investmentPotential && investmentPotential.currencies_crypto) {
      data.crypto = subscription.ico_subscribed[0].investment.cryptos
        .map(crypto => {
          const cryptoInfo = investmentPotential.currencies_crypto.find(cryptoCurrency => cryptoCurrency.currency.code === crypto.currency.value);
          return {
            info: cryptoInfo ? cryptoInfo.info : null,
            currency: crypto.currency.value,
            amount: crypto.amount?.value || crypto.amount,
            init_status: crypto.payment,
            status: crypto.payment,
            init_label: crypto.payment_label || '',
            label: crypto.payment_label || ''
          };
        })
        .reduce((val, item) => { val[item.currency] = { ...item }; return val; }, {});
    }

    setFormData(data);
  }, [subscription]);

  // Prepare currencies payload and detect modifications
  useEffect(() => {
    const currenciesData = {
      currencies: []
    };

    if (formData.fiat) {
      const fiatData = {
        currency: formData.fiat.currency
      };

      if (formData.fiat.init_status !== formData.fiat.status) {
        fiatData['payment_status'] = formData.fiat.status;
      }

      if (formData.fiat.label !== formData.fiat.init_label) {
        fiatData['payment_label'] = formData.fiat.label;
        fiatData['payment_status'] = formData.fiat.status;
      }

      if (Object.keys(fiatData).length > 1) {
        currenciesData.currencies.push(fiatData);
      }
    }

    if (formData.crypto) {
      Object.keys(formData.crypto).forEach(cryptoCurrency => {
        const cryptoData = {
          currency: cryptoCurrency
        };

        if (formData.crypto[cryptoCurrency].init_status !== formData.crypto[cryptoCurrency].status) {
          cryptoData['payment_status'] = formData.crypto[cryptoCurrency].status;
        }

        if (formData.crypto[cryptoCurrency].label !== formData.crypto[cryptoCurrency].init_label) {
          cryptoData['payment_label'] = formData.crypto[cryptoCurrency].label;
          cryptoData['payment_status'] = formData.crypto[cryptoCurrency].status;
        }

        if (Object.keys(cryptoData).length > 1) {
          currenciesData.currencies.push(cryptoData);
        }
      });
    }

    setCurrencies(currenciesData);
    setModified(currenciesData.currencies.length > 0);
  }, [formData]);

  function updateFormData(type, currency, field, value) {
    setFormData(prevState => {
      const newState = { ...prevState };

      if (type === 'fiat') {
        newState.fiat[field] = value;
      } else {
        newState.crypto[currency][field] = value;
      }

      return newState;
    });
  }

  if (!subscription) {
    return null;
  }

  return (
    <>
      <FormErrors errors={errors} />
      {successMessage && <Alert color="success">{successMessage}</Alert>}

      {
        formData.fiat !== null
        &&
        <Row className="mb-4">
          <Col xs="12">
            <h3 className="font-weight-light">Account details to transfer your funds in <span className="font-weight-bold">{formData.fiat.currency}</span></h3>
            {
              formData.fiat.info
              &&
              <Label>{formData.fiat.info}</Label>
            }
            <FormGroup>
              <CustomInput inline type="radio" name={`${idPrefix}payment_status_${formData.fiat.currency}`} label="Not paid yet" id={`${idPrefix}payment_status_${formData.fiat.currency}_to_be_checked`} value="status.to_be_checked" checked={formData.fiat.status === 'status.to_be_checked'} onChange={ev => { updateFormData('fiat', formData.fiat.currency, 'status', ev.target.value) }} />
              <CustomInput inline type="radio" name={`${idPrefix}payment_status_${formData.fiat.currency}`} label={formData.fiat.amount ? <span>Notify that I made the payment of <strong>{formData.fiat.amount} {formData.fiat.currency}</strong></span> : 'Notify that I made the payment'} id={`${idPrefix}payment_status_${formData.fiat.currency}_announced`} value="status.announced" checked={formData.fiat.status === 'status.announced'} onChange={ev => { updateFormData('fiat', formData.fiat.currency, 'status', ev.target.value) }} />
            </FormGroup>

            <FormGroup>
              <Label for={`${idPrefix}payment_label_${formData.fiat.currency}`}>Reference used for the transfer (update if different)</Label>
              <Input
                type="text"
                name={`${idPrefix}payment_label_${formData.fiat.currency}`}
                id={`${idPrefix}payment_label_${formData.fiat.currency}`}
                value={formData.fiat.label}
                onChange={ev => { updateFormData('fiat', formData.fiat.currency, 'label', ev.target.value) }}
              />
            </FormGroup>
          </Col>
        </Row>
      }

      {
        formData.crypto !== null
        &&
        Object.keys(formData.crypto).map(cryptoCurrency =>
          <Row key={cryptoCurrency} className="mb-4">
            <Col xs="12">
              <h3 className="font-weight-light">Account details to transfer your funds in <span className="font-weight-bold">{cryptoCurrency}</span></h3>
              {
                formData.crypto[cryptoCurrency].info
                &&
                <Label>{formData.crypto[cryptoCurrency].info}</Label>
              }
              <FormGroup>
                <CustomInput inline type="radio" name={`${idPrefix}payment_status_${cryptoCurrency}`} label="Not paid yet" id={`${idPrefix}payment_status_${cryptoCurrency}_to_be_checked`} value="status.to_be_checked" checked={formData.crypto[cryptoCurrency].status === 'status.to_be_checked'} onChange={ev => { updateFormData('crypto', cryptoCurrency, 'status', ev.target.value) }} />
                <CustomInput inline type="radio" name={`${idPrefix}payment_status_${cryptoCurrency}`} label={formData.crypto[cryptoCurrency].amount ? <span>Notify that I made the payment of <strong>{formData.crypto[cryptoCurrency].amount} {cryptoCurrency}</strong></span> : 'Notify that I made the payment'} id={`${idPrefix}payment_status_${cryptoCurrency}_announced`} value="status.announced" checked={formData.crypto[cryptoCurrency].status === 'status.announced'} onChange={ev => { updateFormData('crypto', cryptoCurrency, 'status', ev.target.value) }} />
              </FormGroup>

              <FormGroup>
                <Label for={`${idPrefix}payment_label_${cryptoCurrency}`}>TXID (transaction ID on the blockchain)</Label>
                {formData.crypto[cryptoCurrency].init_label && !editingTxid[cryptoCurrency] ? (
                  <InputGroup className="crypted">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText
                        className="status-FILLED"
                        onClick={() => {
                          setEditingTxid(prev => ({ ...prev, [cryptoCurrency]: true }));
                          updateFormData('crypto', cryptoCurrency, 'label', '');
                        }}
                      >
                        FILLED (click to change)
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                ) : (
                  <Input
                    type="text"
                    name={`${idPrefix}payment_label_${cryptoCurrency}`}
                    id={`${idPrefix}payment_label_${cryptoCurrency}`}
                    value={formData.crypto[cryptoCurrency].label}
                    onChange={ev => { updateFormData('crypto', cryptoCurrency, 'label', ev.target.value) }}
                  />
                )}
              </FormGroup>
            </Col>
          </Row>
        )
      }

      <Button color="primary"
        disabled={!modified}
        onClick={() => {
          setSuccessMessage(null);

          SubscriptionStore.patchPaymentStatus(subscription.id, currencies)
            .then(res => {
              if (res) {
                setSuccessMessage("Thanks for your submission. Your payment status has been updated.");
                setEditingTxid({});
                SubscriptionStore.loadSubscription(subscription.id, { acceptCached: false });
                SubscriptionStore.loadFillStatus(subscription.id);
              }
            });
        }}
      >
        {
          modified
            ? 'Confirm payment status'
            : 'No payment status changed'
        }
      </Button>
    </>
  );
}

export default inject('SubscriptionStore')(observer(PaymentStatusForm));
