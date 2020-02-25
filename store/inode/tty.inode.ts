import * as XTerm from 'xterm';
import { ProcessSignal } from '@model/os/process.model';
import { RedactInReduxDevTools } from '@model/redux.model';
import { BaseINode, INodeType, BaseINodeDef } from './base-inode';
import { testNever } from '@model/generic.model';

/**
 * tty running in interactive mode.
 *
 * One can read user-input from it.
 * Writing to it produces output on the display,
 * but otherwise is a sink.
 */
export class TtyINode extends BaseINode {
  
  /**
   * These command influence the terminal e.g.
   * write a line, clear the screen. They are induced
   * by user input and/or processes in the respective session.
   */
  private commandBuffer: TtyOutputCommand[];
  /**
   * Number of characters from char after prompt
   * to the current cursor position.
   */
  private cursor: number;
  /**
   * The viewport row the cursor is on (1-based).
   * Needed in order to scroll up e.g. Ctrl+A on a long line.
   */
  private cursorRow: number;
  /**
   * The current user input line before pressing enter.
   */
  private input: string;
  /**
   * Has last line entered by user not yet been read?
   */
  public linePending: boolean;
  /**
   * Timeout id for next drain of {commandBuffer} to screen.
   */
  private nextPrintId: null | number;
  /**
   * User-input prompt e.g. '$ '.
   */
  private prompt: string;
  public readonly type = INodeType.tty
  /**
   * One can always write to {this.commandBuffer}.
   * But {this.write} waits until the commands have been run.
   */
  public readonly writeBlocked = false;
  /**
   * npm module 'xterm' object, originally {this.def.xterm}.
   */
  public xterm: XTerm.Terminal & RedactInReduxDevTools;

  constructor (
    public def: TtyINodeDef,
  ) {
    super(def);

    this.xterm = this.def.xterm;
    this.input = '';
    this.cursor = 0;
    this.prompt = '';
    this.linePending = false;
    this.commandBuffer = [];
    this.nextPrintId = null;

    this.xterm.onData(this.handleXtermInput.bind(this));
    this.xterm.onResize(this.handleXtermResize.bind(this));

    // Initial message.
    this.xterm.write('\x1b[38;5;248;1m');
    this.xterm.writeln(`Connected to ${this.def.canonicalPath}.\x1b[0m`);
    this.clearInput();

    // Green foreground.
    // this.xterm.write('\x1b[0m\x1b[92m');
    // this.xterm.write('\x1b[0m');
    this.cursorRow = 2;// After initial message.
  }

  /**
   * Compute actual cursor (1-dimensional), taking prompt into account.
   */
  private actualCursor(input: string, cursor: number): number {
    return this.actualLine(input.slice(0, cursor)).length;
  }

  /**
   * Compute whole 'line' including prompt.
   */
  private actualLine(input: string) {
    return this.prompt + input;
  }

  /**
   * Clears the input, possibly over many lines.
   * Returns the cursor to the start of the input.
   * Sets {this.input} as the empty-word.
   */
  private clearInput() {
    this.setCursor(0);// Return to start of input.
    // Compute number of lines to clear, starting at current.
    const numLines = Math.min(this.numLines(), (this.xterm.rows + 1) - this.cursorRow);
    if (numLines > 1) {
      this.xterm.write('\r\x1b[K\x1b[E'.repeat(numLines));
      this.xterm.write('\x1b[F'.repeat(numLines));// Return to start
    } else {
      // Seems to solve issue at final line of viewport,
      // i.e. `\x1b[E` did nothing, and `\x1b[F` moved cursor up.
      this.xterm.write('\r\x1b[K');
    }
    this.input = '';
  }

  /**
   * Clear the screen.
   */
  public clearScreen() {
    for (let i = 0; i < this.xterm.rows; i++) {
      this.xterm.writeln(''); 
    }
    this.xterm.write('\x1b[F'.repeat(this.xterm.rows));
    this.xterm.scrollToBottom();
    this.cursorRow = 1;
  }

  /**
   * Find closest word-boundary to the left of cursor.
   */
  private closestLeftBoundary(input: string, cursor: number) {
    const found = this.wordBoundaries(input, true)
      .reverse()
      .find((x) => x < cursor);
    return found || 0;
  }

  /**
   * Find closest word-boundary to the right of cursor.
   */
  private closestRightBoundary(input: string, cursor: number) {
    const found = this.wordBoundaries(input, false)
      .find((x) => x > cursor);
    return found || input.length;
  }

  /**
   * Delete left-most word.
   */
  private deletePreviousWord() {
    const cursor = this.closestLeftBoundary(this.input, this.cursor);
    if (cursor != null) {
      const nextInput = this.input.slice(0, cursor) + this.input.slice(this.cursor);
      this.clearInput();
      this.setInput(nextInput);
      this.setCursor(cursor);
    }
  }

