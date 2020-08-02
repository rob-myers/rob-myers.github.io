import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { TypescriptDefaults, IMonacoTextModel, TsTranspilationResult, IDiagnostic } from './monaco.model';
import { EmitOutput } from './monaco-typescript';

export class MonacoService {

  public async loadGlobalTypes(typescriptDefaults: TypescriptDefaults) {
    await Promise.all([
      /**
       * Support Array.flatMap
       */
      (async () => typescriptDefaults.addExtraLib(
        //@ts-ignore
        (await import('!raw-loader!./lib.es2019.array.d.ts')).default,
      ))(),
      /**
       * React typings.
       */
      (async () => typescriptDefaults.addExtraLib(
        //@ts-ignore
        (await import('!raw-loader!@types/react/index.d.ts')).default,
        'file:///node_modules/@types/react/index.d.ts',
      ))(),
      /**
       * Scss modules.
       */
      Promise.resolve(typescriptDefaults.addExtraLib(
        `declare module '*.scss' {
          const content: {[className: string]: string};
          export default content;
        }`,
      )),
    ]);
  }

  /**
   * NOTE sass worker not exposed, so can't do this for styles.
   */
  public async transpileTsModel(model: IMonacoTextModel): Promise<TsTranspilationResult> {
    try {
      const filename = model.uri.toString();
      const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
      const worker = await getWorker(model.uri);
      const src = model.getValue();
      const emitOutput: EmitOutput = await worker.getEmitOutput(filename);

      const diagnostics = (await Promise.all([
        worker.getSyntacticDiagnostics(filename),
        worker.getSemanticDiagnostics(filename),
      ])).flatMap(x => x);
      const errors = diagnostics.filter(d => d.category === 1);
  
      if (errors.length) {
        return {
          key: 'error',
          message: this.getErrorMessages(diagnostics, model.getValue()),
        };
      }

      if (filename.endsWith('.d.ts')) {
        return { key: 'success', src, js: '', typings: '' };
      }

      return {
        key: 'success',
        src,
        js: emitOutput.outputFiles[0].text,
        typings: emitOutput.outputFiles[1].text,
      };

    } catch (e) {
      console.error(e);
      return { key: 'error', message: e.message };
    }
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
