# Infrastructure

- [ ] Create a Github App which can create gists for `@rob-myers`
- [ ] Get AWS-Lambda/DynamoDB working
- [ ] Get AWS-Lambda/DynamoDB working
- [ ] Get AWS-Lambda/S3 working
- [x] Create AWS account `rob-myers-2020`

# Local

- [ ] Rename worker.duck as dev-env.duck
- [ ] Error boundary around mounted `App`
- [ ] Syntax highlighting debounced and safer
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
