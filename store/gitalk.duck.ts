/* eslint-disable @typescript-eslint/camelcase */
import { KeyedLookup } from '@model/generic.model';
import { GitHubUser, GitHubComment, getUserInfo, getIssue, getComments, formatErrorMsg, storeAccessToken } from '@components/gitalk/gitalk.model';
import { createAct, ActionsUnion } from '@model/redux.model';
import { createThunk } from '@model/root.redux.model';
import { getGitalkOpts } from '@components/gitalk/gitalk-opts.model';

export interface State {
  status: 'initial' | 'ready' | 'failed';
  errorMsg: null | string;
  user: null | GitHubUser;

  issue: KeyedLookup<{
    key: string;
    /** Issue number */
    number: number;
    commentsUrl: string;
    htmlUrl: string;
    comments: GitHubComment[];
  }>;
}

const initialState: State = {
  status: 'initial',
  errorMsg: null,
  user: null,
  issue: {},
};

export const Act = {
  updateGitalk: (updates: Partial<State>) =>
    createAct('[gitalk] update', { updates }),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  initialFetch: createThunk(
    '[gitalk] initial fetch',
    async ({ dispatch }, _) => {
      const { user } = await getUserInfo();
      const { issue } = await getIssue(user);
      if (issue) {
        await getComments(issue);
      }
      dispatch(Act.updateGitalk({ status: 'ready', user }));
      if (issue) {
        // TODO add 'empty' issue
      }
    },
  ),
  handleLogin: createThunk(
    '[gitalk] handle login',
    async ({ dispatch }, { url }: { url: string }) => {
      const urlInstance = new URL(url);
      const code = urlInstance.searchParams.get('code');

      if (code) {
        urlInstance.searchParams.delete('code');
        history.replaceState(null, 'Logged in via GitHub', `${urlInstance}`);
  
        const gitalkOpts = getGitalkOpts();
        const response = await fetch(gitalkOpts.oauthCorsProxy, {
          method: 'post',
          body: JSON.stringify({
            code,
            client_id: gitalkOpts.clientID,
            client_secret: gitalkOpts.clientSecret,
          }),
        });
  
        try {
          const { access_token } = await response.json() as { access_token: string };
          if (access_token) {
            storeAccessToken(access_token);
            dispatch(Thunk.initialFetch({}));
          } else {// No access token
            dispatch(Act.updateGitalk({
              status: 'failed',
              errorMsg: formatErrorMsg(new Error('no access token'))
            }));
          }
        } catch (err) {
          console.log('err:', err);
          dispatch(Act.updateGitalk({
            status: 'failed',
            errorMsg: formatErrorMsg(err),
          }));
        }
      } else {
        try {
          dispatch(Thunk.initialFetch({}));
        } catch (e) {
          console.log('err:', e);
          dispatch(Act.updateGitalk({
            status: 'failed',
            errorMsg: formatErrorMsg(e),
          }));
        }
      }
    }
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[gitalk] update': return { ...state,
      ...act.pay.updates,
    };
    default: return state;
  }
};
