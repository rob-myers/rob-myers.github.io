import styled from '@emotion/styled';
import React from 'react';
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
        {...href === '#' && { onClick: (e) => {
            e.preventDefault();
            // TODO trigger command
            console.log('link triggered command:', title);
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
        style={{
          float: 'right',
          fontSize: props.rem ? `${props.rem}rem` : undefined,
        }}
      >
        {children}
      </span>
    );
  }
};

const Root = styled.div`
  font-size: 14pt;
  
  p {
    line-height: 1.4;
  }
  code {
    background: #eee;
    font-weight: lighter;
    font-size: 13pt;
    padding: 0 4px;
  }
  ul {
    margin: 20px 0;
    line-height: 1.2;
    li {
      margin: 8px 0;
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
      font-size: 4.5rem;
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
