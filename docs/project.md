# Com(mit|ment)

### Premise

- It is hard making web apps by yourself or in isolated groups.
- Let's make them together in the browser, stored in GitHub Gists.

### MVP Summary

- Can edit/render `tsx?|scss` files in the browser.
- Can comment & post code if you're a GitHub user.
- Can import code from comment e.g.
  ```ts
  import Component from '@rob-myers/button/4'
  ```

### Tech stack

- GitHub Pages
- Send code/comments via GitHub OAuth + GitHub API
- Store code inside GitHub Gists
- Caching via AWS-Lambda/DynamoDB/S3

### Top-down css/svg agent engine

A source of components and a driving force.

- Represented as a bunch of `react` components.
- hmr preserves game state
