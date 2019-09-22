declare module "gitalk" {
  export default class Gitalk {
    constructor(opts: {
      /** Required. GitHub Application Client ID. */
      clientID: string;
      /** Required. GitHub Application Client Secret. */
      clientSecret: string;
      /** Required. GitHub repository. */
      repo: string;
      /** Required. GitHub repository owner. Can be personal user or organization. */
      owner: string;
      /** Required. GitHub repository owner and collaborators. (Users who having write access to this repository) */
      admin: string[];
      /**
       * Default: location.href.
       * The unique id of the page. Length must less than 50.
       */
      id: string;
      /**
       * Default: -1.
       * The issue ID of the page, if the number attribute is not defined, issue will be located using id.
       */
      number?: number;
      /**
       * Default: ['Gitalk'].
       * GitHub issue labels.
       */
      labels?: string[];
      /**
       * Default: document.title.
       * GitHub issue title.
       */
      title: string;
      /**
       * Default: location.href + header.meta[description].
       * GitHub issue body.
       */
      body?: string;
      /**
       * Default: navigator.language || navigator.userLanguage.
       * Localization language key, en, zh-CN and zh-TW are currently available.
       */
      language?: string;
      /**
       * Default: 10.
       * Pagination size, with maximum 100.
       */
      perPage?: number;
      /**
       * Default: false.
       * Facebook-like distraction free mode.
       */
      distractionFreeMode?: boolean;
      /**
       * Default: 'last'
       * Comment sorting direction, available values are last and first.
       */
      pagerDirection?: string;
      /**
       * Default: false.
       * By default, Gitalk will create a corresponding github issue for your every single page automatically when the logined user is belong to the admin users. You can create it manually by setting this option to true.
       */
      createIssueManually?: boolean;
      /**
       * Default https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token.
       * GitHub oauth request reverse proxy for CORS. [Why need this?](https://github.com/isaacs/github/issues/330)
       */
      proxy?: string;
      /**
       * Default:
       * ```
       * {
       *  staggerDelayBy: 150,
       *  appearAnimation: 'accordionVertical',
       *  enterAnimation: 'accordionVertical',
       *  leaveAnimation: 'accordionVertical',
       * }
       * ```
       * Comment list animation. [Reference](https://github.com/joshwcomeau/react-flip-move/blob/master/documentation/enter_leave_animations.md).
       */
      flipMoveOptions?: any;
      /**
       * Default: true.
       * Enable hot key (cmd|ctrl + enter) submit comment.
       */
      enableHotKey?: boolean;
    });

    public render(elementId: string): void;
  }
}
