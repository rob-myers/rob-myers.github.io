// import "./home.scss";
import React, { useEffect } from "react";
import { gitment } from "@service/gitment";

interface Props {}

const Home: React.FunctionComponent<Props> = _props => {
  useEffect(() => {
    if (process.browser) {
      gitment.render("comments");
    }
  }, []);
  return (
    <div>
      <div>Welcome home!</div>
      <div id="comments" />
    </div>
  );
};

export default Home;
