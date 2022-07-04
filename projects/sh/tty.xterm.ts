import { Terminal } from 'xterm';
import { MessageFromShell, MessageFromXterm } from './tty.model';
import { safeStringify, testNever } from '../service/generic';
import { scrollback, ShellIo, DataChunk, isDataChunk } from './io/io.model';
import { ansiColor } from './sh.util';

/**
 * Wraps xtermjs `Terminal`.
 */
export class TtyXterm {
  /**
   * Commands include writing a line, clearing the screen.
   * They're induced by user input and/or processes in respective session.
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
  /** Has the tty received the last line sent? */
  private readyForInput: boolean;
  /** Has the tty prompted for input and we haven't sent yet? */
  private promptReady: boolean;
  /** Timeout id for next drain of {commandBuffer} to screen. */
  private nextPrintId: null | number;
  /**
   * User-input prompt e.g. '$ '.
   * We do not support escape chars in prompt.
   */
  private prompt: string;

  private historyIndex = -1;
  private preHistory: string;
  private linesPerUpdate = 500;
  private refreshMs = 0;

  /** Useful for mobile keyboard inputs */
  forceLowerCase = false;
  /**
   * Total number of lines output, excluding current possibly multi-line input.
   * This makes sense because we monotonically output lines.
   */
  totalLinesOutput = 0;

  constructor(
    public xterm: Terminal,
    private session: {
      key: string;
      io: ShellIo<MessageFromXterm, MessageFromShell>;
      /** Write last interactive non-string returned value to `home/_` */
      rememberLastValue: (msg: any) => void;
    },
  ) {
    this.input = '';
    this.cursor = 0;
    this.prompt = '';
    this.readyForInput = true;
    this.promptReady = false;
    this.commandBuffer = [];
    this.nextPrintId = null;
    this.cursorRow = 0;
    this.historyIndex = -1;
    this.preHistory = this.input;
  }

  initialise() {
    // this.xterm.onData((data) => document.body.append('DATA: ' + data));
    this.xterm.onData(this.handleXtermInput.bind(this));
    this.session.io.handleWriters(this.onMessage.bind(this));

    this.xterm.writeln(
      `${ansiColor.White}Connected to session ${ansiColor.Blue}${this.session.key}${ansiColor.Reset}`
    );
    this.clearInput();
    this.cursorRow = 2;
    this.trackTotalOutput(+1);
  }

  /**
   * Compute actual cursor (1-dimensional), taking prompt into account.
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
   * TODO unused, but possibly useful for mobile.
   */
  autoSendCode(input: string) {
    if (this.promptReady) {
      this.clearInput();
      this.input = input
      this.sendLine();
    } else {
      this.onMessage({ key: 'info', msg: `not ready, ignored code: ${input}` });
    }
  }

