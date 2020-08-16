export interface Env {
  key: string;
}

const defaultEnv: Env = {
  key: 'default',
};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(defaultEnv, require('./private').default);
} catch (e) {
  // NOOP
}

export default defaultEnv;
