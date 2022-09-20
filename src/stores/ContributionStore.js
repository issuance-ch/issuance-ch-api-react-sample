import { decorate, observable, action, computed, toJS } from 'mobx';
import { Contribution } from '../helpers/agent';

class ContributionStore {

  loadingCount = 0;
  totalChf = null;

  data = null;
  errors = {};

  currencyId = 1;
  coupon = "";

  get loading() {
    return this.loadingCount > 0;
  }

  setInitialData(data) {
    this.data = data;
    if (!data) {
      this.data = {
        tier: "tier1",
        currencies: [{
          id: this.currencyId,
          currency_code: "",
          amount: "",
          address: "",
        }]
      }
    }
  }

  setCoupon(coupon) {
    this.coupon = coupon;
  }

  getTotalChf() {
    return this.totalChf;
  }

  addInvestment() {
    this.currencyId++;
    this.data.currencies.push({
      id: this.currencyId,
      currency_code: "",
      amount: "",
      address: "",
    });
  }

  setInvestment(currency, element, value) {
    currency[element] = value;
  }

  removeInvestment(currency) {
    if (this.data.currencies.length > 1) {
      this.data.currencies.remove(currency)
    }
  }

  reset() {
    this.data.tier = '';
    this.data.currencies = [];

    this.errors = {};
  }

  getAllData() {
    return toJS(this.data);
  }

  getData(fieldName) {
    return this.data[fieldName];
  }

  setData(fieldName, fieldValue) {
    if (fieldName in this.data) {
      this.data[fieldName] = fieldValue;
    }

    if (this.hasError(fieldName)) {
      delete this.errors.fields[fieldName];
    }
  }

  getError(field) {
    const path = Array.isArray(field) ? field : [field];

    if (!this.errors.fields) {
      return false;
    }

    return path.reduce((prev, curr) => {
      if (null === prev || typeof prev !== 'object') {
        return null;
      }

      return curr in prev ? prev[curr] : null;
    }, this.errors.fields);
  }

  hasError(field) {
    return !!this.getError(field);
  }

  getFormErrors() {
    return this.errors.form ? Object.values(this.errors.form) : [];
  }

  /**
   * Simulate a contribution to check if values are correct and get the contribution amount
   * 
   * @param {string} subscriptionId Subscription unique id
   * @returns the details of the contribution estimation
   */
  getContributionEstimation(subscriptionId) {
    let simulationData = { simulation: true, ...this.data };
    return Contribution.patchContribution(subscriptionId, simulationData, this.coupon, true)
      .then(action(res => {
        this.totalChf = res.total_chf;
        return res;
      }))
      .catch(action(err => {

      }))
      .finally(action(() => { }))
      ;
  }

  /**
   * Verify if the coupon exists in the project. Return the coupons details if exists or store the error if not
   * @param {string} icoId Ico unique id
   * @param {string} couponCode Coupon code
   * @returns The coupon details if valid
   */
  checkCoupon(icoId, couponCode) {
    return Contribution.checkCoupon(icoId, couponCode).then(action(res => {
      if (this.errors?.fields?.coupon) {
        delete this.errors.fields.coupon;
      }
      return res;
    })).catch(action(err => {
      if (err.response && err.response.body && err.response.status && err.response.status === 404) {
        this.errors = {fields: {}, form: {}};
        this.errors.fields.coupon = "Coupon does not exist";
      }
    }))
  }

  async postContribution(subscriptionId) {
    this.loadingCount++;

    this.errors = {};
    return Contribution.patchContribution(subscriptionId, this.data, this.coupon, false)
      .then(action(res => res))
      .catch(action(err => {
        if (err.response && err.response.body && err.response.status && err.response.status === 400) {
          if (err.response.body.form) {
            this.errors.form = err.response.body.form;
          }
          if (err.response.body.fields) {
            this.errors.fields = err.response.body.fields;
          }
        }

        throw err;
      }))
      .finally(action(() => { this.loadingCount--; }))
      ;
  }

}
decorate(ContributionStore, {
  loadingCount: observable,
  totalChf: observable,
  errors: observable,
  data: observable,
  signatureData: observable,
  loading: computed,
  reset: action,
  setData: action,
  setInitialData: action,
  postContribution: action,
});

export default new ContributionStore();
