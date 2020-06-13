# Local

- [x] Migrate `ReactFreshBabelPlugin.js` to singleton class written in typescript.
- [ ] Don't transpile multiple editors with same model
- [ ] Fix auto-commenting i.e. when directly inside JSX tags use (multiline) brace-comments
  > replaced code action by dummy console.log
  > NEXT: send code/position/selection to worker to figure out new code
- [ ] Can transpile arbitrary tsx via 'hidden' monaco model
- [x] Integrate `golden-layout` (use previous approach) on new page `/dev`.
- [ ] Create `dev-env.duck`.
- [x] Rename worker.duck as editor.duck
- [x] Error boundary around mounted `App`
- [ ] Syntax highlighting debounced, better and safer
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
- [ ] Understand why `react-refresh` is remounting index.tsx
- [x] Start integrating our own version of `gitalk`
   > can retrieve issue and comments
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
