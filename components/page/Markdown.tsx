import React from 'react';
import styled from '@emotion/styled';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';

export default function Markdown(
  props: ReactMarkdown.ReactMarkdownOptions & { title?: boolean }
) {
  return React.createElement(
    props.title ? TitleRoot : Root,
    undefined,
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]} // Permit html
      remarkPlugins={[gfm]}
      components={components}
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
  font-size: 1.2rem;
  @media(max-width: 540px) {
    font-size: 1.1rem;
  }
  
  p {
    line-height: 1.5;
  }
  code {
    font-size: 13pt;
    font-family: 'Courier New', Courier, monospace;
  }
  ul, ol {
    margin: 20px 0;
    line-height: 1.2;
    li {
      margin: 8px 0;
    }
  }
  ul.contains-task-list {
    padding-left: 12px;
    li.task-list-item {
      list-style: none;
    }
  }
  ol {
    line-height: 1.4;
  }
  span.float {
    float: right;
    color: #555;
    @media(max-width: 480px) {
      float: unset;
      display: block;
      margin-top: 8px;
    }
  }

  table {
    border: 1px solid #ccc;
    border-left: 4px solid #999;

    th, td {
      text-align: left;
      vertical-align: top;
      padding: 8px;
      @media(max-width: 540px) {
        padding: 4px 2px;
      }
    }
  }

  hr {
    margin: 32px 0 24px;
    height: 4px;
    background: #ddd;
    border-color: #ddd;
  }
`;

const TitleRoot = styled.div`
  /** Site title */
  h1 {
    margin: 48px 0 24px;
    font-size: 7rem;
    
    @media(max-width: 1024px) {
      margin: 12px 0 24px;
      font-size: 5.2rem;
    }
    @media(max-width: 800px) {
      font-size: 4.2rem;
    }
    @media(max-width: 400px) {
      font-size: 4rem;
    }
  }

  /** Site subtitle */
  p {
    margin: 0 0 48px 0;
    border-bottom: 4px solid #000;
    padding: 0 0 8px;
    color: #333;
    /* letter-spacing: 1px; */
    font-family: Courier, monospace;
    font-size: 1.2rem;
    
    @media(max-width: 1024px) {
      font-size: 1rem;
      margin: 0 0 32px 0;
    }
  }
`;
