import { OsWorker, MessageFromOsWorker, Message } from '@model/os/os.worker.model';
import { Terminal } from 'xterm';
import { testNever } from '@model/generic.model';
import { Redacted } from '@model/redux.model';
import { ProcessSignal } from '@model/os/process.model';

/**
 * Wrapper around XTerm.Terminal which communicates
 * with a TtyINode in the OS web worker.
 */
export class TtyXterm {
  /**
   * e.g. write a line, clear the screen. They are induced
   * by user input and/or processes in the respective session.
   */
  private commandBuffer: XtermOutputCommand[];
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
  /** Has last line entered by user not yet been read? */
  private linePending: boolean;
  /** Timeout id for next drain of {commandBuffer} to screen. */
  private nextPrintId: null | number;
  /**
   * User-input prompt e.g. '$ '.
   * Currently do not support escape chars in prompt.
   */
  private prompt: string;
  /** Shortcut */
  private xterm: Redacted<Terminal>;

  constructor(private def: TtyXtermDef) {
    this.xterm = this.def.xterm;
    this.input = '';
    this.cursor = 0;
    this.prompt = '';
    this.linePending = false;
    this.commandBuffer = [];
    this.nextPrintId = null;

    this.xterm.onData(this.handleXtermInput.bind(this));

    // Initial message
    this.xterm.write('\x1b[38;5;248;1m');
    this.xterm.writeln(`Connected to ${this.def.canonicalPath}.\x1b[0m`);
    this.clearInput();
    this.cursorRow = 2;

    // Listen to worker
    this.def.osWorker.addEventListener('message', this.onWorkerMessage);
  }

  /**
   * Compute actual cursor (1-dimensional), taking prompt into account.
   * TODO handle length when prompt contains control chars
   */
  private actualCursor(input: string, cursor: number) {
    return this.actualLine(input.slice(0, cursor)).length;
  }

  /**
   * Compute whole 'line' including prompt.
   */
  private actualLine(input: string) {
    return this.prompt + input;
  }

  /**
   * Clears the input possibly over many lines.
   * Returns the cursor to the start of the input.
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

  public dispose() {
    this.def.osWorker.removeEventListener('message', this.onWorkerMessage);
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

  private async handleXtermInput(data: string) {
    if (this.linePending) {// Ignore while awaiting read
      return;
    }
    if (data.length > 3 && data.charCodeAt(0) !== 0x1b) {
      // Handle pasted input
      const text = data.replace(/[\r\n]+/g, '\n');
      const lines = text.split('\n');
      const last = !text.endsWith('\n') && lines.pop();
      for (const line of lines) {
        await new Promise(resolve => {
          this.queueCommands(
            { key: 'paste-line', line },
            { key: 'await-prompt' },
            { key: 'resolve', resolve },
          );
        });
      }
      if (last) {// Set as pending input but don't send
        this.queueCommands(
          lines.length === 1
            ? { key: 'write', text: last }
            : { key: 'resolve', resolve: () => {
              this.clearInput();
              this.setInput(last);
            }});
      }
    } else {
      this.handleXtermKeypress(data);
    }
  }

  private handleXtermKeypress(data: string) {
    const ord = data.charCodeAt(0);
    let cursor: number;

    if (ord == 0x1b) { // ANSI escape sequences
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
      // Handle special characters
      switch (data) {
        case '\r': {// Enter.
          // this.sendLine();
          // this.prompt = ''; // ?
          this.queueCommands({ key: 'newline' });
          break;
        }
        case '\x7F': {// Backspace.
          this.handleCursorErase(true);
          break;
        }
        case '\t': {// Tab.
          // TODO autocompletion
          this.handleCursorInsert('  ');
          break;
        }
        case '\x03': {// Ctrl + C.
          this.sendTermSignal();
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
    } else {// Visible characters
      this.handleCursorInsert(data);
    }
  }

  /**
   * Suppose we're about to write `nextInput` possibly after prompt.
   * If real input ends _exactly_ at right-hand edge, the cursor doesn't wrap.
   * This method detects this so we can append `\r\n`.
   */
  private inputEndsAtEdge(nextInput: string) {
    const realInput = this.actualLine(nextInput);
    const realCursor = this.actualCursor(nextInput, nextInput.length);
    const { col } = this.offsetToColRow(realInput, realCursor);
    return col === 0;
  }

