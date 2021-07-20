import React from 'react';
import styled from '@emotion/styled';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export default function Markdown(
  props: ReactMarkdown.ReactMarkdownOptions & { title?: boolean }
) {
  return React.createElement(
    props.title ? TitleRoot : Root,
    undefined,
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={components}
      skipHtml // We explicitly skip html to hide html comments
      {...props}
    />
  );
}

const components = {
  a({node, href, title, children, ...props}: any) {
    return (
      <a
        href={href}
        title={title}
        {...href === '#command' && { onClick: (e) => {
            e.preventDefault();
            // TODO trigger command
            console.warn('link triggered command:', title);
        }}}
        {...props}
      >
        {children}
      </a>
    );
  },
  float({ children, ...props }: any) {
    return (
      <span
        {...props}
        className="float"
        style={{
          ...props.style,
          fontSize: props.rem ? `${props.rem}rem` : undefined,
        }}
      >
        {children}
      </span>
    );
  },
};

const Root = styled.div`
  font-size: 14pt;
  
  p {
    line-height: 1.4;
  }
  code {
    font-size: 13pt;
    font-family: 'Courier New', Courier, monospace;
  }
  ul {
    margin: 20px 0;
    line-height: 1.2;
    li {
      margin: 8px 0;
    }
  }
  span.float {
    float: right;
    color: #555;
    @media(max-width: 480px) {
      float: unset;
      display: block;
    }
  }
`;

const TitleRoot = styled.div`
  /** Site title */
  h1 {
    margin: 48px 0 12px;
    font-size: 7rem;
    
    @media(max-width: 1024px) {
      margin: 12px 0;
      font-size: 5.8rem;
    }
    @media(max-width: 800px) {
      font-size: 5rem;
    }
    @media(max-width: 540px) {
      font-size: 3.4rem;
    }
  }

  /** Site subtitle */
  p {
    margin: 0 0 48px 0;
    border-bottom: 4px solid #000;
    padding: 0 0 8px;
    color: #333;
    font-size: 1.2rem;
    letter-spacing: 1px;

    @media(max-width: 1000px) {
      margin: 0 0 32px 0;
    }
  }
`;
