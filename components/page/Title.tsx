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
# Starship Markup

$( game ai | roguelike | web dev )
      `}/>
    </header>
  );
}

const titleComponents = {
  h1({ children, node, ...props }: any) {
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
  position: relative;
  
  @media(max-width: 600px) {
    background: #eee;
    padding-bottom: 8px;
    padding-left: 8px;
    border-bottom: 1px solid #aaa;
    padding-top: 64px;
  }
  padding-top: 40px;
  
  h1 {
    margin: 0;
    font-size: 6rem;
    font-weight: 300;
    font-family: Georgia, 'Times New Roman', Times, serif;
    cursor: pointer;
    color: #333;
    display: inline-block;
    
    @media(max-width: 800px) {
      font-size: 5rem;
    }
    @media(max-width: 600px) {
      font-size: 3.5rem;
    }
  }
  
  /** Site subtitle */
  p {
    color: #444;
    letter-spacing: 3px;
    font-size: 0.8rem;
    font-family: sans-serif;
    margin: 0;
    padding: 40px 0 48px;
    font-weight: 300;
    
    @media(max-width: 600px) {
      padding: 20px 0 20px 4px;
      color: #222;
    }
  }

`;
