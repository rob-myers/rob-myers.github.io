import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import createStore, { history } from "@store/create-store";
const { store } = createStore();

const Index = () => {
  return (
    <Provider store={store} key="provider">
      {/* <PersistGate loading={null} persistor={persistor}> */}
      <ConnectedRouter history={history}>
        <div>
          {
            "Foo" + "Bar" + "Baz"
          }
        </div>
      </ConnectedRouter>
      {/* </PersistGate> */}
    </Provider>
  );
};

export default Index;