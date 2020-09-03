import braces from 'braces';
import * as Sh from './parse.service';
import { varService } from './var.service';
import { interpretEscapeSequences } from './parse.util';
import { last } from '@model/generic.model';
import { fileService } from './file.service';

const bracesOpts: braces.Options = {
  expand: true,
  rangeLimit: Infinity,
};

export class ExpandService {
  /**
   * Returns a non-empty array of expansions, or null if no expansions found.
   */
  filePath(pid: number, pattern: string) {
    if (!/\*|\?|\[/.test(pattern)) {// Not a filepath glob
      return null;
    } else if (!this.validateRegexString(pattern, 'Unterminated character class')) {
      return null;// Ignore e.g. /^[ $/
    }

    /** Path to 'directory' we'll start from. */
    const absPath = pattern.startsWith('/') ? '/' : varService.expandVar(pid, 'PWD');
    const matches = fileService.expandFilepath(absPath, pattern);
    return matches.length ? matches : null;
  }

  literal({ Value, parent }: Sh.Lit): string[] {
    if (!parent) {
      throw Error(`Literal must have parent`);
    }
    /**
     * Remove at most one '\\\n'; can arise interactively in quotes,
     * see https://github.com/mvdan/sh/issues/321.
     */
    const value = Value.replace(/\\\n/, '');

    if (parent.type === 'DblQuoted') {
     /**
      * Double quotes: escape only ", \, $, `, no brace-expansion.
      */
      return [value.replace(/\\(["\\$`])/g, '$1')];
    } else if (parent.type === 'TestClause') {
     /**
      * [[ ... ]]: Escape everything, no brace-expansion.
      */
      return [value.replace(/\\(.|$)/g, '$1')];
    } else if (parent.type === 'Redirect') {
     /**
      * Redirection (e.g. here-doc): escape everything, no brace-expansion.
      */
      return [value.replace(/\\(.|$)/g, '$1')];
    }
    /**
    * Otherwise escape everything and apply brace-expansion.
    */
    return braces(value, bracesOpts);
  }

  normalizeWhitespace(word: string, trim = true): string[] {
    if (!word.trim()) {
      return [];// Forbid output [''].
    }
    if (trim) {
      return word.trim().replace(/[\s]+/g, ' ').split(' ');
    }
    // Must preserve single leading/trailing space.
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

  singleQuotes({ Dollar: interpret, Value }: Sh.SglQuoted) {
    return [
      interpret
        ? interpretEscapeSequences(Value)
        : Value
      ];
  }

  private validateRegexString(input: string, badSuffix = ''): boolean {
    try {
      return Boolean(new RegExp(input));
    } catch (e) {// Fail iff error message has bad suffix
      return !(e.message as string).endsWith(badSuffix);
    }
  }

}

export const expandService = new ExpandService;
