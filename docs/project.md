# Diffs

_Premise_:
- It can be hard to make web apps by yourself or in isolated groups.
- Let's make them together via GitHub comments.

### MVP Summary

- Can edit `tsx` file in the browser.
- Can render `tsx` file in the browser.
- Can comment if you're a GitHub user
- Can start new post via a comment including some embedded code e.g.
  ```tsx
  import * as React from 'react';
  const Component: React.FC = () => null;
  export default Component;
  ```
- Can edit code and send comment with diff. Can load diff from comment.