  private handleXtermInput(data: string) {
    /**
     * Ignore input while waiting for reader.
     */
    if (this.linePending) {
      return;
    }
    if (data.length > 3 && data.charCodeAt(0) !== 0x1b) {
      /**
       * Handle pasted input.
       */
      data.replace(/[\r\n]+/g, '\n')
        .split('\n')
        .forEach((line) => this.handleXtermData(line));
    } else {
      /**
       * Handle 'standard' input.
       */
      this.handleXtermData(data);
    }
  }

  /**
   * Handle reflow for current input.
   */
  private handleXtermResize() {
    const { cursor, input } = this;
    this.clearInput();
    this.setInput(input);
    this.setCursor(cursor);
  }

  /**
   * Suppose we're about to write {nextInput} (possibly after prompt).
   * If real input ends _exactly_ at right-hand edge, cursor doesn't wrap.
   * This method detects this, so we can append \r\n.
   */
  private inputEndsAtEdge(nextInput: string) {
    const realInput = this.actualLine(nextInput);
    const realCursor = this.actualCursor(nextInput, nextInput.length);
    const { col } = this.offsetToColRow(realInput, realCursor);
    return col === 0;
  }

  /**
   * Count the number of lines in the current input.
   */
  private numLines() {
    return 1 + this.offsetToColRow(this.input, this.input.length).row;
  }

  /**
   * Convert 0-based {cursor} in {input} to
   * a relative 0-based col/row location.
   */
  private offsetToColRow(input: string, cursor: number) {
    const { cols } = this.xterm;
    let row = 0, col = 0;
    for (let i = 0; i < cursor; ++i) {
      const chr = input.charAt(i);
      if (chr == '\n') {
        col = 0;
        row += 1;
      } else {
        col += 1;
        if (col >= cols) {
          col = 0;
          row += 1;
        }
      }
    }
    return { row, col };
  }

  /**
   * Insert character at cursor location
   */
  private handleCursorInsert(data: string) {
    const { input, cursor } = this;
    const newInput = input.slice(0, cursor) + data + input.slice(cursor);
    // Store cursor.
    const prevCursor = this.cursor;
    this.clearInput();
    this.setInput(newInput);
    // Update cursor.
    this.setCursor(prevCursor + data.length);
  }

  /**
   * Move cursor forwards/backwards (+1/-1).
   */
  private handleCursorMove(dir: -1 | 1) {
    if (dir > 0) {
      const num = Math.min(dir, this.input.length - this.cursor);
      this.setCursor(this.cursor + num);
    } else {
      const num = Math.max(dir, -this.cursor);
      this.setCursor(this.cursor + num);
    }
  }

  /**
   * Erase a character at cursor location.
   */
  private handleCursorErase(backspace: boolean) {
    const { cursor, input } = this;
    if (backspace) {
      // console.log({ cursor });
      if (cursor <= 0) {
        return;
      }
      const newInput = input.slice(0, cursor - 1) + input.slice(cursor);
      this.clearInput();
      this.setInput(newInput);
      this.setCursor(cursor - 1);
    } else {
      const newInput = input.slice(0, cursor) + input.slice(cursor + 1);
      this.clearInput();
      this.setInput(newInput);
      this.setCursor(cursor);
    }
  }

