import braces from 'braces';
import * as Sh from './parse.service';
import { last } from '@model/generic.model';

const bracesOpts: braces.Options = {
  expand: true,
  rangeLimit: Infinity,
};

class ExpandService {
  /**
   * Given interactive input to shell, interpret escape sequences.
   * TODO Refactor as single pass of string.
   */
  private interpretEscapeSequences(input: string): string {
    const value = JSON.stringify(input)
      // Unicode utf-16 e.g. '\\\\u001b' -> '\\u001b'.
      .replace(/\\\\u([0-9a-f]{4})/g, '\\u$1')
      // Replace double backslashes by their unicode.
      .replace(/\\\\\\\\/g, '\\u005c')
      // '\\\\e' -> '\\u001b'.
      .replace(/\\\\e/g, '\\u001b')
      // Hex escape-code (0-255) e.g. '\\\\x1b' -> '\\u001b'.
      .replace(/\\\\x([0-9a-f]{2})/g, '\\u00$1')
      // e.g. '\\\\n' -> '\\n'.
      .replace(/\\\\([bfnrt])/g, '\\$1')
      // Vertical tab '\\\\v' -> '\u000b'
      .replace(/\\\\v/g, '\\u000b')
      // Alert/Bell '\\\\a' -> '\u0007'
      .replace(/\\\\a/g, '\\u0007')
      // Octal escape-code (0-255) e.g. '\\\\047' -> '\\u0027'.
      // Out-of-bounds become `?`.
      .replace(/\\\\([0-7]{3})/g,
        (_, submatch) => {
          const decimal = parseInt(submatch, 8);
          return decimal < 256
            ? `\\u00${decimal.toString(16)}`
            : '?';
        });

    return JSON.parse(value) as string;
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
        ? this.interpretEscapeSequences(Value)
        : Value
      ];
  }
}

export const expandService = new ExpandService;
