import { makeObservable, observable, action, computed } from "mobx";
import { Pol } from "../helpers/agent";

class PolStore {
  constructor() {
    makeObservable(this, {
      loadingCount: observable,
      loading: computed,
      savePol: action,
      polError: observable,
    });
  }

  loadingCount = 0;
  polError = null;

  get loading() {
    return this.loadingCount > 0;
  }

  savePol(caseId, ocrData, subscriptionId) {
    this.loadingCount++;
    this.polError = null;

    return Pol.submitPol(caseId, ocrData, subscriptionId)
      .then(
        action((response) => {
          return response;
        })
      )
      .catch(
        action((err) => {
          const _return =
            err.response && err.response.body ? err.response.body : null;

          if (_return) {
            switch (_return.err_code) {
              case "used_by_someone_else":
                this.polError =
                  "It seems that this ID is already in use in another account. Please use your other account.";
                break;
              case "mrz_required":
                this.polError =
                  "The project required an id document with a MRZ.";
                break;
              default:
                this.polError = null;
                break;
            }
          }
          return _return;
        })
      )
      .finally(
        action(() => {
          this.loadingCount--;
        })
      );
  }
}

export default new PolStore();
