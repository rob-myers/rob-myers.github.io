import Gitalk from "gitalk";
import env from "@env";

export const gitalk = new Gitalk({
  admin: ["rob-myers"],
  owner: "rob-myers",
  repo: env.gitmentOAuth.repo,
  clientID: env.gitmentOAuth.clientId,
  clientSecret: env.gitmentOAuth.clientSecret,
  id: "test-page-id", // optional
  /**
   * Presumably we'll need to change title per page?
   */
  title: "test-page-title"
});
