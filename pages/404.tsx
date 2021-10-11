import { css } from 'goober';
import Main from 'components/page/Main';
import Markdown from 'components/page/Markdown';

export default function Page() {
  return (
    <Main>
      <Markdown className={rootCss} children={`
## 404

The requested path was not found:

<div />
      `} components={components} />
    </Main>
  );
}

const rootCss = css`
  background: #444;
  color: white;
  padding: 32px 32px 64px 32px;

  code {
    color: #aaa;
    font-size: larger;
  }
`;

const components = {
  div({ node, children, ...props }: any) {
    const path = typeof window === 'undefined'
      ? ''
      : location.pathname;
    return (
      <code>
        {path}
      </code>
    );
  },
};