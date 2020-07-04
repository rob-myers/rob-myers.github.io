## Improve Monaco TSX Syntax Highlighting

Some initial links:
> https://blog.expo.io/building-a-code-editor-with-monaco-f84b3a06deaf

> https://github.com/cancerberoSgx/jsx-alone/blob/master/jsx-explorer/HOWTO_JSX_MONACO.md

Note:
- in tsx the `//` below is actually literal text:
  ```tsx
  <div>
    // <span/>
  </div>
  ```
  and transpiles to:
  ```ts
  React.createElement("div", null,
    "// ",
    React.createElement("span", null));
  ```
  
- however, the monaco editor syntax-highlights as above i.e. it looks like a comment.
- aside from this mismatch there are other issues e.g. jsx elements are all highlighted white, so we'll handle syntax highlighting ourselves


The following approach looks best.

- Prism provides a syntax-highlighter for `tsx` which is better than what monaco offers. Beware that it still doesn't actually handle above case correctly, but handles it better i.e. it no longer looks like a comment.
  > https://prismjs.com/test.html#language=tsx

- Example of integrating prism with monaco editor.
  > https://github.com/rekit/rekit-studio/blob/master/src/features/editor/workers/syntaxHighlighter.js
  > https://github.com/rekit/rekit-studio/blob/master/src/features/editor/setupSyntaxWorker.js


## Can `react-refresh` run in the browser?

Our runtime code could import from our own patched `react`:
- our `useState` provides initial values from last version
- our `useEffect` avoids unneeded iterations
- our `useRef` remembers

Perhaps can use intermediary 'manifest module' to avoid blob renaming problem.
This is not urgent e.g. not part of MVP.
