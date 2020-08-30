import * as Sh from '@model/shell/parse.service';

export class ExpandService {

  literal(node: Sh.WordPart) {

    return [];
  }

  parameter(node: Sh.WordPart) {

    return [];
  }

  singleQuotes(node: Sh.WordPart) {

    return [];
  }

}

export const expandService = new ExpandService;
