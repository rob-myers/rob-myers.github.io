import styled from '@emotion/styled';
import React from 'react';
import ReactMarkdown from 'react-markdown'

export default function Markdown(props: ReactMarkdown.ReactMarkdownOptions) {
  return (
    <Root>
      {/* We explicitly skip html to hide html comments */}
      <ReactMarkdown skipHtml {...props} />
    </Root>
  );
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
  }
`;
