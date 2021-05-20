class CodeService {

  /**
   * Expect top-level functions and classes only.
   * We require strict spacing (see regexes below).
   * Each function/class must be terminated by line `}`.
   */
  parseJs(code: string) {
    const lines = code.split('\n');
    const output = {} as Record<string, {
      name: string;
      code: string;
      type: MatchedType;
    }>;
    let [state, name, start] = [null as null | MatchedType, '', 0];
    let contents = [] as string[];

    outer:
    for (const [index, line] of lines.entries()) {
      for (const [key, regex] of regexes) {
        const matched = line.match(regex);
        if (matched) {// Found a function or class
          [name, contents, start, state] = [matched[1], [line], index + 1, key];
          continue outer;
        }
      }

      if (state) {
        contents.push(line);

        if (line === '}') {
          const code = contents.join('\n');
          if (!this.verifyDef(code, state)) {
            return { error: `${contents[0]}: is not a function/class`, line: start }
          }
          output[name] = { name, code, type: state };
          contents.length = 0;
          state = null;
        }
      } else if (!line || line.startsWith('//')) {
        // Ignore line
      } else {
        return { error: `${line}: unexpected nonempty line`, line: index + 1 };
      }
    }
    
    if (contents.length) {
      return { error: `${contents[0]}: not terminated`, line: start };
    }
    return { output };
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

export const codeService = new CodeService;
