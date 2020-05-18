/* eslint-disable @typescript-eslint/camelcase */
import env from '@env/index';
import { GitHubUser } from './gitalk.model';

const defaultAuthor: GitHubUser = {
  avatarUrl: '//avatars1.githubusercontent.com/u/29697133?s=50',
  login: 'null',
  url: '',
};

export interface GitalkRequiredOpts {
  /** GitHub Application Client ID. */
  clientID: string;
  /** GitHub Application Client Secret. */
  clientSecret: string;
  /** GitHub repository. */  
  repo: string;
  /** GitHub repository owner. */
  owner: string;
  /**
   * Owner or collaborators of the GitHub repository
   * i.e. users with write access to this repository.
   */
  admin: string[];
}

export interface GitalkOptions extends GitalkRequiredOpts {
  /**
   * The unique identifier of the page (length less than `50`).
   * Default `location.href`.
   */
  id?: string;
  /**
   * The issue ID of the page, if the number attribute is not defined, the id will be used for positioning.
   * Default: `-1`.
   */  
  number?: number;
  /**
   * GitHub issue tags.
   * Default `['Gitalk']`.
   */
  labels?: string[];  
  /**
   * Title of the GitHub issue.
   * Default `document.title`.
   */
  title?: string;
  /**
   * Content of the GitHub issue.
   * Default `${location.href}$ (issue)`.
   */
  body?: string;
  /**
   * Default `navigator.language || navigator.userLanguage`.
   * Set language support e.g. `en`, `zh-CN`, `zh-TW`.
   */  
  language?: string;
  /**
   * Number of comments loaded each time, up to 100.
   * Default `10`.
   */
  perPage?: number;
  /**
   * Full-screen masking effect, similar to Facebook comment box.
   * Default `false`.
   */
  distractionFreeMode?: boolean;
  /**
   * Comment sorting method i.e. last/first created comment.
   * Default `last`.
   */
  pageDirection?: 'last' | 'first';
  /**
   * If there is no corresponding isssue on the current page and
   * the logged-in user belongs to admin, an issue will be automatically created.
   * But if set to true, an initialization page is displayed,
   * and you need to click the init button to create an issue.
   * Default `false`.
   */
  createIssueManually?: boolean;
  /**
   * Use a reverse proxy to get around CORS issue for GitHub oauth.
   * Probably best to create your own free cors-anywhere server e.g.
   * on Heroku or Now, whitelisting only your domain.
   * Default `https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token`.
   */
  oauthCorsProxy?: string;
  /**
   * Enable shortcut key (cmdctrl + enter) to submit comments.
   * Default `true`.
   */
  enableHotKey?: boolean;
  /**
   * Default is `defaultAuthor`.
   */
  defaultAuthor?: GitHubUser;
}

function computeOpts(opts: GitalkOptions): Required<GitalkOptions> {
  return {
    id: location.href,
    number: -1,
    labels: ['Gitalk'] ,
    title: document.title,
    body:  `${location.href} (issue)`,
    language: navigator.language,
    perPage: 10,
    distractionFreeMode: false,
    pageDirection: 'last',
    createIssueManually: false,
    oauthCorsProxy: 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token',
    enableHotKey: true,
    defaultAuthor,
    ...opts,
  };
}

let _gitalkOpts: Required<GitalkOptions>;

export function getGitalkOpts() {
  return _gitalkOpts || (_gitalkOpts = computeOpts({
    ...env.gitalk,
    id: 'test-page-id', // TODO
    title: 'test-page-title' // TODO
  }));
}
