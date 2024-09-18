import { makeObservable, observable, action, reaction } from "mobx";
import { Customers } from "../helpers/agent";

class CustomerStore {
  currentCustomer = window.localStorage.getItem("currentCustomer") && {
    username: window.localStorage.getItem("currentCustomer"),
  };
  loading = false;

  constructor() {
    makeObservable(this, {
      currentCustomer: observable,
      loading: observable,
      loadCustomer: action,
      setCurrentCustomer: action,
      forgetCustomer: action,
    });
    reaction(
      () => this.currentCustomer,
      (currentCustomer) => {
        if (currentCustomer) {
          window.localStorage.setItem(
            "currentCustomer",
            currentCustomer.username
          );
        } else {
          window.localStorage.removeItem("currentCustomer");
        }
      }
    );
  }

  loadCustomer() {
    this.loading = true;

    return Customers.me()
      .then(
        action((customer) => {
          this.setCurrentCustomer(customer);
        })
      )
      .finally(
        action(() => {
          this.loading = false;
        })
      );
  }

  setCurrentCustomer(customer) {
    this.currentCustomer = customer;
  }

  forgetCustomer() {
    this.currentCustomer = undefined;
  }
}

const CustomerStoreInstance = new CustomerStore();
export default CustomerStoreInstance;