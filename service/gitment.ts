import Gitment from "gitment";
import env from "@env";

export let gitment = {} as Gitment;

if (process.browser) {
  gitment = new Gitment({
    id: "test-page-id", // optional
    /**
     * Presumably we'll need to change title per page?
     */
    title: "test-page-title",
    owner: "rob-myers",
    repo: env.gitmentOAuth.repo,
    oauth: {
      client_id: env.gitmentOAuth.clientId,
      client_secret: env.gitmentOAuth.clientSecret
    }
  });
}
