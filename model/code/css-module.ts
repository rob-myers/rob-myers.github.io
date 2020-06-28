import { filenameToClassPrefix } from './dev-env.model';

export const getCssModuleCode = (filename: string) => `

const prefix = '${filenameToClassPrefix(filename)}';

function camelToKebab(input) {
  return input.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}

export default new Proxy({}, {
  get(_target, className, _receiver) {
      return \`\${prefix}\${camelToKebab(className)}\`;
  }
});

`.trim();
