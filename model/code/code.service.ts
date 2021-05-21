import { cmdService } from "model/sh/cmd.service";
import useSessionStore from "store/session.store";

class CodeService {

  jsToSession(sessionKey: string, { output }: ParsedJsCode) {
    // console.info(sessionKey, output);
    const funcDef = {} as { [funcName: string]: string };

    for (const { name, code, type } of Object.values(output)) {
      switch (type) {
        case 'func':
        case 'async': 
          funcDef[name] = `{ call '${code}' "$@"; }`;
          break;
        case '*func':
          funcDef[name] = `{ run '${
            code.slice('function *'.length + name.length)
          }' "$@"; }`;
          break;
        case 'async*':
          funcDef[name] = `{ run '${
            code.slice('async function *'.length + name.length)
          }' "$@"; }`;
          break;
        case 'class':
          const Class = Function(`return ${code}`)();
          const instanceName = name[0].toLowerCase() + name.slice(1);
          cmdService.baseLibProxy[instanceName] = new Class(cmdService.libProxy);
          break;
      }
    }

    const { ttyShell } = useSessionStore.api.getSession(sessionKey);
    ttyShell.loadShellFuncs(funcDef);
  }
  
  /**
   * Expect top-level functions and classes only.
   * We require strict spacing (see regexes below).
   * Each function/class must be terminated by line `}`.
   */
  parseJs(code: string): CodeError | ParsedJsCode {
    const lines = code.split('\n');
    const output = {} as ParsedJsCode['output'];
    let [state, name, start] = [null as null | MatchedType, '', 0];
    let contents = [] as string[];

    outer:
    for (const [index, line] of lines.entries()) {
      
      if (line.includes("'")) {
        return {
          key: 'error',
          error: `${line} must not contain any single-quote i.e. '`,
          line: index + 1,
        };
      }

      for (const [key, regex] of regexes) {
        const matched = line.match(regex);
        if (matched) {// Found a function or class
          if (state) {
            // Found another function/class before ending the current oone
            return {
              key: 'error',
              error: `${contents[0]} terminated unexpectedly`,
              line: start, 
            };
          }
          [name, contents, start, state] = [matched[1], [line], index + 1, key];
          continue outer;
        }
      }

      if (state) {
        contents.push(line);

        if (line === '}') {
          const code = contents.join('\n');
          if (!this.verifyDef(code, state)) {
            return {
              key: 'error',
              error: `${contents[0]} is not a valid ${state === 'class' ? 'class' : 'function'}`,
              line: start,
            };
          }
          output[name] = { name, code, type: state };
          contents.length = 0;
          state = null;
        }
      } else if (!line || line.startsWith('//')) {
        // Ignore line
      } else {
        return {
          key: 'error',
          error: `${line}: unexpected nonempty line`,
          line: index + 1,
        };
      }
    }
    
    if (contents.length) {
      return {
        key: 'error',
        error: `${contents[0]}: not terminated`,
        line: start,
      };
    }
    return { key: 'parsed', output };
  }

  private verifyDef(def: string, type: MatchedType) {
    try {
      const value = Function(`return ${def}`)();
      switch (type) {
        case 'func':
          return value.constructor.name === 'Function';
        case 'async':
          return value.constructor.name === 'AsyncFunction';
        case '*func': 
          return value.constructor.name === 'GeneratorFunction';
        case 'async*':
          return value.constructor.name === 'AsyncGeneratorFunction';
        case 'class': 
          return value.constructor.name === 'Function'
            && !!value.prototype?.constructor.name;
      }
    } catch {
      return false;
    }
  }

}

const funcRegex = /^function ([^\s*]+)\([^\)]*\) \{$/;
const asyncFuncRegex = /^async function ([^\s*]+)\([^\)]*\) \{$/;
const generatorRegex = /^function \*(\S+)\([^\)]*\) \{$/;
const asyncGeneratorRegex = /^async function \*(\S+)\([^\)]*\) \{$/;
const classRegex = /^class (\S+) \{$/;

type MatchedType = 'func' | 'async' | '*func' | 'async*' | 'class';

const regexes = Object.entries({
  func: funcRegex,
  async: asyncFuncRegex,
  '*func': generatorRegex,
  'async*': asyncGeneratorRegex,
  class: classRegex,
}) as [MatchedType, RegExp][];

export interface CodeError {
  key: 'error';
  error: string;
  line: number;
}

export interface ParsedJsCode {
  key: 'parsed';
  output: Record<string, {
    name: string;
    code: string;
    type: MatchedType;
  }>;
}

export const codeService = new CodeService;
