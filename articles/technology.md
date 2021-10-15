## Technology

So, we're going to build a roguelike, directly on this website.
The next few articles are dedicated to the technologies we'll use, providing relevant background and motivation.
The table below expands upon constraints [mentioned earlier](/part/1#constraints--technology "@anchor").

| Concept | Technology |
| ------- | ---------- |
| Component | [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components), and [Web Components](https://reactjs.org/docs/web-components.html). |
| Styles | CSS-in-JS via [Goober](https://www.npmjs.com/package/goober). |
| Component framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |
| Pathfinding | Based on [three-pathfinding](https://www.npmjs.com/package/three-pathfinding).  |
| Raycasting | Basic geometry and spacial partitioning.  |
| Static analysis | TypeScript via [JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html); also [ESLint](https://www.npmjs.com/package/eslint). |
| Live analysis | In-browser terminal, via [xterm.js](https://www.npmjs.com/package/xterm) and [mvdan-sh](https://www.npmjs.com/package/mvdan-sh). |
| Scripting | [TS Node](https://www.npmjs.com/package/ts-node) i.e. Node.js with types. |
| Code viewing | [CodeMirror](https://codemirror.net/) to view JS. |
| Code editing | External [CodeSandbox](https://codesandbox.io/) links, using React. |
| Code sharing | Show [GitHub](https://github.com/) comments, provide GitHub [repo](https://github.com/rob-myers/rob-myers.github.io). |

<!-- Our in-browser terminal is built using [Xterm.js](https://xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js). -->
