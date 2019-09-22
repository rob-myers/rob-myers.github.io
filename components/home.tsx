// import "./home.scss";
import React, { useEffect } from "react";
import { gitalk } from "@service/gitalk";

interface Props {}

const Home: React.FunctionComponent<Props> = _props => {
  useEffect(() => {
    gitalk.render("gitalk_comments_home");
  }, []);
  return (
    <div>
      <div>Welcome home!</div>
      <div id="gitalk_comments_home" />
    </div>
  );
};

export default Home;
