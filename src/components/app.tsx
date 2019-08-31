import * as React from "react";
import {
  withRouter,
  Switch,
  Route,
  Redirect,
  RouteComponentProps
} from "react-router-dom";
import { hot } from "react-hot-loader/root";
import Home from "@src/components/home/home";
import Test from "@src/components/test/test";

interface Props extends RouteComponentProps {}

const appComponent: React.FunctionComponent<Props> = _props => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/test" component={Test} />
    <Redirect to="/" />
  </Switch>
);

export default hot(withRouter(appComponent));
