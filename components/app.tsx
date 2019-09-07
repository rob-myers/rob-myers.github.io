import * as React from "react";
import {
  withRouter,
  Switch,
  Route,
  Redirect,
  RouteComponentProps
} from "react-router-dom";

import Home from "@components/home";
import Test from "@components/test";

interface Props extends RouteComponentProps { }

const appComponent: React.FunctionComponent<Props> = _props => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/test" component={Test} />
    <Redirect to="/" />
  </Switch>
);

export default withRouter(appComponent);
