import { makeObservable, observable, action, computed } from "mobx";
import { IcoDocuments, Subscriptions } from "../helpers/agent";

class IcoDocumentStore {
  constructor() {
    makeObservable(this, {
      loadingCount: observable,
      documentRegistry: observable,
      dataRegistry: observable,
      errorsRegistry: observable,
      signatureRegistry: observable,
      loading: computed,
      reset: action,
      loadDocument: action,
      prepareFields: action,
      setData: action,
      resetErrors: action,
      setErrors: action,
      resetSignature: action,
      setSignature: action,
      postExtraDocument: action,
    });
  }

  loadingCount = 0;
  documentRegistry = observable.map();
  dataRegistry = observable.map();
  errorsRegistry = observable.map();
  signatureRegistry = observable.map();

  get loading() {
    return this.loadingCount > 0;
  }

  reset() {
    this.documentRegistry.clear();
    this.dataRegistry.clear();
    this.resetErrors();
    this.resetSignature();
  }

  getDocument(documentId) {
    return this.documentRegistry.get(documentId);
  }

  getData(documentId) {
    return this.dataRegistry.get(documentId);
  }

  getErrors(documentId) {
    return this.errorsRegistry.get(documentId);
  }

  getSignature(fieldId) {
    return this.signatureRegistry.get(fieldId);
  }

  loadDocument(documentId, { acceptCached = false } = {}) {
    if (acceptCached) {
      const document = this.getDocument(documentId);

      if (document !== undefined) {
        return Promise.resolve(document);
      }
    }

    this.loadingCount++;

    return IcoDocuments.get(documentId)
      .then(
        action((document) => {
          this.documentRegistry.set(documentId, document);

          this.prepareFields(documentId, document);

          return document;
        })
      )
      .finally(
        action(() => {
          this.loadingCount--;
        })
      );
  }

  prepareFields(documentId, document) {
    const fields = {};

    document.fields.forEach((field) => {
      fields[field.field_name] =
        field.field_type === "FIELD_TYPE_CHECKBOX" ? false : "";
    });

    this.dataRegistry.set(documentId, fields);
  }

  setData(documentId, fieldName, fieldValue) {
    const data = this.getData(documentId);
    const errors = this.getErrors(documentId);

    data[fieldName] = fieldValue;

    if (errors && errors.fields && errors.fields[fieldName]) {
      delete errors.fields[fieldName];
    }
  }

  resetErrors(documentId = null) {
    if (documentId) {
      this.errorsRegistry.delete(documentId);
    } else {
      this.errorsRegistry.clear();
    }
  }

  setErrors(documentId, errors) {
    this.errorsRegistry.set(documentId, errors);
  }

  resetSignature(fieldId = null) {
    if (fieldId) {
      this.signatureRegistry.delete(fieldId);
    } else {
      this.signatureRegistry.clear();
    }
  }

  setSignature(fieldId, data) {
    this.signatureRegistry.set(fieldId, data);
  }

  postExtraDocument(subscriptionId, documentId, data) {
    this.loadingCount++;

    return Subscriptions.extraDocument(subscriptionId, documentId, data)
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
            const errors = {};

            if (err.response.body.err_msg) {
              errors["form"] = err.response.body.err_msg;
            }
            if (err.response.body.fields) {
              errors["fields"] = err.response.body.fields;
            }

            this.setErrors(documentId, errors);
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

const IcoDocumentStoreInstance = new IcoDocumentStore();
export default IcoDocumentStoreInstance;