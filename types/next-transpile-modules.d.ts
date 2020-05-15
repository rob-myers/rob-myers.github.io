
declare module 'next-transpile-modules' {
  import { NextJsConfig } from './scripts/next.model';
  
  export default function(
    modulePaths: string[]
  ): (config: NextJsConfig) => NextJsConfig;
}
