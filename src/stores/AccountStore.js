import { observable, action, makeObservable } from "mobx";
import { Accounts } from "../helpers/agent";
import CommonStore from "./CommonStore";
import CustomerStore from "./CustomerStore";
import { asyncSessionStorage } from "../helpers/sessionStorage";

class AccountStore {
  constructor() {
    makeObservable(this, {
      loading: observable,
      errors: observable,
      values: observable,
      setUsername: action,
      setEmail: action,
      setPassword: action,
      setCode: action,
      reset: action,
      login: action,
      register: action,
      validate: action,
      validateResend: action,
      passwordResetRequest: action,
      passwordResetUpdate: action,
      logout: action,
    });
  }

  loading = false;
  errors = {};
  values = {
    username: "",
    email: "",
    password: "",
    code: "",
  };

  setUsername(username) {
    this.values.username = username;
  }

  setEmail(email) {
    this.values.email = email;
  }

  setPassword(password) {
    this.values.password = password;
  }

  setCode(code) {
    this.values.code = code;
  }

  reset() {
    this.values.username = "";
    this.values.email = "";
    this.values.password = "";
    this.values.code = "";

    this.errors = {};
  }

  login() {
    this.loading = true;
    this.errors = {};

    return Accounts.login(this.values.username, this.values.password)
      .then((res) => {
        CommonStore.setToken(res.token);
        CustomerStore.setCurrentCustomer({ username: this.values.username });
      })
      .then(() => CustomerStore.loadCustomer())
      .catch(
        action((err) => {
          if (err.response && err.response.body && err.response.body.message) {
            this.errors.form = err.response.body.message;
          }

          throw err;
        })
      )
      .finally(
        action(() => {
          this.loading = false;
        })
      );
  }

  register() {
    this.loading = true;
    this.errors = {};

    return Accounts.register(
      this.values.username,
      this.values.email,
      this.values.password
    )
      .then((res) => {
        CommonStore.setToken(res.token);
        CustomerStore.setCurrentCustomer({ username: res.login });
      })
      .catch(
        action((err) => {
          if (err.response && err.response.body && err.response.body.err_msg) {
            this.errors.form = err.response.body.err_msg;
          }
          if (err.response && err.response.body && err.response.body.fields) {
            this.errors.fields = err.response.body.fields;
          }

          throw err;
        })
      )
      .finally(
        action(() => {
          this.loading = false;
        })
      );
  }

  validate() {
    this.loading = true;
    this.errors = {};

    return Accounts.validate(this.values.code)
      .then((res) => {
        if (res && res.confirmed === false) {
          this.errors.form = "Code is invalid";

          throw new Error("Validation code is invalid");
        }
      })
      .then(() => CustomerStore.loadCustomer())
      .catch(
        action((err) => {
          if (err.response && err.response.body && err.response.body.err_msg) {
            this.errors.form = err.response.body.err_msg;
          }
          if (err.response && err.response.body && err.response.body.fields) {
            this.errors.fields = err.response.body.fields;
          }

          throw err;
        })
      )
      .finally(
        action(() => {
          this.loading = false;
        })
      );
  }

  validateResend() {
    this.loading = true;
    this.errors = {};

    return Accounts.validateResend(this.values.email)
      .then((res) => {
        if (res && res.success === false) {
          this.errors.form = "New code has not been sent";

          throw new Error("New validation code submit error");
        }
      })
      .catch(
        action((err) => {
          if (err.response && err.response.body && err.response.body.err_msg) {
            this.errors.form = err.response.body.err_msg;
          }
          if (err.response && err.response.body && err.response.body.fields) {
            this.errors.fields = err.response.body.fields;
          }

          throw err;
        })
      )
      .finally(
        action(() => {
          this.loading = false;
        })
      );
  }

  passwordResetRequest() {
    this.loading = true;
    this.errors = {};

    return Accounts.passwordResetRequest(this.values.email)
      .then((res) => {
        if (res && res.success === false) {
          this.errors.form = "Password reset code has not been sent";

          throw new Error("Password reset code submit error");
        }
      })
      .catch(
        action((err) => {
          if (err.response && err.response.body && err.response.body.err_msg) {
            this.errors.form = err.response.body.err_msg;
          }
          if (err.response && err.response.body && err.response.body.fields) {
            this.errors.fields = err.response.body.fields;
          }

          if (
            err.response.status === 403 &&
            typeof err.response.body === "string"
          ) {
            this.errors.form = err.response.body;
          }

          throw err;
        })
      )
      .finally(
        action(() => {
          this.loading = false;
        })
      );
  }

  passwordResetUpdate() {
    this.loading = true;
    this.errors = {};

    return Accounts.passwordResetUpdate(this.values.code, this.values.password)
      .then((res) => {
        if (res && res.success === false) {
          this.errors.form = "Password reset code is invalid";

          throw new Error("Password reset code is invalid");
        }
      })
      .catch(
        action((err) => {
          if (err.response && err.response.body && err.response.body.err_msg) {
            this.errors.form = err.response.body.err_msg;
          }
          if (err.response && err.response.body && err.response.body.fields) {
            this.errors.fields = err.response.body.fields;
          }

          throw err;
        })
      )
      .finally(
        action(() => {
          this.loading = false;
        })
      );
  }

  logout() {
    CommonStore.setToken(undefined);
    CustomerStore.forgetCustomer();
    asyncSessionStorage.reset();

    return Promise.resolve();
  }
}

export default new AccountStore();