  public handleXtermData(data: string) {
    const ord = data.charCodeAt(0);
    let cursor: number;

    if (ord == 0x1b) {
      /**
       * Handle ANSI escape sequences.
       */
      switch (data.slice(1)) {
        case '[A': {// Up arrow.
          /**
           * TODO history
           */
          break;  
        }
        case '[B': {// Down arrow.
          /**
           * TODO history
           */
          break;
        }
        case '[D': {// Left Arrow.
          this.handleCursorMove(-1);
          break;
        }
        case '[C': {// Right Arrow.
          this.handleCursorMove(1);
          break;
        }
        case '[3~': {// Delete.
          this.handleCursorErase(false);
          break;
        }
        case '[F': {// End.
          this.setCursor(this.input.length);
          break;
        }
        case '[H': {// Home. (?)
          this.setCursor(0);
          break;
        }
        case 'b': {// Alt + Left.
          cursor = this.closestLeftBoundary(this.input, this.cursor);
          if (cursor != null) {
            this.setCursor(cursor);
          }
          break;
        }
        case 'f': {// Alt + Right.
          cursor = this.closestRightBoundary(this.input, this.cursor);
          if (cursor != null) {
            this.setCursor(cursor);
          }
          break;
        }
        case '\x7F': {// Ctrl + Backspace.
          this.deletePreviousWord();
          break;
        }
      }
    } else if (ord < 32 || ord === 0x7f) {
      /**
       * Handle special characters.
       */
      switch (data) {
        case '\r': {// Enter.
          this.sendLine();
          this.prompt = ''; // ?
          break;
        }
        case '\x7F': {// Backspace.
          this.handleCursorErase(true);
          break;
        }
        case '\t': {// Tab.
          /**
           * Tab
           * - TODO Autocompletion.
           */
          this.handleCursorInsert('  ');
          break;
        }
        case '\x03': {// Ctrl + C.
          this.killSignal();
          // this.queueCommands({ key: 'signal' },);
          break;
        }
        case '\x17': {// Ctrl + W.
          // Delete previous word.
          this.deletePreviousWord();
          break;
        }
        case '\x01': {// Ctrl + A.
          // Goto line start.
          this.setCursor(0);
          break;
        }
        case '\x05': {// Ctrl + E.
          // Goto EOL.
          this.setCursor(this.input.length);
          break;
        }
        case '\x0C': {// Ctrl + L.
          // Clear screen.
          this.clearScreen();
          // Show prompt again.
          this.setInput(this.input);
          break;
        }
        case '\x0b': {// Ctrl + K.
          /**
           * Erase from cursor to EOL.
           */
          const nextInput = this.input.slice(0, this.cursor);
          this.clearInput();
          this.setInput(nextInput);
          break;// Cursor already at EOL.
        }
        case '\x15': {// Ctrl + U.
          /**
           * Erase from start of line to cursor.
           */
          const nextInput = this.input.slice(this.cursor);
          this.clearInput();
          this.setInput(nextInput);
          this.setCursor(0);
          break;
        }
      }
    } else {// Handle visible characters
      this.handleCursorInsert(data);
    }
  }

  /**
   * Send TERM to foreground process group.
   */
  private killSignal() {
    this.setCursor(this.input.length);
    this.xterm.write('^C\r\n');
    this.trackCursorRow(1);
    this.input = '';
    this.cursor = 0;
    // Immediately forget any pending input.
    this.commandBuffer.length = 0;
    /**
     * {this.def.sendSignal} will re-exec the controlling
     * process with interactive bash, cancelling the previous
     * subscription and subscribing to a new one.
     * But 1st we remove the old subscription's read resolver.
     * We do not expect other readers to exist.
     */
    this.readResolvers.length = 0;
    this.def.sendSignal(ProcessSignal.TERM);
  }

  /**
   * Print part of command buffer to the screen.
   */
  private print = () => {
    let command: TtyOutputCommand | undefined;
    let numLines = 0;

    // eslint-disable-next-line no-cond-assign
    while (command = this.commandBuffer.shift()) {
      switch (command.key) {
        case 'clear': {
          this.clearScreen();
          break;
        }
        case 'line': {
          this.xterm.writeln(command.line);
          this.trackCursorRow(+1);
          numLines++;
          break;
        }
        case 'newline': {
          this.xterm.write('\r\n');
          this.trackCursorRow(+1);
          break;
        }
        case 'prompt': {
          this.xterm.write(command.text);
          break;
        }
        case 'resolve': {
          command.resolve();
          break;
        }
        default: throw testNever(command);
      }

      if (numLines > this.def.linesPerUpdate) {
        break;
      }
    }

    // Reschedule if necessary.
    this.nextPrintId = this.commandBuffer.length
      ? window.setTimeout(this.print, this.def.refreshMs)
      : null;
  }

  public queueCommands(...commands: TtyOutputCommand[]) {
    this.commandBuffer.push(...commands);
    if (!this.nextPrintId) {
      // Awaken printer; do not invoke {this.print} directly.
      this.nextPrintId = window.setTimeout(this.print, 0);
    }
  }

  /**
   * Reads exactly one line i.e. last one entered by user.
   */
  public read(buffer: string[], _maxLines: number, _offset: number): number {
    buffer.push(this.input);
    this.input = '';
    this.linePending = false;
    return 1;// Have read exactly 1 line.
  }

  /**
   * Reading is blocked iff no line is pending.
   */
  public get readBlocked() {
    return !this.linePending;
  }

  /**
   * Receive prompt from writer.
   */
  public receivePrompt(prompt: string) {
    // Print prompt.
    this.queueCommands({ key: 'prompt', text: prompt });
    this.prompt = prompt;
  }

