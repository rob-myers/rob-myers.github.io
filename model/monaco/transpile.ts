import * as monaco from 'monaco-editor';
import { getWindow } from '@model/dom.model';
import { IMonacoTextModel, ITransformedCode, IBasicPackageGroup, ITransformedExample } from '@model/monaco';
import { TypeScriptWorker, EmitOutput } from './monaco-typescript.d';
import { _getErrorMessages } from './transpile-helpers';
import { postTransform } from './post-transform';

const win = getWindow<{ transpileLogging?: boolean }>();

/**
 * Transpile the model's current code from TS to JS.
 * This is intentionally not an async function, because debugging within transpiled async functions
 * is next to impossible (?).
 */
export function transpile(model: IMonacoTextModel): Promise<ITransformedCode> {
  const transpiledOutput: ITransformedCode = { error: undefined, output: undefined };
  const filename = model.uri.toString();

  return monaco.languages.typescript
    .getTypeScriptWorker()
    .then((getWorker: (uri: monaco.Uri) => Promise<TypeScriptWorker>) => getWorker(model.uri))
    .then(worker => {
      return worker.getEmitOutput(filename).then((output: EmitOutput) => {
        /**
         * TODO
         * - typescript definition file (d.ts) content is in `output.outputFiles[1]`
         *   because compilerOptions.declaration is `true`.
         * - when storing a module remotely, should store both transpilation and this file
         * - whilst mocking locally we'll need to use such files when working with multiple modules
         */
        // console.log({ output });

        // Get diagnostics to find out if there were any syntax errors (there's also getSemanticDiagnostics
        // for type errors etc, but it may be better to allow the user to just find and fix those
        // via intellisense rather than blocking compilation, since they may be non-fatal)
        return worker.getSyntacticDiagnostics(filename).then(syntacticDiagnostics => {
          syntacticDiagnostics = syntacticDiagnostics.filter(d => d.category === 1 /*error*/);

          if (syntacticDiagnostics.length) {
            // Don't try to run the example if there's a syntax error
            transpiledOutput.error = _getErrorMessages(syntacticDiagnostics, model.getValue());
          } else {
            transpiledOutput.output = output.outputFiles[0].text;
            if (win && win.transpileLogging) {
              console.log('TRANSPILED:');
              console.log(transpiledOutput.output);
            }
          }
          return transpiledOutput;
        });
      });
    })
    .catch(ex => {
      // Log the error to the console so people can see the full stack/etc if they want
      console.error(ex);
      transpiledOutput.error = ex.message;
      return transpiledOutput;
    });
}

/**
 * Transpiles the code and performs post-processing.
 */
export function transpileAndPost(
  model: IMonacoTextModel,
  supportedPackages: IBasicPackageGroup[],
): Promise<ITransformedExample> {
  const code = model.getValue();
  return transpile(model)
    .then(
      (transpileOutput: ITransformedCode): ITransformedExample => {

        if (transpileOutput.error) {
          return transpileOutput;
        }
        const transformedExample = postTransform({
          tsCode: code,
          jsCode: transpileOutput.output,
          returnFunction: true,
          supportedPackages,
        });

        if (transformedExample.output) {
          return {
            ...transformedExample,
            /**
             * TODO eval
             */
            // Pass in the right React in case there's a different global one on the page...
            // component: eval(transformedExample.output)(React),
          };
        }
        return { error: transformedExample.error || 'Unknown error transforming example' };
      },
    )
    .catch(
      (err: string | Error): ITransformedExample => {
        console.error(err);
        return { error: typeof err === 'string' ? err : err.message };
      },
    );
}
