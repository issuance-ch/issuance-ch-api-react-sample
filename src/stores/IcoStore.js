import { makeObservable, observable, action, computed } from "mobx";
import { Icos } from "../helpers/agent";
import { PROJECTS_TO_DISPLAY } from "../config";

class IcoStore {
  constructor() {
    makeObservable(this, {
      loadingCount: observable,
      icosRegistry: observable,
      logoRegistry: observable,
      loading: computed,
      icos: computed,
      loadIcos: action,
      loadLogo: action,
    });
  }

  loadingCount = 0;
  icosRegistry = observable.map();
  logoRegistry = observable.map();
  icoRegistry = observable.map();

  get loading() {
    return this.loadingCount > 0;
  }

  get icos() {
    return Array.from(this.icosRegistry.values());
  }

  getLogo(id) {
    return this.logoRegistry.get(id);
  }

  loadIcos() {
    this.loadingCount++;

    return Icos.list()
      .then(
        action((icos) => {
          this.icosRegistry.clear();

          Object.keys(icos).forEach((key) => {
            let projectToBeDisplayed = false;
            if (!PROJECTS_TO_DISPLAY) {
              projectToBeDisplayed = true;
            } else {
              PROJECTS_TO_DISPLAY.forEach((identifier) => {
                if (
                  identifier === icos[key].id ||
                  identifier === icos[key].slug
                ) {
                  projectToBeDisplayed = true;
                }
              });
            }
            if (projectToBeDisplayed) {
              this.icosRegistry.set(icos[key].id, icos[key]);
            }
          });
        })
      )
      .finally(
        action(() => {
          this.loadingCount--;
        })
      );
  }

  loadLogo(id, { acceptCached = false } = {}) {
    if (acceptCached) {
      const logo = this.getLogo(id);

      if (logo !== undefined) {
        return Promise.resolve(logo);
      }
    }

    return Icos.logo(id)
      .then(
        action((res) => {
          this.logoRegistry.set(id, URL.createObjectURL(res));
        })
      )
      .catch(
        action((err) => {
          if (err && err.response && err.response.status !== 404) {
            throw err;
          }

          this.logoRegistry.set(id, null);
        })
      );
  }

  loadIco(id) {
    return Icos.ico(id)
      .then(
        action((res) => {
          this.icoRegistry.set(id, res);
        })
      )
      .catch(
        action((err) => {
          if (err && err.response && err.response.status !== 404) {
            throw err;
          }

          this.icoRegistry.set(id, null);
        })
      );
  }
}

const IcoStoreInstance = new IcoStore();
export default IcoStoreInstance;