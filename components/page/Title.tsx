import { useRouter } from 'next/router';
import classNames from 'classnames';
import { css } from 'goober';
import Markdown from './Markdown';

export default function Title() {
  return (
    <header className={classNames('title', titleCss)}>
      <div className="top-block" />
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
  
  @media(max-width: 500px) {
    padding-left: 8px;
    border-bottom: 2px solid #999;
    border: 0 solid #000;
  }
  padding-top: 40px;

  h1 {
    margin: 0;
    font-size: 6rem;
    font-weight: 300;
    cursor: pointer;
    color: #333;
    display: inline-block;
    
    @media(max-width: 800px) {
      font-size: 5rem;
    }
    @media(max-width: 500px) {
      font-size: 3rem;
    }
  }
  
  /** Site subtitle */
  p {
    color: #444;
    letter-spacing: 2px;
    font-size: 1.4rem;
    margin: 0;
    padding: 40px 0 48px;
    font-weight: 300;
    
    @media(max-width: 500px) {
      font-size: 1rem;
      padding: 20px 0 20px 8px;
      color: #222;
    }
  }

`;
