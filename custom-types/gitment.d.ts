declare module "gitment" {
  export default class Gitment {
    constructor(opts: {
      id: string;
      owner: string;
      repo: string;
      oauth: {
        client_id: string;
        client_secret: string;
      };
      /** Must be non-empty. */
      title: string;
    });

    public render(elementId: string): void;
  }
}
