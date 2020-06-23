# Com|mit|ment

### Premise

- It can be hard to make web apps by yourself or in isolated groups.
- Let's make them together via GitHub Gists.

### MVP Summary

- Can edit/render `tsx` file in the browser.
- Can comment if you're a GitHub user.
  > Actually, we'll restrict to manually authorized users.
- Authorized user can start new post by posting named valid code e.g.
  ```tsx
  import * as React from 'react';
  const Component: React.FC = () => null;
  export default Component;
  ```
- Can edit code and send comment with (a) link to gist, (b) link to comment we 
- Can load code from comment
- Can import code from comment e.g.
  ```ts
  import Component from 'rob-myers/button/4'
  ```

### Tech stack

- GitHub Pages
- Cached GitHub API access via AWS-Lambda/DynamoDB/S3
