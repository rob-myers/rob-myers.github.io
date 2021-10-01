import codemirror from 'codemirror';

Object.assign(codemirror.commands, {

  noOp: () => {},

  /**
   * Based on https://github.com/codemirror/CodeMirror/blob/master/addon/comment/comment.js
   */
  customToggleComment: function (cm: CodeMirror) {
    const mode = (cm.getMode as any)() as CodeMirror.Mode<any>;

    if(mode.name === 'jsx-styled') {
      const doc = (cm as any).doc as CodeMirror.Doc;
      const ranges = doc.listSelections();
      const lines = (doc as any).children[0].lines as Line[];

      for (const range of ranges) {
        const [from, to] = [range.from(), range.to()];
        const selection = lines.slice(from.line, to.line + 1);
        // console.log(selection);
        if (selection.every(x => x.styles.every(y => typeof y !== 'string' || y === 'comment'))) {
          // Currently includes case {/** ... */}
        }
        // const [first, last] = [lines[from.line].text, lines[to.line].text];
        // console.log({ first, last });
        // if (first.match(/^\s*\{\s*\/\*+/) && last.match(/\*\/\s*\}\s*$/)) {
        //   console.log(lines[from.line], lines[to.line]);
        // }
      }
      
      // TODO {/** ... */}
      // TODO /** ... */
      // TODO //
    } else {
      // TODO use addon/comment/comment
    }
  },

});

type CodeMirror = typeof codemirror;

interface Line extends CodeMirror.LineHandle {
  height: number;
  markedSpans: any;
  order: boolean;
  parent: any;
  startAfter: any;
  styles: (number | null | string)[];
}
