import codemirror from 'codemirror';

type CodeMirror = typeof codemirror;

Object.assign(codemirror.commands, {

  noOp: () => {},

  /**
   * Based on https://github.com/codemirror/CodeMirror/blob/master/addon/comment/comment.js
   */
  customToggleComment: (cm: CodeMirror) => {
    const mode = (cm.getMode as any)() as CodeMirror.Mode<any>;
    if(mode.name === 'jsx-styled') {
      console.log('customToggleComment', mode);
      // TODO {/** ... */}
      // TODO /** ... */
      // TODO //
    } else {
      // TODO use addon/comment/comment
    }
  },

});
