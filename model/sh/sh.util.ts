import braces from 'braces';
import { last } from 'model/generic.model';
import { SigEnum } from './io/io.model';
import type * as Sh from './parse/parse.model';

export function normalizeWhitespace(word: string, trim = true): string[] {
  if (!word.trim()) {// Prevent [''].
    return [];
  } else if (trim) {
    return word.trim().replace(/[\s]+/g, ' ').split(' ');
  }

  // Otherwise preserve single leading/trailing space
  const words = word.replace(/[\s]+/g, ' ').split(' ');
  if (!words[0]) {// ['', 'foo'] -> [' foo']
    words.shift();
    words[0] = ' ' + words[0];
  }
  if (!last(words)) {// ['foo', ''] -> ['foo ']
    words.pop();
    words.push(words.pop() + ' ');
  }
  return words;
}

export interface Expanded {
  key: 'expanded';
  values: any[];
  /** This is values.join(' ') */
  value: string;
}

export function expand(values: string | any[]): Expanded {
  return {
    key: 'expanded',
    values: values instanceof Array ? values : [values],
    value: values instanceof Array ? values.join(' ') : values,
  };
}

export function interpretEscapeSequences(input: string): string {
  return JSON.parse(JSON.stringify(input)
    // '\\e' -> '\\u001b'.
    .replace(/\\\\e/g, '\\u001b')
    // Hex escape-code (0-255) e.g. '\\\\x1b' -> '\\u001b'.
    .replace(/\\\\x([0-9a-f]{2})/g, '\\u00$1')
    // e.g. '\\\\n' -> '\\n'.
    .replace(/\\\\([bfnrt])/g, '\\$1'));
}


const bracesOpts: braces.Options = {
  expand: true,
  rangeLimit: Infinity,
};

export function literal({ Value, parent }: Sh.Lit): string[] {
  if (!parent) {
    throw Error(`Literal must have parent`);
  }
  /**
   * Remove at most one '\\\n'; can arise interactively in quotes,
   * see https://github.com/mvdan/sh/issues/321.
   * Escape square brackets for npm module `braces`.
   */
  const value = Value.replace(/\\\n/, '')
    .replace(/\[/g, '\\[').replace(/\]/g, '\\]');

  if (parent.type === 'DblQuoted') {
    // Double quotes: escape only ", \, $, `, no brace-expansion.
    return [value.replace(/\\(["\\$`])/g, '$1')];
  } else if (parent.type === 'TestClause') {
    // [[ ... ]]: Escape everything, no brace-expansion.
    return [value.replace(/\\(.|$)/g, '$1')];
  } else if (parent.type === 'Redirect') {
    // Redirection (e.g. here-doc): escape everything, no brace-expansion.
    return [value.replace(/\\(.|$)/g, '$1')];
  }
  // Otherwise escape everything and apply brace-expansion.
  return braces(value, bracesOpts);
}

export function singleQuotes({ Dollar: interpret, Value }: Sh.SglQuoted) {
  return [interpret ? interpretEscapeSequences(Value) : Value];
}

export class ShError extends Error {
  constructor(message: string, public exitCode: number, public original?: Error) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ShError.prototype);
  }
}

export class ProcessError extends Error {
  constructor(
    public code: SigEnum,
    public pid: number,
    public sessionKey: string,
  ) {
    super(code);
    Object.setPrototypeOf(this, ProcessError.prototype);
  }
}

export function createKillError(meta: Sh.BaseMeta) {
  return new ProcessError(SigEnum.SIGKILL, meta.pid, meta.sessionKey);
}

export function resolvePath(path: string, root: any, pwd: string) {
  const absParts = path.startsWith('/')
    ? path.split('/')
    : pwd.split('/').concat(path.split('/'));
  return resolveAbsParts(absParts, root);
}

export function resolveParentChild(varPath: string, root: any, pwd: string): (
  | { parent: null; childKey: null }
  | { parent: any; childKey: string }
) {
  const absParts = varPath.startsWith('/')
    ? varPath.split('/')
    : pwd.split('/').concat(varPath.split('/'));
  const childKey = absParts.pop();
  return childKey
    ? { parent: resolveAbsParts(absParts, root), childKey }
    : { parent: null, childKey: null };
}

export function normalizeAbsParts(parts: string[]) {
  return parts.reduce((agg, item) => {
    if (!item || item === '.') return agg;
    if (item === '..') return agg.slice(0, -1);
    return agg.concat(item);
  }, [] as string[]);
}

export function resolveNormalized(parts: string[], root: any) {
  return parts.reduce((agg, item) => agg[item], root)
}

export function resolveAbsParts(absParts: string[], root: any): any {
  return resolveNormalized(normalizeAbsParts(absParts), root);
}