  /**
   * Clears the input possibly over many lines.
   * Returns the cursor to the start of the input.
   */
  clearInput() {
    // Return to start of input
    this.setCursor(0);
    // Compute number of lines to clear, starting at current
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
   * A new prompt is shown with any pending input.
   */
  clearScreen() {
    // Writing a line for each row moves visible lines just offscreen
    for (let i = 0; i < this.xterm.rows; i++) {
      this.xterm.writeln(''); 
    }
    // Return to start of viewport
    this.xterm.write('\x1b[F'.repeat(this.xterm.rows));
    this.xterm.scrollToBottom();
    this.cursorRow = 1;

    this.showPendingInput();
    this.trackTotalOutput(+1);
  }

  /**
   * Find closest word-boundary to the left of cursor.
   */
  private closestLeftBoundary(input: string, cursor: number) {
    const found = this.wordBoundaries(input, true).reverse()
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

  /**
   * Erase a character at cursor location.
   */
  private handleCursorErase(backspace: boolean) {
    const { cursor, input } = this;
    
    if (backspace) {
      // console.log({ input, cursor });
      if (cursor <= 0) {
        return;
      }
      let delta = -1;
      const charToDelete = this.input.charAt(this.cursor + delta);
      if (charToDelete === '\n') {
        delta = -2;
      }

      const newInput = input.slice(0, cursor + delta) + input.slice(cursor);
      this.clearInput();
      this.setInput(newInput);
      this.setCursor(cursor + delta);
    } else {
      const newInput = input.slice(0, cursor) + input.slice(cursor + 1);
      this.clearInput();
      this.setInput(newInput);
      this.setCursor(cursor);
    }
  }

  /**
   * Insert characters at cursor location
   */
  private handleCursorInsert(data: string) {
    const { input, cursor } = this;
    const newInput = input.slice(0, cursor) + data + input.slice(cursor);
    // Store cursor
    const nextCursor = this.cursor + data.length;
    this.clearInput();
    this.setInput(newInput);
    // Update cursor
    this.setCursor(nextCursor);
  }

  /**
   * Move cursor forwards/backwards (+1/-1).
   */
  private handleCursorMove(dir: -1 | 1) {
    let delta = dir === 1
      ? Math.min(dir, this.input.length - this.cursor)
      : Math.max(dir, -this.cursor);
    const nextChar = this.input.charAt(this.cursor + delta);

    if (dir === 1) {
      if (nextChar === '\r') {
        delta += 2; // Skip over \r and \n
      } else if (nextChar === '\n') {
        delta += 1;
      }
    } else {
      if (nextChar === '\n') {
        delta -= 1; // Skip over \r
      }
    }
    this.setCursor(this.cursor + delta);
  }

  private async handleXtermInput(data: string) {
    if (!this.readyForInput && data !== '\x03') {
      return;
    }
    if (data.length > 1 && data.includes('\r')) {
      // Handle pasting of multiple lines
      const text = data.replace(/[\r\n]+/g, '\n');
      const lines = text.split('\n');
      lines[0] = `${this.input}${lines[0]}`;
      const last = !text.endsWith('\n') && lines.pop();
      for (const line of lines) {
        await new Promise<void>(resolve => {
          this.queueCommands([
            { key: 'paste-line', line },
            /**
             * TODO this is preventing others processes from
             * writing lines/errors
             */
            { key: 'await-prompt' },
            { key: 'resolve', resolve },
          ]);
        });
      }
      if (last) {// Set as pending input but don't send
        this.queueCommands([
          { key: 'resolve', resolve: () => {
            this.clearInput();
            this.setInput(last);
          }}
        ]);
      }
    } else {
      this.handleXtermKeypresses(data);
    }
  }

  /**
   * Handle:
   * - individual characters (including escape sequences)
   * - multiple characters via a paste without newline
   */
  private handleXtermKeypresses(data: string) {
    const ord = data.charCodeAt(0);
    let cursor: number;

    // Decided to ignore input-replacement deletes,
    // because cannot handle them properly (ambiguous).
    if (data.length > 1 && this.input.startsWith(data)) {
      return;
    }

    if (ord == 0x1b) { // ansiColor. escape sequences
      switch (data.slice(1)) {
        case '[A': {// Up arrow
          if (this.promptReady) {
            this.reqHistoryLine(+1);
          }
          break;  
        }
        case '[B': {// Down arrow
          if (this.promptReady) {
            this.reqHistoryLine(-1);
          }
          break;
        }
        case '[D': {// Left Arrow
          this.handleCursorMove(-1);
          break;
        }
        case '[C': {// Right Arrow
          this.handleCursorMove(1);
          break;
        }
        case '[3~': {// Delete
          this.handleCursorErase(false);
          break;
        }
        case '[F': {// End
          this.setCursor(this.input.length);
          break;
        }
        case '[H': {// Home (?)
          this.setCursor(0);
          break;
        }
        case 'b': {// Alt + Left
          cursor = this.closestLeftBoundary(this.input, this.cursor);
          if (cursor != null) {
            this.setCursor(cursor);
          }
          break;
        }
        case 'f': {// Alt + Right
          cursor = this.closestRightBoundary(this.input, this.cursor);
          if (cursor != null) {
            this.setCursor(cursor);
          }
          break;
        }
        case '\x7F': {// Ctrl + Backspace
          this.deletePreviousWord();
          break;
        }
      }
    } else if (ord < 32 || ord === 0x7f) {
      // Handle special characters
      switch (data) {
        case '\r': {// Enter
          this.queueCommands([{ key: 'newline' }]);
          break;
        }
        case '\x7F': {// Backspace
          this.handleCursorErase(true);
          break;
        }
        case '\t': {// Tab
          // TODO autocompletion
          this.handleCursorInsert('  ');
          break;
        }
        case '\x03': {// Ctrl + C
          this.sendSigKill();
          break;
        }
        case '\x17': {// Ctrl + W
          // Delete previous word
          this.deletePreviousWord();
          break;
        }
        case '\x01': {// Ctrl + A
          // Goto line start
          this.setCursor(0);
          break;
        }
        case '\x05': {// Ctrl + E
          // Goto EOL; do not collect £200
          this.setCursor(this.input.length);
          break;
        }
        case '\x0C': {// Ctrl + L
          // Clear screen
          this.clearScreen();
          break;
        }
        case '\x0b': {// Ctrl + K
          // Erase from cursor to EOL.
          const nextInput = this.input.slice(0, this.cursor);
          this.clearInput();
          this.setInput(nextInput);
          break;// Cursor already at EOL
        }
        case '\x15': {// Ctrl + U
          // Erase from start of line to cursor.
          const nextInput = this.input.slice(this.cursor);
          this.clearInput();
          this.setInput(nextInput);
          this.setCursor(0);
          break;
        }
      }
    } else {// Visible characters
      if (this.forceLowerCase && data.length === 1 && !this.input.includes('/')) {
        data = data.toLowerCase();
      }
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
   * Convert 0-based `cursor` in `input` to
   * a relative 0-based row/col location.
   */
  private offsetToColRow(input: string, cursor: number) {
    const { cols } = this.xterm;
    let row = 0, col = 0;
    for (let i = 0; i < cursor; ++i) {
      const chr = input.charAt(i);
      if (chr === '\n') {
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

  private onMessage(msg: MessageFromShell | string) {
    if (typeof msg === 'string') {
      const lines = msg.split('\n');
      const commands = lines.map(line => ({ key: 'line' as const, line: `${ansiColor.White}${line}${ansiColor.Reset}` }));
      // this.session.rememberLastValue(lines[lines.length - 1]);
      return this.queueCommands(commands);
    } else if (msg === null) {
      this.session.rememberLastValue(null);
      return this.queueCommands([{ key: 'line', line: `${ansiColor.Yellow}null${ansiColor.Reset}` }]);
    } else if (msg === undefined) {
      return;
    }

    switch (msg.key) {
      case 'send-xterm-prompt': {
        this.setPrompt(msg.prompt);
        return;
      }
      case 'clear-xterm': {
        this.clearScreen();
        return;
      }
      case 'tty-received-line': {
        /**
         * The tty inode has received the line sent from this xterm.
         * We now resume listening for input, even without prompt.
         */
        this.input = '';
        this.readyForInput = true;
        return;
      }
      case 'send-history-line': {
        if (msg.line) {
          const line = msg.line.split(/\r?\n/).join('\r\n');
          if (this.historyIndex === -1) {
            this.preHistory = this.input;
          }
          this.clearInput();
          this.setInput(line);
          this.historyIndex = msg.nextIndex; 
        } else if (msg.nextIndex === 0) {
          // Since msg.line empty we must've gone below
          this.clearInput();
          this.setInput(this.input !== this.preHistory ? this.preHistory : '') ;
          this.historyIndex = -1;
          this.preHistory = '';
        }
        return;
      }
      case 'error': {
        this.queueCommands([{
          key: 'line',
          line: `${ansiColor.Red}${msg.msg}${ansiColor.Reset}`,
        }]);
        break;
      }
      case 'info': {
        this.queueCommands([{
          key: 'line',
          line: `ℹ️  ${msg.msg}${ansiColor.Reset}`,
        }]);
        break;
      }
      default: {
        if (isDataChunk(msg)) {
          /**
           * We'll only process the last `2 * scrollback` items.
           * This makes sense if screen rows no larger than scrollback.
           * The buffer length consists of the screen rows (on resize)
           * plus the scrollback.
           */
          const {items} = (msg as DataChunk);
          // Pretend we outputted them all
          this.trackTotalOutput(+Math.max(0, items.length - 2 * scrollback));
          items.slice(-2 * scrollback).forEach(x => this.onMessage(x));
        } else {
          this.queueCommands([{
            key: 'line',
            line: `${ansiColor.Yellow}${safeStringify(msg)}${ansiColor.Reset}`,
          }]);
          this.session.rememberLastValue(msg);
        }
      }
    }
  }

  /**
   * Count the number of lines in the current input.
   */
  private numLines() {
    return 1 + this.offsetToColRow(this.input, this.input.length + 2).row;
  }

  prepareForCleanMsg() {
    if (this.promptReady && this.input.length > 0) {
      if (this.xterm.buffer.active.cursorX > 0) {
        this.queueCommands([{ key: 'line', line: '' }]);
      }
    } else {
      this.clearInput();
    }
  }

  private printPending() {
    if (this.commandBuffer.length && !this.nextPrintId) {
      // console.log('about to print', this.commandBuffer);
      this.nextPrintId = window.setTimeout(this.runCommands, this.refreshMs);
    }
  }

  queueCommands(commands: XtermOutputCommand[]) {
    // We avoid stack overflow for push(...commands)
    for (const command of commands) {
      this.commandBuffer.push(command);
    }
    this.printPending();
  }

  reqHistoryLine(dir: -1 | 1) {
    this.session.io.writeToReaders({
      key: 'req-history-line',
      historyIndex: this.historyIndex + dir,
    });
  }

  /**
   * Print part of command buffer to the screen.
   */
  private runCommands = () => {
    let command: XtermOutputCommand | undefined;
    let numLines = 0;
    this.nextPrintId = null;
    
    while (
      (command = this.commandBuffer.shift())
      && numLines <= this.linesPerUpdate
    ) {
      // console.log({ command });
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
          this.trackTotalOutput(+1);
          numLines++;
          break;
        }
        case 'newline': {
          // Might have pressed enter on earlier line in multiline input
          let { row: currentRow } = this.offsetToColRow(this.input, this.cursor);
          const { row: finalRow } = this.offsetToColRow(this.input, this.input.length);
          while (currentRow++ < finalRow) this.xterm.write('\r\n');

          this.xterm.write('\r\n');
          this.trackCursorRow(+1);
          this.trackTotalOutput(+1);
          this.sendLine();
          return;
        }
        case 'paste-line': {
          this.xterm.writeln(command.line);
          this.trackCursorRow(+1);
          this.trackTotalOutput(+1);
          this.input = command.line;
          this.sendLine();
          return;
        }
        case 'resolve': {
          command.resolve();
          break;
        }
        case 'prompt': {
          this.xterm.write(command.prompt);
          this.promptReady = true;
          break;
        }
        default: throw testNever(command);
      }
    }

    this.printPending();
  }

  /**
   * Send line to reader.
   */
  private sendLine() {
    this.prompt = '';
    this.readyForInput = this.promptReady = false;
    this.historyIndex = -1;
    this.preHistory = '';

    this.session.io.writeToReaders({
      key: 'send-line',
      line: this.input,
    });
  }

  /**
   * Send kill signal to foreground process group.
   */
  sendSigKill() {
    this.input = '';
    this.setCursor(0);
    this.xterm.write('^C\r\n');
    this.trackCursorRow(1);
    this.cursor = 0;
    // Immediately forget any pending output
    this.commandBuffer.length = 0;
    // Reset controlling process
    this.session.io.writeToReaders({ key: 'send-kill-sig' });
  }

  /**
   * Move the terminal's cursor and update `this.cursor`.
   */
  private setCursor(newCursor: number) {
    if (newCursor < 0) {
      newCursor = 0;
    } else if (newCursor > this.input.length) {
      newCursor = this.input.length;
    }

    // Compute actual input with prompt(s)
    const inputWithPrompt = this.actualLine(this.input);
    // Get previous cursor position
    const prevPromptOffset = this.actualCursor(this.input, this.cursor);
    const { col: prevCol, row: prevRow } = this.offsetToColRow(inputWithPrompt, prevPromptOffset);
    // Get next cursor position
    const newPromptOffset = this.actualCursor(this.input, newCursor);
    const { col: nextCol, row: nextRow } = this.offsetToColRow(inputWithPrompt, newPromptOffset);
    
    // console.log({ input: this.input, inputWithPrompt, prevPromptOffset, newPromptOffset, prevCol, prevRow, nextCol, nextRow });

    // Adjust vertically
    if (nextRow > prevRow) {// Cursor Down
      for (let i = prevRow; i < nextRow; ++i) this.xterm.write('\x1b[B');
    } else {// Cursor Up
      for (let i = nextRow; i < prevRow; ++i) this.xterm.write('\x1b[A');
    }
    this.trackCursorRow(nextRow - prevRow);

    // Adjust horizontally
    if (nextCol > prevCol) {// Cursor Forward
      for (let i = prevCol; i < nextCol; ++i) this.xterm.write('\x1b[C');
    } else {// Cursor Backward
      for (let i = nextCol; i < prevCol; ++i) this.xterm.write('\x1b[D');
    }
    this.cursor = newCursor;
  }

  /**
   * Writes the input which may span over multiple lines.
   * Updates {this.input}. Finishes with cursor at end of input.
   */
  private setInput(newInput: string) {
    this.setCursor(0); // Return to start of input.
    const realNewInput = this.actualLine(newInput);
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
  setPrompt(prompt: string) {
    this.prompt = prompt;
    const [first] = this.commandBuffer;
    if (first && first.key === 'await-prompt') {
      this.commandBuffer.shift();
    }
    this.queueCommands([{ key: 'prompt', prompt }]);
  }

  showPendingInput() {
    if (this.promptReady) {
      this.setInput(this.input);
    }
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

  private trackTotalOutput(delta: number) {
    this.totalLinesOutput += delta;
    // console.log(this.totalLinesOutput); // DEBUG
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
    /** Write prompt */
    key: 'prompt';
    prompt: string;
  }
);
