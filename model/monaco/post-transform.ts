import { ITransformedCode } from './transformed.model';
import { IBasicPackageGroup } from './packages.model';

export function postTransform(params: PostTransformParams): ITransformedCode {
  const {
    tsCode,
    jsCode,
    id: _ = 'content',
    supportedPackages: __,
    returnFunction: ___,
  } = params;

  const code = (jsCode || tsCode).trim();
  console.log('jsCode', jsCode);

  return {
    output: code,
  };
}

export interface PostTransformParams {
  /**
   * TS for the example. Will be used to find imports/exports. Will also be used in the final
   * returned code if `jsCode` is not provided.
   */
  tsCode: string;

  /**
   * The example transpiled into JS, output module format ES2015 or ESNext.
   * Will be used in the final returned code if provided.
   */
  jsCode?: string;

  /**
   * If false, the returned code will end with a `ReactDOM.render(...)` line and won't be wrapped
   * in a function.
   * If true, the returned code will be wrapped in a function of type `ExampleWrapperFunction`,
   * which should be called with the correct local version of React (to avoid hook errors due to
   * React mismatches in case there's a global React) and returns the component.
   */
  returnFunction?: boolean;

  /** ID for the component to be rendered into (required unless `returnFunction` is true) */
  id?: string;

  /** Supported package groups (React is implicitly supported) */
  supportedPackages: IBasicPackageGroup[];
}
