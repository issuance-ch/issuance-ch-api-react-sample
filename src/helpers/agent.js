import superagent from 'superagent';
import CommonStore from '../stores/CommonStore';
import AccountStore from '../stores/AccountStore';
import { API_ROOT } from '../config';

const tokenPlugin = req => {
  if (CommonStore.token) {
    req.set('Authorization', `Bearer ${CommonStore.token}`);
  }
};

const handleErrors = err => {
  if (err && err.response && err.response.status === 401) {
    AccountStore.logout();
  }

  throw err;
};

const responseBody = res => {
  return res.body
};

const requests = {
  del: url =>
    superagent
      .del(`${API_ROOT}${url}`)
      .use(tokenPlugin)
      .then(responseBody)
      .catch(handleErrors)
  ,
  get: url =>
    superagent
      .get(`${API_ROOT}${url}`)
      .use(tokenPlugin)
      .then(responseBody)
      .catch(handleErrors)
  ,
  getBlob: url =>
    superagent
      .get(`${API_ROOT}${url}`)
      .responseType('blob')
      .use(tokenPlugin)
      .then(responseBody)
      .catch(handleErrors)
  ,
  patch: (url, body) =>
    superagent
      .patch(`${API_ROOT}${url}`, body)
      .use(tokenPlugin)
      .then(responseBody)
      .catch(handleErrors)
  ,
  post: (url, body) =>
    superagent
      .post(`${API_ROOT}${url}`, body)
      .use(tokenPlugin)
      .then(responseBody)
      .catch(handleErrors)
};

const Accounts = {
  register: (username, email, plainPassword) => {
    let data = { username, email, plainPassword, telephone: '', confirmBy: 'email' };
    if (window.sessionStorage.getItem('referral')) {
      data.referal = window.sessionStorage.getItem('referral');
    }
    return requests.post('/register', data);
  },
  validate: (code) =>
    requests.post('/validate', { code }),
  validateResend: (email) =>
    requests.post('/validate/resend', { email, confirmBy: 'email' }),
  login: (username, password) =>
    requests.post('/auth_token', { username, password }),
  passwordResetRequest: (email) =>
    requests.post('/account/reset-password/request', { email }),
  passwordResetUpdate: (token, password) =>
    requests.post('/account/reset-password/update', { token, password }),
};

const Countries = {
  list: () =>
    requests.get('/countries')
};

const Customers = {
  me: () =>
    requests.get('/customers/me'),
};

const Icos = {
  list: () =>
    requests.get('/icos'),
  logo: (id) =>
    requests.getBlob(`/icos/${id}/logo`),
  ico: (id) =>
    requests.get(`/icos/${id}`)
};

const IcoDocuments = {
  list: (icoId) =>
    requests.get(`/ico/${icoId}/extra-documents`),
  get: (documentId) =>
    requests.get(`/extra-documents/${documentId}`),
};

const Annexes = {
  postAnnex1: (subscriptionId, data) =>
    requests.post(`/subscriptions/${subscriptionId}/annex1/simple`, {
      place: data.place,
      sign: data.sign
    }),
  postAnnex2: (subscriptionId, data) =>
    requests.post(`/subscriptions/${subscriptionId}/annex2`, data),
};

const Pol = {
  submitPol: (caseId, ocrData, subscription) =>
    requests.post(`/id-check`, {
      caseId,
      ocrData,
      subscription
    }),

};

const Contribution = {
  patchContribution: (subscriptionId, data, coupon, simulation = true) => {
    if (coupon) {
      data.coupon = coupon;
    }
    data.simulation = simulation;
    return requests.patch(`/subscriptions/${subscriptionId}/contribution`, data)
  },
  getContributionEstimation: (subscriptionId, data, coupon, simulation = true) => {
    if (coupon) {
      data.coupon = coupon;
    }
    data.simulation = simulation;
    return requests.post(`/subscriptions/${subscriptionId}/share-price-estimation`, data)
  },

  checkCoupon: (icoId, couponCode) => {
    return requests.get(`/icos/${icoId}/coupon?code=${couponCode}`)
  }
};

const Subscriptions = {
  list: () =>
    requests.get('/subscriptions'),
  get: (id) =>
    requests.get(`/subscriptions/${id}`),
  delete: (id) =>
    requests.del(`/subscriptions/${id}`),
  create: (icoId, registerAs) =>
    requests.post('/subscriptions', { ico: icoId, register_as: registerAs }),
  patch: (id, data) =>
    requests.patch(`/subscriptions/${id}`, data),
  getFillStatus: (id) =>
    requests.get(`/subscriptions/${id}/fill-status`),
  uploadFile: (id, filename, file, type, iHaveNoMrz) => {
    let data = { filename, file, type };
    if (iHaveNoMrz) {
      data.no_mrz_uploaded = true;
    }
    return requests.post(`/subscriptions/${id}/files`, data)
  },
  patchFile: (id, iHaveNoMrz) => {
    let data = {
      "no_mrz_uploaded": !!iHaveNoMrz
    };
    return requests.patch(`/file/${id}`, data)
  },
  extraDocument: (id, documentId, data) =>
    requests.post(`/subscriptions/${id}/extra-document/${documentId}`, data),
  finalize: (id, data) =>
    requests.post(`/subscriptions/${id}/submit`, data),
  patchPaymentStatus: (id, data) =>
    requests.patch(`/subscriptions/${id}/payment-status`, data),
};

const VideoConference = {
  list: () =>
    requests.get('/video-conference-planning/slots'),
  book: (slotId, subscriptionId, preferredLanguage) =>
    requests.post('/video-conference-planning/slots/book', {
      slot_id: slotId,
      subscription_id: subscriptionId,
      preferred_language: preferredLanguage
    }),
};

export { Accounts, Countries, Customers, Icos, IcoDocuments, Annexes, Subscriptions, Contribution, VideoConference, Pol };
