import braces from 'braces';
import * as Sh from './parse.service';
import { interpretEscapeSequences } from './parse.util';
import { ParameterDef } from './parameter.model';

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
    * Otherwise: escape everything, apply brace-expansion.
    */
    return braces.expand(value);
  }

  parameter(node: Sh.WordPart) {

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
