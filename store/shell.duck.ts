import * as Redux from '@model/store/redux.model';
import { ParseShService, File } from '@model/sh/parse-sh.service';

export interface State {
  parseSh: ParseShService;
}

const initialState: State = {
  parseSh: new ParseShService,
};

export const Act = {
  // TODO
};

export type Action = Redux.ActionsUnion<typeof Act>;

export const Thunk = {
  parseBuffer: Redux.createThunk(
    '[shell] parse buffer',
    ({ state: { shell } }, { buffer }: { buffer: string[]}) => {
      console.log('PARSING', buffer.slice()); // DEBUG
  
      try {
        // Parser.Interactive expects terminal newline.
        const src = buffer.join('\n') + '\n';
        const { incomplete, parsed } = shell.parseSh.interactiveParse(src);
  
        if (parsed) {// DEBUG
          parsed.StmtList.Stmts.forEach((stmt) => console.log('PARSED', stmt.Cmd));
        }
  
        return incomplete
          ? { key: 'incomplete' }
          : { key: 'complete', parsed: parsed as File, src };
  
      } catch (e) {
        console.error(e);
        return { key: 'failed', error: `${e}` };
      }
    },
  ),
};

export type Thunk = Redux.ActionsUnion<typeof Thunk>;


export const reducer = (state = initialState, _act: Action): State => {
  return state;
};
