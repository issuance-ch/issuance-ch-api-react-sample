import { makeObservable, observable, action, computed } from "mobx";
import { Annexes } from "../helpers/agent";

class Annex2Store {
  loadingCount = 0;
  personTemplate = {
    name: "",
    date_of_birth: "",
    address: "",
    nationality: "",
  };
  data = {
    corporate_name: "",
    sign: "",
    place: "",
    people: [{ ...this.personTemplate }],
  };
  errors = {};
  signatureData = null;

  constructor() {
    makeObservable(this, {
      loadingCount: observable,
      errors: observable,
      data: observable,
      signatureData: observable,
      loading: computed,
      reset: action,
      setData: action,
      // setSignature: action,
      addPerson: action,
      removePerson: action,
      setPersonData: action,
      // postAnnex1: action,
    });
  }

  get loading() {
    return this.loadingCount > 0;
  }

  reset() {
    this.data.corporate_name = "";
    this.data.sign = "";
    this.data.place = "";
    this.data.people = [{ ...this.personTemplate }];

    this.errors = {};
    this.signatureData = null;
  }

  setData(fieldName, fieldValue) {
    if (fieldName in this.data) {
      this.data[fieldName] = fieldValue;
    }

    if (this.errors.fields && this.errors.fields[fieldName]) {
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

  addPerson() {
    return this.data.people.push({ ...this.personTemplate });
  }

  removePerson(index = null) {
    if (this.data.people.length <= 1) {
      return;
    }

    if (null !== index && Number.isInteger(index) && index >= 0) {
      this.data.people.splice(index, 1);
    } else {
      this.data.people.length--;
    }
  }

  setPersonData(index, fieldName, fieldValue) {
    if (
      index in this.data["people"] &&
      fieldName in this.data["people"][index]
    ) {
      this.data["people"][index][fieldName] = fieldValue;
    }

    if (this.hasError(["people", index, fieldName])) {
      delete this.errors.fields["people"][index][fieldName];
    }
  }

  postAnnex2(subscriptionId) {
    this.loadingCount++;

    return Annexes.postAnnex2(subscriptionId, this.data)
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

const Annex2StoreInstance = new Annex2Store();
export default Annex2StoreInstance;