  /**
   * Send TERM to foreground process group.
   */
  private sendTermSignal() {
    this.setCursor(this.input.length);
    this.xterm.write('^C\r\n');
    this.trackCursorRow(1);
    this.input = '';
    this.cursor = 0;
    // Immediately forget any pending output
    this.commandBuffer.length = 0;

    // Reset controlling process
    this.def.osWorker.postMessage({
      key: 'send-tty-signal',
      sessionKey: this.def.sessionKey,
      signal: ProcessSignal.TERM,
    });
  }

  public queueCommands(...commands: XtermOutputCommand[]) {
    this.commandBuffer.push(...commands);
    this.printPending();
  }

  private onWorkerMessage = ({ data: msg }: Message<MessageFromOsWorker>) => {
    console.log({ receivedFromOsWorker: msg });

    switch (msg.key) {
      case 'set-xterm-prompt': {
        if (msg.sessionKey === this.def.sessionKey) {
          this.setPrompt(msg.prompt);
        }
        return;
      }
      case 'clear-xterm': {
        if (msg.sessionKey === this.def.sessionKey) {
          this.clearScreen();
        }
        return;
      }
      case 'write-to-xterm': {
        if (msg.sessionKey === this.def.sessionKey) {
          // Acknowledge immediately i.e. before writing lines
          this.def.osWorker.postMessage({
            key: 'xterm-received-lines',
            sessionKey: msg.sessionKey,
            messageUid: msg.messageUid,
          });
          this.queueCommands(...msg.lines.map(
            line => ({ key: 'line' as 'line', line }))
          );
        }
        return;
      }
      case 'tty-received-line': {
        if (msg.sessionKey === this.def.sessionKey && msg.uiKey === this.def.uiKey) {
          // The tty inode has received the line sent from this xterm,
          // so we can resume listening for input
          this.input = '';
          this.linePending = false;
        }
        return;
      }
    }
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
   * Count the number of lines in the current input.
   */
  private numLines() {
    return 1 + this.offsetToColRow(this.input, this.input.length).row;
  }

  /**
   * Print part of command buffer to the screen.
   */
  private print = () => {
    let command: XtermOutputCommand | undefined;
    let numLines = 0;
    this.nextPrintId = null;

    while (
      (command = this.commandBuffer.shift())
      && numLines <= this.def.linesPerUpdate
    ) {
      switch (command.key) {
        case 'await-prompt': {
          this.commandBuffer.unshift(command);
          return;
        }
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
          this.sendLine();
          return;
        }
        case 'paste-line': {
          this.xterm.writeln(command.line);
          this.trackCursorRow(+1);
          this.input = command.line;
          this.sendLine();
          return;
        }
        case 'resolve': {
          command.resolve();
          break;
        }
        case 'write': {
          this.xterm.write(command.text);
          break;
        }
        default: throw testNever(command);
      }
    }

    this.printPending();
  }

  private printPending() {
    if (this.commandBuffer.length && !this.nextPrintId) {
      this.nextPrintId = window.setTimeout(this.print, this.def.refreshMs);
    }
  }

  /**
   * Send line to reader.
   */
  private sendLine() {
    this.prompt = '';
    this.linePending = true;

    this.def.osWorker.postMessage({
      key: 'line-to-tty',
      sessionKey: this.def.sessionKey,
      line: this.input,
      xtermKey: this.def.uiKey,
    });
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
    
    // console.log({ prevPromptOffset, prevCol, prevRow, nextCol, nextRow });

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
   * Writes the input which may span over multiple lines.
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
    this.input = newInput;
    this.cursor = newInput.length;
  }

  /** Set and print prompt, unblocking any 'await-prompt'. */
  public setPrompt(prompt: string) {
    this.prompt = prompt;
    const [first] = this.commandBuffer;
    if (first && first.key === 'await-prompt') {
      this.commandBuffer.shift();
    }
    this.queueCommands({ key: 'write', text: prompt });
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
}

interface TtyXtermDef {
  uiKey: string;
  osWorker: OsWorker;
  xterm: Redacted<Terminal>;
  sessionKey: string;
  canonicalPath: string;
  linesPerUpdate: number;
  refreshMs: number;
}

type XtermOutputCommand = (
  | {
    /** Wait for next prompt from tty */
    key: 'await-prompt';
  } | {
    /** Clear the screen */
    key: 'clear';
  } | {
    /** Write a single line of text including final newline */
    key: 'line';
    line: string;
  } | {
    /** Write a newline and send `this.input` to tty */
    key: 'newline';
  } | {
    /** Write a pasted line of text and send it to tty */
    key: 'paste-line';
    line: string;
  } | {
    /** Invoke the function `resolve` */
    key: 'resolve';
    resolve: () => void;
  } | {
    /** Write some free text e.g. prompt or line without final newline */
    key: 'write';
    text: string;
  }
);
