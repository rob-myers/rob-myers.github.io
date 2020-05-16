import * as monaco from 'monaco-editor';
import { TypeScriptWorker, EmitOutput } from './monaco-typescript.d';
// import { transformExample } from './exampleTransform';
import { _getErrorMessages } from './transpile-helpers';
import { IMonacoTextModel, ITransformedCode } from '@model/monaco';

const win = (typeof window === 'undefined' ? undefined : window) as 
  | (Window & { transpileLogging?: boolean })
  | undefined;

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
