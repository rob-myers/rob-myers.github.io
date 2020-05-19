## Improve Monaco JSX Syntax Highlighting

Some links:
> https://blog.expo.io/building-a-code-editor-with-monaco-f84b3a06deaf
> https://github.com/cancerberoSgx/jsx-alone/blob/master/jsx-explorer/HOWTO_JSX_MONACO.md

Note that:
- typescript tsx transpiler doesn't support comments inside jsx e.g. in:
  ```tsx
  <div>
    // <span/>
  </div>
  ```
  the `//` is viewed as literal text.
- monaco editor syntax highlights as above i.e. it looks like a comment.
- there are other issues, so we'll handle syntax highlighting ourselves

The following approach looks best.

- Syntax-highlighter for `tsx` which doesn't support comments inside jsx (what we want).
  > https://prismjs.com/test.html#language=tsx
- Example of using integrating prism with monaco editor.
  > https://github.com/rekit/rekit-studio/blob/master/src/features/editor/workers/syntaxHighlighter.js
  > https://github.com/rekit/rekit-studio/blob/master/src/features/editor/setupSyntaxWorker.js


## Can `react-refresh` run in the browser?

Our runtime code could import from our own patched `react`:
- our `useState` provides initial values from last version
- our `useEffect` avoids unneeded iterations
- our `useRef` remembers

Perhaps can use intermediary 'manifest module' to avoid blob renaming problem.
This is not urgent e.g. not part of MVP.

## Salvage bash implementation

- can keep `xterm` + tty
- vastly simplified language:
  - simple commands without redirects
  - simple parameter expansion
  - pipes, &&, ||
- flat filesystem with regular inodes only:
  - binary (e.g. image)
  - script (i.e. javascript function)
  - text (i.e. string)
- designed to be fast

But why do we need it?
