## Technology

So, we're building a roguelike, directly on this website.
It will start to get fun once things are moving about.
Let us describe the underlying technologies.

| Concept | Technology |
| ------- | ---------- |
| Component | [React function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components), and [Web Components](https://reactjs.org/docs/web-components.html). |
| Styles | CSS-in-JS via [Goober](https://www.npmjs.com/package/goober). |
| Component framework | [Preact](https://preactjs.com/), a DOM-diffing alternative to React. |
| Pathfinding | Based on [three-pathfinding](https://www.npmjs.com/package/three-pathfinding).  |
| Raycasting | Basic geometry and spacial partitions.  |
| Static analysis | TypeScript via [JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html); also [ESLint](https://www.npmjs.com/package/eslint). |
| Live analysis | In-browser terminal, via [xterm.js](https://www.npmjs.com/package/xterm) and [mvdan-sh](https://www.npmjs.com/package/mvdan-sh). |
| Scripting | [TS Node](https://www.npmjs.com/package/ts-node) i.e. Node.js with types. |
| Code viewing | [CodeMirror](https://codemirror.net/) to view JS. |
| Code editing | External [CodeSandbox](https://codesandbox.io/) links, using React. |
| Code sharing | Show [GitHub](https://github.com/) comments, provide GitHub [repo](https://github.com/rob-myers/rob-myers.github.io). |

<!-- Our in-browser terminal is built using [Xterm.js](https://xtermjs.org/) and the shell parser [mvdan-sh](https://github.com/mvdan/sh/tree/master/_js). -->

### JavaScript

The early 90s brought three pillars: HTML, CSS and JavaScript (JS).
Whenever we visit a website we receive an HTML response, referencing or embedding CSS and JS.
Our web browser renders the HTML and CSS immediately, and runs the JS to provide interactivity.
More precisely, all subsequent DOM mutations are performed by JavaScript.
It is now common to generate the initial HTML using JS too,
either during a build-step or on a Node.js server.
In particular, JavaScript has become the central web technology.

The next article discusses our chosen JavaScript component framework.
It will be full of jargon, but relevant details can be picked up later on.
