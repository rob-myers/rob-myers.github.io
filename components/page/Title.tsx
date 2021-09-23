import { useRouter } from 'next/router';
import classNames from 'classnames';
import { css } from 'goober';
import Markdown from './Markdown';

export default function Title() {
  return (
    <header className={classNames('title', titleCss)}>
      <Markdown components={titleComponents} children={`
# Rogue Markup

$( game ai | roguelike | web dev )
    `}/>
    </header>
  );
}

const titleComponents = {
  h1({ children, ...props }: any) {
    const router = useRouter();
    return (
      <h1
        onClick={() => router.push('/')}
        {...props}
      >
        {children}
      </h1>
    );
  },
};

const titleCss = css`
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;

  @media(max-width: 800px) {
    padding-left: 8px;
    margin-top: 12px;
    border-bottom: 1px solid #999;
  }

  h1 {
    font-size: 6rem;
    font-weight: 300;
    cursor: pointer;
    color: #333;
    margin: 0;
    
    @media(max-width: 800px) {
      font-size: 5rem;
    }
    @media(max-width: 600px) {
      font-size: 3.6rem;
    }
  }
  
  /** Site subtitle */
  p {
    color: #666;
    letter-spacing: 2px;
    font-size: 1.4rem;
    margin: 0;
    padding: 48px 0 64px;
    
    @media(max-width: 800px) {
      font-size: 1.1rem;
      padding: 20px 0 24px;
    }
  }
`;
