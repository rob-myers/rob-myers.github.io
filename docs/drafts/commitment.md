# `Com(mit|ment)`

### Premise 1

- It is hard making web apps by yourself or in isolated groups.
- Let's make them together in the browser, stored in GitHub Gists.

### Premise 2

Top down agent engine via SVG and CSS.
- A source of components and a driving force.
- Represented as a bunch of `react` components and `redux` reducers.
- `react-refresh` and `replaceReducer` preserves game state

### MVP Summary

- Can edit/render `tsx?|scss` files in the browser.
- Can comment & post code if you're a GitHub user.
- Can import code from comment e.g.
  ```ts
  import Component from '@rob-myers/button/4'
  ```

### Code restrictions

We want to maximize effectiveness of react-refresh and hot-reloading e.g. for interactive game development. We propose the following:

- no reflexive/cyclic dependencies (required due to blob urls).
- `app.tsx` is root component and all `tsx` files have it as an ancestor.
- `reducer.ts` is root reducer and all `ts` files have it as an ancestor.
- `ts` and `tsx` trees are disjoint i.e. neither imports from the other.
- `tsx` files only export React components.
- `useSelector` and `useDispatch` is typed via reducer files i.e. the connection between component and state is via types only.


### Tech stack

- GitHub Pages
- Send code/comments via GitHub OAuth + GitHub API
- Store code inside GitHub Gists
- Caching via AWS-Lambda/DynamoDB/S3



