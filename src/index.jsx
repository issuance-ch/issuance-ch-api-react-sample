import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'mobx-react';
import App from './components/App';
import { serviceWorker } from './helpers/serviceWorker';
import AccountStore from './stores/AccountStore';
import CommonStore from './stores/CommonStore';
import CountriesStore from './stores/CountriesStore';
import CustomerStore from './stores/CustomerStore';
import IcoStore from './stores/IcoStore';
import IcoDocumentStore from './stores/IcoDocumentStore';
import Annex1Store from './stores/Annex1Store';
import Annex2Store from './stores/Annex2Store';
import SubscriptionStore from './stores/SubscriptionStore';
import PolStore from './stores/PolStore';
import ContributionStore from './stores/ContributionStore';
import VideoConferenceStore from './stores/VideoConferenceStore';
import './index.scss';

const stores = {
  AccountStore,
  CommonStore,
  CountriesStore,
  CustomerStore,
  IcoStore,
  IcoDocumentStore,
  Annex1Store,
  Annex2Store,
  SubscriptionStore,
  ContributionStore,
  VideoConferenceStore,
  PolStore,
};

ReactDOM.render(
  <Provider {...stores}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
