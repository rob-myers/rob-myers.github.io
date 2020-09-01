import braces from 'braces';
import * as Sh from './parse.service';
import { interpretEscapeSequences } from './parse.util';
import { ParameterDef } from './parameter.model';
import { last } from '@model/generic.model';

export class ExpandService {

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
    return braces.expand(value);
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

  parameter(node: Sh.WordPart) {
    /**
     * TODO
     */
    return [];
  }

  singleQuotes({ Dollar: interpret, Value }: Sh.SglQuoted) {
    return [
      interpret
        ? interpretEscapeSequences(Value)
        : Value
      ];
  }

}

export const expandService = new ExpandService;
