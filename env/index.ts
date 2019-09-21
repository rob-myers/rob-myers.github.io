import { AppConfig } from "@model/config.model";

let config: AppConfig;

const fallbackConfig: AppConfig = {
  environment: "development",
  gitmentOAuth: {
    repo: "__GITHUB_REPO_WHERE_COMMENTS_ARE_KEPT__",
    clientId: "__OAUTH_CLIENT_ID_FROM_GITHUB__",
    clientSecret: "__OAUTH_CLIENT_SECRET_FROM_GITHUB__"
  }
};

try {
  config = require(`./${process.env.NODE_ENV}`).default;
} catch (e) {
  try {
    config = require("./development").default;
  } catch (e) {
    config = fallbackConfig;
  }
}

export default config;
