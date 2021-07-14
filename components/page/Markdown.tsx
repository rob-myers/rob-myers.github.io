import styled from '@emotion/styled';
import React from 'react';
import ReactMarkdown from 'react-markdown'

export default function Markdown(props: ReactMarkdown.ReactMarkdownOptions) {
  return (
    <Root>
      <ReactMarkdown
        components={components}
        skipHtml // We explicitly skip html to hide html comments
        {...props}
      />
    </Root>
  );
};

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
    line-height: 1.5;
  }
  code {
    background: #eee;
    font-weight: lighter;
    font-size: 13pt;
    padding: 0 4px;
  }
  ul {
    margin: 20px 0;
    line-height: 1.4;
    li {
      margin: 8px 0;
    }
  }
`;
