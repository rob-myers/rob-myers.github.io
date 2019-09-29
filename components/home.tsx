// import "./home.scss";
import React, { useEffect } from "react";
import { ThemeProvider } from "theme-ui";
import { gitalk } from "@service/gitalk";
import Layout from "./layout/layout";
import theme from "./theme";

interface Props {}

const Home: React.FunctionComponent<Props> = _props => {
  useEffect(() => {
    gitalk.render("gitalk_comments_home");
  }, []);
  return (
    <div>
      <ThemeProvider theme={theme}>
        <Layout title={"Foo bar baz qux"} />
      </ThemeProvider>

      <div>Welcome home!</div>
      <div id="gitalk_comments_home" />
    </div>
  );
};

export default Home;
