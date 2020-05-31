import * as monaco from 'monaco-editor';
import { TypescriptDefaults, IMonacoTextModel, TranspiledCode, IDiagnostic } from './monaco.model';
import { EmitOutput } from './monaco-typescript';

const typesPrefix = 'file:///node_modules/@types';

export class MonacoService {

  public async loadReactTypes(typescriptDefaults: TypescriptDefaults) {
    typescriptDefaults.addExtraLib(
      //@ts-ignore
      (await import('!raw-loader!@types/react/index.d.ts')).default,
      `${typesPrefix}/react/index.d.ts`,
    );
  }

  public async transpile(model: IMonacoTextModel): Promise<TranspiledCode> {
    try {
      const filename = model.uri.toString();
      const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
      const worker = await getWorker(model.uri);
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

      return {
        key: 'success',
        transpiledJs: emitOutput.outputFiles[0].text,
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
