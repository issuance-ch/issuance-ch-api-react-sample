import { makeObservable, observable, action, computed } from "mobx";
import { Annexes } from "../helpers/agent";

class Annex1Store {
  constructor() {
    makeObservable(this, {
      loadingCount: observable,
      errors: observable,
      data: observable,
      signatureData: observable,
      loading: computed,
      reset: action,
      setData: action,
      setSignatureData: action,
      postAnnex1: action,
    });
  }

  loadingCount = 0;
  data = {
    place: "",
    sign: "",
  };
  errors = {};
  signatureData = null;

  get loading() {
    return this.loadingCount > 0;
  }

  reset() {
    this.data.place = "";
    this.data.sign = "";

    this.errors = {};
    this.signatureData = null;
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
      if (null === prev || typeof prev !== "object") {
        return null;
      }

      return curr in prev ? prev[curr] : null;
    }, this.errors.fields);
  }

  hasError(field) {
    return !!this.getError(field);
  }

  setSignatureData(data) {
    this.signatureData = data;
  }

  postAnnex1(subscriptionId) {
    this.loadingCount++;
    return Annexes.postAnnex1(subscriptionId, this.data)
      .then(
        action((res) => {
          this.reset();

          return res;
        })
      )
      .catch(
        action((err) => {
          if (
            err.response &&
            err.response.body &&
            err.response.status &&
            err.response.status === 400
          ) {
            if (err.response.body.err_msg) {
              this.errors.form = err.response.body.err_msg;
            }
            if (err.response.body.fields) {
              this.errors.fields = err.response.body.fields;
            }
          }

          throw err;
        })
      )
      .finally(
        action(() => {
          this.loadingCount--;
        })
      );
  }
}

const Annex1StoreInstance = new Annex1Store();
export default Annex1StoreInstance;