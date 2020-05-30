import * as monaco from 'monaco-editor';
import { getWindow } from '@model/dom.model';
import { TypescriptDefaults, IMonacoTextModel, ITransformedCode, PostTransformParams, IDiagnostic } from './monaco.model';
import { TypeScriptWorker, EmitOutput } from './monaco-typescript';

const typesPrefix = 'file:///node_modules/@types';
const win = getWindow<{ transpileLogging?: boolean }>();

export class MonacoService {

  public async loadReactTypes(typescriptDefaults: TypescriptDefaults) {
    typescriptDefaults.addExtraLib(
      //@ts-ignore
      (await import('!raw-loader!@types/react/index.d.ts')).default,
      `${typesPrefix}/react/index.d.ts`,
    );
  }

  // TODO clean
  public async transpile(model: IMonacoTextModel): Promise<ITransformedCode> {
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
              transpiledOutput.error = this.getErrorMessages(syntacticDiagnostics, model.getValue());
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
  
  // TODO clean
  public transpileAndTransform(model: IMonacoTextModel): Promise<ITransformedCode> {
    const code = model.getValue();
    return this.transpile(model).then(
      (transpileOutput: ITransformedCode): ITransformedCode => {
  
        if (transpileOutput.error) {
          return transpileOutput;
        }
        const transformedExample = this.postTransform({
          tsCode: code,
          jsCode: transpileOutput.output,
          returnFunction: true,
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
    ).catch(
      (err: string | Error): ITransformedCode => {
        console.error(err);
        return { error: typeof err === 'string' ? err : err.message };
      },
    );
  }

  private postTransform(params: PostTransformParams): ITransformedCode {
    const {
      tsCode,
      jsCode,
      id: _ = 'content',
      returnFunction: ___,
    } = params;
  
    const code = (jsCode || tsCode).trim();
    console.log(code);
  
    return {
      output: code,
    };
  }

  private getErrorMessages(errors: IDiagnostic[], text: string) {
    const lineStarts = this.getLineStarts(text);
    return errors.map(error => {
      if (error.messageText && typeof error.messageText === 'object') {
        // This is a multi-line ts.DiagnosticMessageChain (not sure if this happens, but handling per typings)
        error.code = error.messageText.code;
        error.messageText = error.messageText.messageText;
      }
  
      if (typeof error.start === 'number') {
        const lineInfo = this.getErrorLineInfo(error, lineStarts);
        return `Line ${lineInfo.line} - ${error.messageText} (TS${error.code})`;
      } else {
        return error.messageText;
      }
    });
  }
  
  private getLineStarts(text: string): number[] {
    const lineStarts: number[] = [0];
    const eol = /\r?\n/g;
    let match: RegExpExecArray | null;
    while ((match = eol.exec(text))) {
      lineStarts.push(match.index + match[0].length);
    }
    return lineStarts;
  }
  
  private getErrorLineInfo(error: IDiagnostic, lineStarts: number[]): { line: number; col: number } {
    let line = 1;
    for (; line < lineStarts.length; line++) {
      if (lineStarts[line] > error.start!) {
        break;
      }
    }
    return { line, col: error.start! - lineStarts[line - 1] + 1 };
  }

}
