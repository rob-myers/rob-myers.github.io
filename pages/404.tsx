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
  background: #fff;
  padding: 32px;
  min-height: 300px;

  h2 {
    font-weight: 300;
    font-size: 2rem;
  }
  code {
    color: #a00;
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