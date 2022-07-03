/**
 * Source https://github.com/LabhanshAgrawal/xterm-link-provider/blob/master/src/index.ts
 * We provide additional args to @see _handler i.e.
 * - lineNumber
 * - lineText
 * - linkStartIndex
 */
import type {IBufferCellPosition, ILink, ILinkProvider, Terminal} from 'xterm';

type ILinkProviderOptions = Omit<ILink, 'range' | 'text' | 'activate'>;

export interface ExtraHandlerContext {
  /**
   * Line number in buffer, viewing a wrapped line as a single line.
   * That is, the _actual_ lines output, not their viewport-dependent cousins.
   */
  outputLineNumber: number;
  /** Total number of entire "actual" lines output inside buffer */
  bufferOutputLines: number;
  /** Entire line text */
  lineText: string;
  /** 
   * 0-based index of `text` within `lineText`.
   * Seems to count unicode characters as 1 char.
   */
  linkStartIndex: number;
}

export class LinkProvider implements ILinkProvider {
  /**
   * Create a Link Provider for xterm.js
   * @param _terminal The terminal instance
   * @param _regex The regular expression to use for matching
   * @param _handler Callback for when link is clicked
   * @param _options Further hooks, eg. hover, leave and decorations
   * @param _matchIndex The index to use from regexp.exec result, default 1
   */
  constructor(
    private readonly _terminal: Terminal,
    private readonly _regex: RegExp,
    // private readonly _handler: ILink['activate'],
    private readonly _handler: (event: MouseEvent, text: string, extraCtxt: ExtraHandlerContext) => void,
    private readonly _options: ILinkProviderOptions = {},
    private readonly _matchIndex = 1
  ) {}

  public provideLinks(y: number, callback: (links: ILink[] | undefined) => void): void {
    const links = computeLink(y, this._regex, this._terminal, this._matchIndex).map(
      (_link): ILink => ({
        range: _link.range,
        text: _link.text,
        activate: (e, text) => {
          /**
           * Compute line number in buffer, viewing a wrapped line as a single line.
           * In other words, we count the actual lines output.
           */
          const outputLineNumber = lineNumberSansWraps(y, this._terminal);
          const bufferOutputLines = bufferLinesSansWraps(this._terminal);
        
          const [lineText] = translateBufferLineToStringWithWrap(y - 1, this._terminal);
          // Importantly, this is counting unicode characters as 1 char.
          const linkStartIndex = _link.range.start.x;
          return this._handler(e, text, {
            outputLineNumber,
            bufferOutputLines,
            lineText,
            linkStartIndex,
          });
        },
        ...this._options
      })
    );
    callback(links);
  }
}
/**
 * Find link range and text for the given line and regex
 * @param y The line number to process
 * @param regex The regular expression to use for matching
 * @param terminal The terminal instance
 * @param matchIndex The index to use from regexp.exec result, default 1
 */
export const computeLink = (y: number, regex: RegExp, terminal: Terminal, matchIndex = 1) => {
  const rex = new RegExp(
    regex.source,
    ((regex.flags || '') + 'g')
      .split('')
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .join('')
  );

  const [line, startLineIndex] = translateBufferLineToStringWithWrap(y - 1, terminal);

  let match;
  let stringIndex = -1;
  const result: Pick<ILink, 'range' | 'text'>[] = [];

  while ((match = rex.exec(line)) !== null) {
    const text = match[matchIndex];
    if (!text) {
      // something matched but does not comply with the given matchIndex
      // since this is most likely a bug the regex itself we simply do nothing here
      console.log('match found without corresponding matchIndex');
      break;
    }

    // Get index, match.index is for the outer match which includes negated chars
    // therefore we cannot use match.index directly, instead we search the position
    // of the match group in text again
    // also correct regex and string search offsets for the next loop run
    stringIndex = line.indexOf(text, stringIndex + 1);
    rex.lastIndex = stringIndex + text.length;
    if (stringIndex < 0) {
      // invalid stringIndex (should not have happened)
      break;
    }

    const range = {
      start: stringIndexToBufferPosition(terminal, startLineIndex, stringIndex),
      end: stringIndexToBufferPosition(
        terminal,
        startLineIndex,
        stringIndex + text.length - 1,
        true
      )
    };

    result.push({range, text});
  }

  return result;
};

function lineNumberSansWraps(
  lineNumber: number,
  terminal: Terminal,
) {
  let lineIndex = lineNumber - 1;
  for (let i = 0; i < lineNumber - 1; i++) {
    if (terminal.buffer.active.getLine(i)?.isWrapped) lineIndex--;
  }
  return lineIndex + 1;
}

function bufferLinesSansWraps({ buffer: { active } }: Terminal) {
  return [...Array(active.length)]
    .reduce<number>((agg, _, i) => agg + (active.getLine(i)!.isWrapped ? 0 : 1), 0);
}

const translateBufferLineToStringWithWrap = (
  lineIndex: number,
  terminal: Terminal
): [string, number] => {
  let lineString = '';
  let lineWrapsToNext: boolean;
  let prevLinesToWrap: boolean;

  do {
    const line = terminal.buffer.active.getLine(lineIndex);
    if (!line) {
      break;
    }

    if (line.isWrapped) {
      lineIndex--;
    }

    prevLinesToWrap = line.isWrapped;
  } while (prevLinesToWrap);

  const startLineIndex = lineIndex;

  do {
    const nextLine = terminal.buffer.active.getLine(lineIndex + 1);
    lineWrapsToNext = nextLine ? nextLine.isWrapped : false;
    const line = terminal.buffer.active.getLine(lineIndex);
    if (!line) {
      break;
    }
    lineString += line.translateToString(true).substring(0, terminal.cols);
    lineIndex++;
  } while (lineWrapsToNext);

  return [lineString, startLineIndex];
};

const stringIndexToBufferPosition = (
  terminal: Terminal,
  lineIndex: number,
  stringIndex: number,
  reportLastCell = false
): IBufferCellPosition => {
  const cell = terminal.buffer.active.getNullCell();
  while (stringIndex) {
    const line = terminal.buffer.active.getLine(lineIndex);
    if (!line) {
      return {x: 0, y: 0};
    }
    const length = line.length;
    for (let i = 0; i < length; ) {
      line.getCell(i, cell);
      stringIndex -= cell.getChars().length;
      if (stringIndex < 0) {
        return {x: i + (reportLastCell ? cell.getWidth() : 1), y: lineIndex + 1};
      }
      i += cell.getWidth();
    }
    lineIndex++;
  }
  return {x: 1, y: lineIndex + 1};
};