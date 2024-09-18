import { makeObservable, observable, action, reaction } from "mobx";
import { APP_NAME } from "../config";

class CommonStore {
  appName = APP_NAME;
  token = window.localStorage.getItem("jwt");
  appLoaded = false;

  constructor() {
    makeObservable(this, {
      appName: observable,
      token: observable,
      appLoaded: observable,
      setToken: action,
      setAppLoaded: action,
    });

    reaction(
      () => this.token,
      (token) => {
        if (token) {
          window.localStorage.setItem("jwt", token);
        } else {
          window.localStorage.removeItem("jwt");
        }
      }
    );
  }

  setToken(token) {
    this.token = token;
  }

  setAppLoaded() {
    this.appLoaded = true;
  }
}

const CommonStoreInstance = new CommonStore();
export default CommonStoreInstance;