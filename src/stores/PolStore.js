import { makeObservable, observable, action, computed } from "mobx";
import { Pol } from "../helpers/agent";

/**
 * Message shown for the refuse reasons of a declined proof of liveness / ID check.
 *
 * @param {Array<{message: string}>|undefined} refuseReasons The "refuse_reason" of the check.
 * @returns {string}
 */
export function polErrorMessage(refuseReasons) {
  if (refuseReasons?.find((el) => el.message === "used_by_someone_else")) {
    return "It seems that this ID is already in use in another account. Please use your other account.";
  }
  if (refuseReasons?.find((el) => el.message === "mrz_required")) {
    return "The project required an id document with a MRZ.";
  }
  return "Your id can't be validated. Please try with a better quality image.";
}

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

  /**
   * Silent check of the proof of liveness status (no loader), used while waiting for its verdict.
   *
   * @param {string} subscriptionId
   * @returns {Promise<object>} The check, with its "pol_status" and "refuse_reason".
   */
  checkPol = (subscriptionId) => {
    return Pol.completePol(subscriptionId).then(
      action((response) => {
        if (response?.pol_status === "declined") {
          this.polError = polErrorMessage(response.refuse_reason);
        }
        return response;
      })
    );
  };

  completePol = (subscriptionId) => {
    this.loadingCount++;

    return Pol.completePol(subscriptionId)
      .then(
        action((response) => {
          this.polError = "";
          if (response.pol_status === "declined") {
            this.polError = polErrorMessage(response.refuse_reason);
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