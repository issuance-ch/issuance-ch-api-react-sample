import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { Alert, Media, Spinner, Row, Col, Button, CustomInput, Input, FormGroup, InputGroup, InputGroupAddon, InputGroupText, Label } from 'reactstrap';
import IcoLogo from '../IcoLogo';
import FormErrors from '../../components/FormErrors';
import statusParser from '../../helpers/statusParser';

function SubscriptionPaymentStatusWrapper(props) {
  const { id, SubscriptionStore } = props;
  const { loading, errors } = SubscriptionStore;
  const subscription = SubscriptionStore.getSubscription(id);

  const [formData, setFormData] = useState({
    fiat: null,
    crypto: null
  });
  const [currencies, setCurrencies] = useState();
  const [modified, setModified] = useState();
  const [successMessage, setSuccessMessage] = useState();

  useEffect(() => {
    SubscriptionStore.loadSubscription(id, { acceptCached: true });
  }, [SubscriptionStore, id]);

  // subscription loaded
  useEffect(() => {
    const formData = {
      fiat: null,
      crypto: null
    };
    const investmentPotential = subscription ? subscription.ico_subscribed[0].ico.investment_potential.filter(potential => potential.tier.toUpperCase() === subscription.ico_subscribed[0].tier.toUpperCase())[0] : null;
    const info = investmentPotential && investmentPotential.currencies_fiat ? investmentPotential.currencies_fiat.filter(fiat => fiat.currency.code === subscription.ico_subscribed[0].investment.fiat.currency) : {};
    if (subscription && subscription.ico_subscribed[0].investment.fiat && subscription.ico_subscribed[0].investment.fiat.currency && info.length) {
      formData.fiat = {
        info: investmentPotential.currencies_fiat.filter(fiat => fiat.currency.code === subscription.ico_subscribed[0].investment.fiat.currency)[0].info,
        currency: subscription.ico_subscribed[0].investment.fiat.currency,
        init_status: subscription.ico_subscribed[0].investment.fiat.payment,
        status: subscription.ico_subscribed[0].investment.fiat.payment,
        init_label: subscription.ico_subscribed[0].investment.fiat.payment_label || '',
        label: subscription.ico_subscribed[0].investment.fiat.payment_label || ''
      };
    }

    if (subscription && subscription.ico_subscribed[0].investment.cryptos && info.length) {
      formData.crypto = subscription.ico_subscribed[0].investment.cryptos
        .map(crypto => {
          return {
            info: investmentPotential.currencies_crypto.filter(cryptoCurrency => cryptoCurrency.currency.code === crypto.currency.value)[0].info,
            currency: crypto.currency.value,
            init_status: crypto.payment,
            status: crypto.payment,
            init_label: crypto.payment_label || '',
            label: crypto.payment_label || ''
          };
        })
        .reduce((val, item) => { val[item.currency] = { ...item }; return val; }, {})
        ;
    }

    setFormData(formData);
  }, [subscription]);

  // form data changed
  // prepare currencies object to update subscription
  // prepare isModified state
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

  if (loading) {
    return (
      <Spinner color="secondary" />
    );
  }

  if (!subscription) {
    return (
      <Alert color="danger">
        Can't load subscription!
      </Alert>
    );
  }

  return (
    <>
      <Media className="mb-3">
        <Media left top className="align-self-start mr-3">
          <IcoLogo icoId={subscription.ico_subscribed[0].ico.id} />
        </Media>
        <Media body>
          <Media heading tag="h3">
            {subscription.ico_subscribed[0].ico.name}
          </Media>
          {subscription.ico_subscribed[0].ico.description}
        </Media>
      </Media>

      <Row className="justify-content-md-between align-items-md-center">
        <Col xs="12" className="mb-3 text-right">
          <strong>Status of your subscription: </strong>
          <div className="badge badge-info">
            {statusParser(subscription.status)}
          </div>
        </Col>
        <Col xs="12" className="mb-3 text-right">
          <strong>Token delivery address: </strong>
          <div className="badge badge-info">
            {subscription.ico_subscribed[0].investment.crypto_address_for_token_delivry.value}
          </div>
        </Col>
      </Row>

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
              <CustomInput inline type="radio" name={`payment_status_${formData.fiat.currency}`} label="Not paid yet" id={`payment_status_${formData.fiat.currency}_to_be_checked`} value="status.to_be_checked" checked={formData.fiat.status === 'status.to_be_checked'} onChange={ev => { updateFormData('fiat', formData.fiat.currency, 'status', ev.target.value) }} />
              <CustomInput inline type="radio" name={`payment_status_${formData.fiat.currency}`} label="Notify that I made the payment" id={`payment_status_${formData.fiat.currency}_announced`} value="status.announced" checked={formData.fiat.status === 'status.announced'} onChange={ev => { updateFormData('fiat', formData.fiat.currency, 'status', ev.target.value) }} />
            </FormGroup>

            <FormGroup>
              <Label for={`payment_label_${formData.fiat.currency}`}>Reference used for the transfer (update if different)</Label>
              <Input
                type="text"
                name={`payment_label_${formData.fiat.currency}`}
                id={`payment_label_${formData.fiat.currency}`}
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
                <CustomInput inline type="radio" name={`payment_status_${cryptoCurrency}`} label="Not paid yet" id={`payment_status_${cryptoCurrency}_to_be_checked`} value="status.to_be_checked" checked={formData.crypto[cryptoCurrency].status === 'status.to_be_checked'} onChange={ev => { updateFormData('crypto', cryptoCurrency, 'status', ev.target.value) }} />
                <CustomInput inline type="radio" name={`payment_status_${cryptoCurrency}`} label="Notify that I made the payment" id={`payment_status_${cryptoCurrency}_announced`} value="status.announced" checked={formData.crypto[cryptoCurrency].status === 'status.announced'} onChange={ev => { updateFormData('crypto', cryptoCurrency, 'status', ev.target.value) }} />
              </FormGroup>

              <FormGroup>
                <Label for={`payment_label_${cryptoCurrency}`}>TXID (transaction ID on the blockchain)</Label>
                <Input
                  type="text"
                  name={`payment_label_${cryptoCurrency}`}
                  id={`payment_label_${cryptoCurrency}`}
                  value={formData.crypto[cryptoCurrency].label}
                  onChange={ev => { updateFormData('crypto', cryptoCurrency, 'label', ev.target.value) }}
                />
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
                SubscriptionStore.loadSubscription(id, { acceptCached: false });
              }
            })
            ;
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

export default inject('SubscriptionStore')(observer(SubscriptionPaymentStatusWrapper));
