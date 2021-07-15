import styled from '@emotion/styled';
import React from 'react';
import ReactMarkdown from 'react-markdown'

export default function Markdown(
  props: ReactMarkdown.ReactMarkdownOptions & { title?: boolean }
) {
  return React.createElement(
    props.title ? TitleRoot : Root,
    undefined,
    <ReactMarkdown
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
  }
}

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
  h1 {
    font-size: 7rem;
    margin: 0;
  }

  p {
    margin: 4px 0 42px;
    border-bottom: 4px solid #000;
    color: #fff;
    background: #456;
    padding: 8px;
    font-size: 1rem;
    letter-spacing: 1px;
  }
`;
