# A collaborative game engine

See [blog notes](./blog.md).

Although we provide a development environment, this is not our objective.
- We'll represent worlds using `react` e.g. level geometry via React components.
- The dev env will permit the user to interact with the world. 
- Rather than developing a UI or CLI, we'll make a "Game AI Editor" by providing a suitable hot-reloading react project.

# Online Dev Environment

- [x] cleanup `DevPanelOpener`
- [x] merge layout Select into opts Select
- [x] merge `DevPanelMenu` into golden-layout header
- [x] implement close/reset/load project
- [x] remove support for adding packages -- unneeded complexity
- [x] fix jsPathErrors markers for aliased module specifiers
- [ ] `bipartite` package is project with demo
- [x] can ensure packages and have loaded `bipartite` package
- [x] projects have a layout via `layout.saved`
- [ ] package files are read-only
- [x] panel title shows package filename as `@{package}/rest/of/path`
  > somewhat misleading because must use `@package/{package}/rest/of/path`.
- [ ] start work on svg-based rectilinear level-designer
- [ ] convert npm module `rectangle-decomposition` into a package
- [x] use `@package` instead of `@module`
- [x] packages manifest includes transitive dependencies
- [x] packages manifest includes dependencies
- [x] load code at runtime using packages manifest
- [x] build `public/packages/manifest.json` by watching `public/packages` 
- [x] create projects and modules inside `public/packages`
- [x] can save current files to disk as json
- [x] resolve files like `@module/core/util`.
- [x] live tsconfig has alias `@module` resolving to top-level-dir `module`
- [x] move `declare module 'react-redux'` into `custom-types.d.ts`.
  > only at root, should not exist in our 'modules'
- [x] move `util` and `redux.model` to `module/core`
  > can import from `@module/core/util`, `@module/core/redux.model`.
- [ ] preserve large chunks during build
- [ ] add desktop/mobile layout; mobile layout prevents tab dragging/duplicating
- [ ] write a blog entry and show it in a doc panel
- [x] prevent app from rendering whilst reducer currently invalid
- [x] better useDispatch typings, supporting thunks
- [x] type `useDispatch` and `useSelector`
- [x] `useDispatch` and `useSelector` are working
- [x] separate bootstrap for transpiled ts files with entrypoint `reducer.ts`
- [x] create runtime redux store and wrap app in provider
- [x] integrate reducer, store/redux.model store/test.duck
- [x] rename `index.tsx` as `app.tsx`
- [x] resolve module specifiers properly e.g. ../foo
  > folders are supported by monaco
  > cached lookups
- [x] show error on ts importing tsx values (or vice-versa)
- [x] collect ts/tsx/js errors during import/export analysis in webworker
- [x] custom dropdown for better x-browser experience
- [x] support multiple projects
  > handle multiple tabs/windows
- [x] new panel type `doc` e.g. for blog and README
- [x] setup `mdx` and create demo test entry
- [x] fix syntax highlighting when switch to tsx
- [x] always show panel-menu and can toggle open 
- [x] fix App switch from panel menu
- [x] persist app panels on change layout (if same panelKey)
- [x] persist app when switch page
  > try https://github.com/httptoolkit/react-reverse-portal
- [x] react-refresh works without react dev-tools
- [ ] react-refresh can recover from render error
  > perhaps can revert to previous registrations?