  /**
   * Move the terminal's cursor and update {this.cursor}.
   */
  private setCursor(newCursor: number) {
    if (newCursor < 0) {
      newCursor = 0;
    } else if (newCursor > this.input.length) {
      newCursor = this.input.length;
    }

    // Compute actual input with prompt(s).
    const inputWithPrompt = this.actualLine(this.input);
    // Get previous cursor position.
    const prevPromptOffset = this.actualCursor(this.input, this.cursor);
    const { col: prevCol, row: prevRow } = this.offsetToColRow(inputWithPrompt, prevPromptOffset);
    // Get next cursor position.
    const newPromptOffset = this.actualCursor(this.input, newCursor);
    const { col: nextCol, row: nextRow } = this.offsetToColRow(inputWithPrompt, newPromptOffset);
    // console.log({ prevCol, prevRow, nextCol, nextRow });

    // Adjust vertically.
    if (nextRow > prevRow) {// Cursor Down.
      for (let i = prevRow; i < nextRow; ++i) this.xterm.write('\x1b[B');
    } else {// Cursor Up.
      for (let i = nextRow; i < prevRow; ++i) this.xterm.write('\x1b[A');
    }
    this.trackCursorRow(nextRow - prevRow);

    // Adjust horizontally.
    if (nextCol > prevCol) {// Cursor Forward.
      for (let i = prevCol; i < nextCol; ++i) this.xterm.write('\x1b[C');
    } else {// Cursor Backward.
      for (let i = nextCol; i < prevCol; ++i) this.xterm.write('\x1b[D');
    }
    this.cursor = newCursor;
  }

  /**
   * Send line to reader.
   */
  private sendLine () {
    this.queueCommands({ key: 'newline' });
    this.linePending = true;

    // Resume 1st pending reader which hasn't terminated.
    let resolve: undefined | (() => boolean);
    while ((resolve = this.readResolvers.shift()) && !resolve()) {
      // NOOP
    }
  }

  /**
   * Writes the input, which may span over multiple lines.
   * Updates {this.input}. Finishes with cursor at end of input.
   */
  private setInput(newInput: string) {
    // Return to start of input.
    this.setCursor(0);
    const realNewInput = this.actualLine(newInput);
    // const normalized = realNewInput.replace(/[\r\n]+/g, '\n');
    // this.xterm.write(normalized.replace(/\n/g, '\r\n'));
    // this.xterm.write(this.normalizeText(realNewInput));
    this.xterm.write(realNewInput);
    /**
     * Right-edge detection uses {newInput} sans prompt.
     * Use guard {realNewInput} to avoid case of blank line,
     * arising from unguarded builtin 'read' when deleting.
     */
    if (realNewInput && this.inputEndsAtEdge(newInput)) {
      this.xterm.write('\r\n');
      this.trackCursorRow(1);
    }
    // Update state to reflect changes.    
    this.input = newInput;
    this.cursor = newInput.length;
  }

  /**
   * Used to track cursor viewport row.
   */
  private trackCursorRow(delta: number) {
    this.cursorRow += delta;
    if (this.cursorRow < 1) {
      this.cursorRow = 1;
    } else if (this.cursorRow > this.xterm.rows) {
      this.cursorRow = this.xterm.rows;
    }
  }

  /**
   * Find all word boundaries.
   */
  private wordBoundaries(input: string, leftSide = true) {
    let match: null | RegExpExecArray;
    const words = [] as number[];
    const boundaryRegex = /\w+/g;
  
    // eslint-disable-next-line no-cond-assign
    while (match = boundaryRegex.exec(input)) {
      words.push(leftSide ? match.index : match.index + match[0].length);
    }
    return words;
  }

  /**
   * Handle lines written by processes.
   */
  public async write(buffer: string[], _offset: number): Promise<number> {
    const newCmds = buffer.map<TtyOutputCommand>((line) => ({ key: 'line', line }));
    
    await new Promise<void>((resolve) => {
      this.commandBuffer.push(...newCmds, { key: 'resolve', resolve });
      if (!this.nextPrintId) {
        this.nextPrintId = window.setTimeout(this.print, 0);
      }
    });

    buffer.length = 0;
    return newCmds.length;
  }

}

export interface TtyINodeDef extends BaseINodeDef {
  /**
   * The canonical path in filesystem e.g. /dev/tty-1.
   */
  canonicalPath: string;
  /**
   * npm module 'xterm' object.
   */
  xterm: XTerm.Terminal & RedactInReduxDevTools;
  /**
   * Maximum number of 'line' commands printed by {this.print}.
   * All other commands are printed with no cost.
   */
  linesPerUpdate: number;
  /**
   * Length of time in milliseconds between consecutive {this.print}s.
   */
  refreshMs: number;
  /**
   * Can be used to dispatch signal to foreground process group of parent session.
   */
  sendSignal: (signal: ProcessSignal) => void;
}

type TtyOutputCommand = (
  | { key: 'line'; line: string }
  | { key: 'clear' }
  | { key: 'newline' }
  | { key: 'prompt'; text: string }
  | { key: 'resolve'; resolve: () => void }
);
