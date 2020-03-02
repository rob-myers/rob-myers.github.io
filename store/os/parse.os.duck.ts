import { OsThunkAct, createOsThunk } from '@model/os/os.redux.model';
import { OsAct } from '@model/os/os.model';
import * as ParsedSh from '@os-service/parse-sh.service';
import { Term, Builtin, DeclareBuiltinType, BinaryComposite, CompositeType } from '@model/os/term.model';
import { BuiltinType, BuiltinBinary } from '@model/sh/builtin.model';
import { BinaryType } from '@model/sh/binary.model';
import { ExpandType } from '@model/sh/expand.model';
import { TermSourceMap } from '@model/sh/base-term';
import { last } from '@model/generic.model';

export type Thunk = (
  | CloneTermThunk
  | CreateBinaryThunk
  | CreateBuiltinThunk
  | DistributeSrcThunk
  | ParseBufferThunk
  | TranspileShThunk
  | WalkTermThunk
);

export const osCloneTerm = createOsThunk<OsAct, CloneTermThunk>(
  OsAct.OS_CLONE_TERM_THUNK,
  ({ service }, { term }) => service.term.cloneTerm(term),
);
interface CloneTermThunk extends OsThunkAct<OsAct, { term: Term | Term[] }, Term> {
  type: OsAct.OS_CLONE_TERM_THUNK;
}

export const osCreateBinaryThunk = createOsThunk<OsAct, CreateBinaryThunk>(
  OsAct.OS_CREATE_BINARY_THUNK,
  ({ service }, { binaryKey, args }) => service.term.createBinary({ binaryKey, args }),
);
interface CreateBinaryThunk extends OsThunkAct<OsAct, { binaryKey: BinaryType; args: string[] }, BinaryComposite | BuiltinBinary> {
  type: OsAct.OS_CREATE_BINARY_THUNK;
}

export const osCreateBuiltinThunk = createOsThunk<OsAct, CreateBuiltinThunk>(
  OsAct.OS_CREATE_BUILTIN_THUNK,
  ({ service }, { builtinKey, args }) => service.term.createBuiltin({ builtinKey, args }),
);
interface CreateBuiltinThunk extends OsThunkAct<OsAct, {
  builtinKey: Exclude<BuiltinType, DeclareBuiltinType>;
  args: string[];
}, Builtin> {
  type: OsAct.OS_CREATE_BUILTIN_THUNK;
}

/**
 * Distribute source code to subterms.
 * Remember the source for new processes.
 * Remember the source for functions.
 * TODO what about augmenting the source-maps?
 */
export const osDistributeSrcThunk = createOsThunk<OsAct, DistributeSrcThunk>(
  OsAct.OS_DISTRIBUTE_SRC_THUNK,
  ({ service }, { term, src }) => service.term.walkTerm(
    term,
    (subterm) => {
      if (
        subterm.key === CompositeType.subshell ||
        subterm.key === CompositeType.expand && (
          subterm.expandKey === ExpandType.command ||
          subterm.expandKey === ExpandType.process
        )
      ) {
        // Attach source to subterm, spanning all children
        const { cs } = subterm.def;
        if (!cs.length) {// No source.
          subterm.def.src = '';
          return;
        }
        const from = (cs[0].def.sourceMap as TermSourceMap).from.offset;
        const to = ((last(cs) as Term).def.sourceMap as TermSourceMap).to.offset;
        subterm.def.src = src.slice(from, to);
      } else if (subterm.key === CompositeType.function) {
        // Attach source to function body
        const sm = subterm.def.body.def.sourceMap;
        sm && (subterm.def.src = src.slice(sm.from.offset, sm.to.offset));
      } else if (subterm.key === CompositeType.pipe) {
        // Attach source to each child
        for (const c of subterm.def.cs) {
          const sm = c.def.sourceMap;
          sm && (c.def.src = src.slice(sm.from.offset, sm.to.offset));
        }
      } else if (subterm.key === CompositeType.redirect && subterm.def.sourceMap) {
        // Attach source to redirects in case of exec
        // TODO fix
        const sm = subterm.def.sourceMap;
        subterm.def.src = src.slice(sm.from.offset, sm.to.offset);
      }
    }
  ),
);
interface DistributeSrcThunk extends OsThunkAct<OsAct, { term: Term; src: string }, void> {
  type: OsAct.OS_DISTRIBUTE_SRC_THUNK;
}

/**
 * Attempt to parse interactive shell code stored in buffer of process.
 */
export const osParseBufferThunk = createOsThunk<OsAct, ParseBufferThunk>(
  OsAct.OS_PARSE_BUFFER_THUNK,
  ({ state: { os: { proc } }, service: { parseSh }}, { processKey, buffer: otherBuffer }) =>
  {
    const buffer = otherBuffer || proc[processKey].buffer;
    console.log('PARSING', buffer.slice()); // DEBUG

    try {
      // Parser.Interactive expects terminal newline.
      const src = buffer.join('\n') + '\n';
      const { incomplete, parsed } = parseSh.interactiveParse(src);

      if (parsed) {// DEBUG
        parsed.StmtList.Stmts.forEach((stmt) => console.log('PARSED', stmt.Cmd));
      }

      return incomplete
        ? { key: 'incomplete' }
        : { key: 'complete', parsed: parsed as ParsedSh.File, src };

    } catch (e) {
      console.error(e);
      return { key: 'failed', error: `${e}` };
    }
  },
);
interface ParseBufferThunk extends OsThunkAct<OsAct,
  { processKey: string; buffer?: string[] },
  (
    | { key: 'failed'; error: string }
    | { key: 'incomplete' }
    | { key: 'complete'; parsed: ParsedSh.File; src: string }
  )
> {
  type: OsAct.OS_PARSE_BUFFER_THUNK;
}

/**
 * Parse shell commands directly from string.
 */
export const osParseShThunk = createOsThunk<OsAct, ParseShThunk>(
  OsAct.OS_PARSE_SH_THUNK,
  ({ service }, { src }) => {
    try {
      return { key: 'parsed', parsed: service.parseSh.parse(src) };
    } catch (e) {
      console.error(e);
      return { key: 'failed', error: `${e}` };
    }
  },
);
export interface ParseShThunk extends OsThunkAct<OsAct, { src: string }, (
  | { key: 'parsed'; parsed: ParsedSh.File }
  | { key: 'failed'; error: string }
)> {
  type: OsAct.OS_PARSE_SH_THUNK;
}

/**
 * Transpile parsed shell commands.
 */
export const osTranspileShThunk = createOsThunk<OsAct, TranspileShThunk>(
  OsAct.OS_TRANSPILE_SH_THUNK,
  ({ service: { transpileSh }}, { parsed }) => transpileSh.transpile(parsed),
);
interface TranspileShThunk extends OsThunkAct<OsAct, { parsed: ParsedSh.File }, Term> {
  type: OsAct.OS_TRANSPILE_SH_THUNK;
}

export const osWalkTerm = createOsThunk<OsAct, WalkTermThunk>(
  OsAct.OS_CLONE_TERM_THUNK,
  ({ service }, { term, action }) => service.term.walkTerm(term, action),
);
interface WalkTermThunk extends OsThunkAct<OsAct, {
  term: Term;
  action: (node: Term) => void;
}, void> {
  type: OsAct.OS_WALK_TERM_THUNK;
}
