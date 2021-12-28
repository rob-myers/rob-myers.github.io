import { css } from 'goober';
import Main from 'components/page/Main';
import Markdown from 'components/page/Markdown';

export default function Page() {
  return (
    <Main>
      <Markdown
        className={rootCss}
        children={`
## 404

The requested path was not found:

<div />
`       }
        components={components} />
    </Main>
  );
}

const rootCss = css`
  background: #eee;
  padding: 32px;
  min-height: 300px;
  font-size: 1.1rem;

  h2 {
    font-weight: 300;
    font-size: 2rem;
  }
  code {
    color: #f00;
  }
  
  @media(max-width: 600px) {
    background: #fff;
    padding: 8px;
    font-size: 1rem;
    h2 {
      margin: 8px 0 0;
      font-size: 1.8rem;
    }
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