import "@src/index.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ConnectedRouter } from "connected-react-router";

import { setConfig } from "react-hot-loader";
setConfig({ logLevel: "debug" });

import App from "@src/components/app";
import createStore, { history } from "@src/store/create-store";

const root = document.getElementById("root") as HTMLElement;
const { store, persistor } = createStore();

const renderApp = () =>
  ReactDOM.render(
    // tslint:disable-next-line: jsx-wrap-multiline
    <Provider store={store} key="provider">
      <PersistGate loading={null} persistor={persistor}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </PersistGate>
    </Provider>,
    root
  );

renderApp();
