export interface Env {
  key: string;
}

const defaultEnv: Env = {
  key: 'default',
};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(defaultEnv, require('./env').default);
} catch (e) {
  // NOOP
}

export default defaultEnv;
