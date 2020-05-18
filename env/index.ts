import { GitalkRequiredOpts } from '@components/gitalk/gitalk-opts.model';

export interface Env {
  gitalk: GitalkRequiredOpts;
}

const defaultEnv: Env = {
  gitalk:  {
    admin: ['__ADMIN__'],
    clientID: '__CLIENT_ID__',
    clientSecret: '__CLIENT_SECRET__',
    owner: '__OWNER__',
    repo: '__REPO__',
  },
};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(defaultEnv, require('./env'));
} catch (e) {
  // NOOP
}

export default defaultEnv;
