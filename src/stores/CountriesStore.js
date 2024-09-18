import { observable, action, makeObservable, computed } from "mobx";
import { Countries } from "../helpers/agent";

class CountriesStore {
  loadingCount = 0;
  countriesRegistry = [];

  constructor() {
    makeObservable(this, {
      loadingCount: observable,
      countriesRegistry: observable,
      loading: computed,
      countries: computed,
      loadCountries: action,
    });
  }

  get loading() {
    return this.loadingCount > 0;
  }

  get countries() {
    return Array.isArray(this.countriesRegistry) ? this.countriesRegistry : [];
  }

  loadCountries({ acceptCached = true } = {}) {
    if (acceptCached) {
      if (this.countriesRegistry !== undefined) {
        return Promise.resolve(this.countriesRegistry);
      }
    }

    this.loadingCount++;

    return Countries.list()
      .then(
        action((countries) => {
          this.countriesRegistry = countries;

          return this.countriesRegistry;
        })
      )
      .catch(
        action((err) => {
          this.countriesRegistry = [];
        })
      )
      .finally(
        action(() => {
          this.loadingCount--;
        })
      );
  }
}

const CountriesStoreInstance = new CountriesStore();
export default CountriesStoreInstance;