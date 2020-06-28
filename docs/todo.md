# Local

- [x] detect `js` cyclic dep caused by `export { App } from './index'`
- [ ] handle persistence across multiple tabs
  > don't sync; create multiple persisted stores and can save/select
  > warn if multiple unsaved projects open
- [x] aim towards 'properly hmr' top-down svg/css 3d agent engine
  > see project.md; see `with-bash-and-level` branch
- [ ] can import `scss` into `tsx` as css module
- [ ] `scss` gets mounted inside `style` tag
- [ ] `scss` supports `@import` when no cyclic deps
  > sass.js does not support `@use`
  > sass files need to be stratified (not transpiled css)
- [x] prefix sass classes using a sass parser
  > https://www.npmjs.com/package/scss-parser
- [x] `scss` gets transpiled too
- [x] ensure initial mount without opening unseen files
- [x] add home icon returning to `/`
- [x] mount/unmount es modules via `<script>`s
- [x] patch import specifiers of transpiled js
- [ ] fix sporadic bug: drag indicator corresponds to open file
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
- [ ] Can toggle per-panel menu.
- [x] Migrate `ReactFreshBabelPlugin.js` to singleton class written in typescript.
- [x] Don't transpile multiple editors with same model
- [ ] Fix auto-commenting i.e. when directly inside JSX tags use (multiline) brace-comments
  > replaced code action by dummy console.log
  > NEXT: send code/position/selection to worker to figure out new code
- [x] Integrate `golden-layout` (use previous approach) on new page `/dev`.
- [x] Rename worker.duck as editor.duck
- [x] Error boundary around mounted `App`
- [ ] Syntax highlighting should be debounced
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

Highlight fails e.g. `// {props.id}` but unlikely to happen and can be fixed via `{'//'} {props.id}`.
However, these cases do arise via auto-commenting, so we need to fix that.

Avoid having `index.tsx` and `index.ts` -- they both transpile to `index.js`,
leading to `emitSkipped` in monaco emit output.