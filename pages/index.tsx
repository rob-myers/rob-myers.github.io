import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import createStore, { history } from "@store/create-store";
import { PersistGate } from "redux-persist/integration/react";

const { store, persistor } = createStore();
import App from "@components/app";

const Index = () => {
  return (
    <Provider store={store} key="provider">
      {
        <PersistGate loading={null} persistor={persistor}>
          <ConnectedRouter history={history}>
            <App />
          </ConnectedRouter>
        </PersistGate>
      }
    </Provider>
  );
};

export default Index;