# Diffs

### Premise

- It can be hard to make web apps by yourself or in isolated groups.
- Let's make them together via GitHub comments.

### MVP Summary

- Can edit `tsx` file in the browser.
- Can render `tsx` file in the browser.
- Can comment if you're a GitHub user.
  > Actually, we'll restrict to manually added collaborators for a specific repo e.g. `rob-myers/diffs-issues`. Each such collaborator must authorise our GitHub OAuth App.
- Can start new post by posting some valid code e.g.
  ```tsx
  import * as React from 'react';
  const Component: React.FC = () => null;
  export default Component;
  ```
- Can edit code and send comment with diff.
- Can load diff from comment.

### Tech stack

- GitHub Pages
- Cached GitHub API access via AWS-Lambda/DynamoDB/S3
