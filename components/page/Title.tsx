import { useRouter } from 'next/router';
import classNames from 'classnames';
import { css } from 'goober';
import ReactMarkdown from 'react-markdown';

import NavMini from './NavMini';
// Continue reads from localStorage, so avoid SSR
import { Continue } from '../dynamic';

export default function Title() {
  return (
    <header className={classNames('title', titleCss)}>
      <NavMini/>
      <Continue />
      <ReactMarkdown components={titleComponents} children={`
# The Last Redoubt

$( video game | web dev | game ai )
      `}/>
    </header>
  );
}

const titleComponents = {
  h1({ children, node, ...props }: any) {
    const router = useRouter();
    return (
      <h1 onClick={() => router.push('/')}>
        {children}
      </h1>
    );
  },
};

const titleCss = css`
  position: relative;
  
  @media(max-width: 600px) {
    padding-left: 8px;
    /* border-bottom: 1px solid #bbb; */
  }
  
  h1 {
    margin: 0;
    font-size: 4.8rem;
    font-weight: 300;
    letter-spacing: 4px;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    cursor: pointer;
    color: #444;
    text-transform: uppercase;
    text-shadow: 0 0 2px #888888bb;
    background: linear-gradient(90deg, transparent, #66666699 75%, transparent 100%);
    padding-top: 40px;
    
    @media(max-width: 800px) {
      font-size: 3.5rem;
    }
    @media(max-width: 600px) {
      padding-top: 72px;
      font-size: 2.2rem;
      color: #333;
    }
  }
  
  /** Site subtitle */
  p {
    color: #424242;
    font-size: 1rem;
    font-family: 'Courier New', Courier, monospace;
    margin: 0;
    padding: 40px 0 48px;
    font-weight: 300;
    background: linear-gradient(90deg, transparent, #66666699 75%, transparent 100%);
    text-transform: lowercase;
    /* text-shadow: 0 0 2px #888888bb; */
    
    @media(max-width: 600px) {
      padding: 24px 0 28px 4px;
    }
  }

`;
