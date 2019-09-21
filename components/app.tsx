import "gitment/style/default.css";

import React from "react";
import { withRouter, Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";

import Home from "@components/home";
import Test from "@components/test";

interface Props extends RouteComponentProps {}

const App: React.FunctionComponent<Props> = _props => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/test" component={Test} />
      <Redirect to="/" />
    </Switch>
  );
};

export default withRouter(App);
