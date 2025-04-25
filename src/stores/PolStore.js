import { makeObservable, observable, action, computed } from "mobx";
import { Pol } from "../helpers/agent";

class PolStore {
  loadingCount = 0;
  polError = null;
  polUrl = "";

  constructor() {
    makeObservable(this, {
      loadingCount: observable,
      polUrl: observable,
      loading: computed,
      initPolUrl: action,
      polError: observable,
    });
  }

  get loading() {
    return this.loadingCount > 0;
  }

  initPolUrl = (subscriptionId) => {
    this.loadingCount++;
    return Pol.initUrl(subscriptionId)
      .then(
        action((response) => {
          this.polUrl = response.idCheckUrl;
          return response;
        })
      )
      .finally(
        action(() => {
          this.loadingCount--;
        })
      );
  };

  polCompleted = () => {
    this.polUrl = "";
  };

  stopPol = () => {
    this.polUrl = "";
  };

  completePol = (subscriptionId) => {
    this.loadingCount++;

    return Pol.completePol(subscriptionId)
      .then(
        action((response) => {
          this.polError = "";
          if (response.pol_status === "declined") {
            if (
              response.refuse_reason?.find(
                (el) => el.message === "used_by_someone_else"
              )
            ) {
              this.polError =
                "It seems that this ID is already in use in another account. Please use your other account.";
            } else if (
              response.refuse_reason?.find(
                (el) => el.message === "mrz_required"
              )
            ) {
              this.polError = "The project required an id document with a MRZ.";
            } else {
              this.polError =
                "Your id can't be validated. Please try with a better quality image.";
            }
          }

          return response;
        })
      )
      .finally(
        action(() => {
          this.loadingCount--;
        })
      );
  };
}

const PolStoreInstance = new PolStore();
export default PolStoreInstance;