- [ ] can invalidate react-refresh via changing exports
- [x] 1st working implementation of `react-refresh`.
- [x] react facade for dynamic modules, providing react from render-react.js
- [x] ensure next.js is not conflicting with our hook into react-refresh
- [x] garbage-collect blob urls
- [x] avoid changing `$RefreshReg$` (try-finally can't contain imports)
- [x] bootstrap react-refresh
- [x] provide redux/react-redux typings and can import
- [x] provide es modules redux and react-redux
- [x] implement `react-refresh` transform in syntax worker
- [x] remove reducer `gitalk`
- [x] can change current file or switch to App in panel menu
  > panelKey independent of app/file panel
  > DevPanel determined by devEnv.panelMeta[panelKey]
  > can switch between different files
- [x] merge `panelToApp` and `panelToFile` inside dev-env.duck.
- [x] store has version and wipes previous when version changes
- [x] initial relative path `./other.scss` inside sass crashes the app.
  > Fixed by restricting to reachable scss files in `detectScssImportError`.
- [x] can reset layout in menu
- [x] refresh css when scss dependency is updated
- [x] force scss files existence (else show error)
- [x] force code import paths to be relative (else show error)
- [x] force style import paths to be relative (else show error)
  > merge `pathIntervals` type in CodeFile and StyleFile
  > todo: add filepath error to CodeFile and StyleFile
  > todo: show error
- [x] bootstrap app even when no monaco editor panel initially open
- [x] detect `js` cyclic dep caused by `export { App } from './index'`
- [ ] handle persistence across multiple tabs
  > use local storage to track other tabs open
  > confirm if opening project which may be open by other tab
- [x] aim towards 'properly hmr' top-down svg/css 3d agent engine
  > see project.md; see `with-bash-and-level` branch
- [x] can import `scss` into `tsx` as css module
  > `scss` has associated esm module defined using filename alone.
  > achievable using ES6 proxy https://stackoverflow.com/a/7891968/2917822
- [x] `scss` gets mounted inside `style` tag
- [x] `scss` supports `@import` when no cyclic deps
  > sass.js does not support `@use`
  > sass files need to be stratified (not transpiled css)
- [x] prefix sass classes using a sass parser
  > https://www.npmjs.com/package/scss-parser
- [x] `scss` gets transpiled too
- [x] ensure initial mount without opening unseen files
- [x] add home icon returning to `/`
- [x] mount/unmount es modules via `<script>`s
- [x] patch import specifiers of transpiled js
- [x] fix sporadic bug: drag indicator corresponds to open file
  > haven't seen it for a while
- [x] move code/transpile disposables into `FileState`
- [x] recover from cyclic dependency via transpile invalid dependency
- [x] show code errors on cyclic dependency by recording imports in non-transpiled code too
- [x] store imports/exports ensuring acyclic, logging error
- [x] syntax worker analyzes transpiled js and extracts import/exports
- [x] typescript files can import from each other
  > default layout contains two files `index.tsx` and `model.ts`
- [x] Transpile via epic and store result, so can bootstrap app.
- [x] Track panel/file relationship in `dev-env.duck`.
- [x] Can see app.
  > could re-bootstrap app pre-transpile, if all others transpiled/up-to-date too.
  > need to know which imports js has, and must prevent cycles.
- [x] Create `dev-env.duck`.
- [x] Can toggle per-panel menu.
- [x] Migrate `ReactFreshBabelPlugin.js` to singleton class written in typescript.
- [x] Don't transpile multiple editors with same model
- [x] Fix auto-commenting i.e. when directly inside JSX tags use (multiline) brace-comments
  > replaced code action by dummy console.log
  > NEXT: send code/position/selection to worker to figure out new code
- [x] Integrate `golden-layout` (use previous approach) on new page `/dev`.
- [x] Rename worker.duck as editor.duck
- [x] Error boundary around mounted `App`
- [x] Syntax highlighting should be throttled
- [x] Mount transpiled react component (Dev)
  > transform `react` import path.
  > create javascript module with `src` via `Blob`.
  > import default export and render via `react-dom`.
- [x] Clean up transpile and transform
- [x] Auto-generate typescript definition files using:
  > https://stackoverflow.com/a/43776832/2917822
- [x] Redo syntax-highlighting
  > prismjs not good enough e.g. doesn't handle generics properly;
  > use this approach instead: https://github.com/microsoft/monaco-editor/issues/264#issuecomment-470777159
- [x] Import sass worker via module instead
  > https://github.com/medialize/sass.js/blob/HEAD/docs/getting-started.md#using-sassjs-with-a-module-loader
- [x] Syntax worker supports SASS -> CSS transpilation
- [x] Can tab between `tsx` and `scss`.
- [x] Have CSS editor too
- [x] Implement TSX syntax-highlighting using prism in worker
- [x] Rename global.duck as worker.duck and level.worker as syntax.worker
- [x] Understand why `react-refresh` is remounting index.tsx
   > probably because `useEffect` with empty deps gets re-rerun
- [x] Start integrating our own version of `gitalk`
   > can retrieve issue and comments
   > decided against `gitalk` -- will remove
- [x] Upgrade next.js; get `react-refresh` working
   > https://nextjs.org/blog/next-9-4
- [x] Prod monaco build
- [x] Dev monaco build

# Infrastructure

- [ ] Create a Github App which can create gists for `@rob-myers`
- [ ] Get AWS-Lambda/DynamoDB working
- [ ] Get AWS-Lambda/S3 working
- [ ] Get AWS-Lambda working
- [x] Create AWS account `rob-myers-2020`

# Notes

Highlight fails e.g. `// {props.id}` but unlikely to happen and can be fixed via `{'//'} {props.id}`. However, these cases do arise via auto-commenting, so we need to fix that.

Avoid having `index.tsx` and `index.ts` -- they both transpile to `index.js`,
leading to `emitSkipped` in monaco emit output. Prevent files that are prefixes of others, or fix this assumption in code.
