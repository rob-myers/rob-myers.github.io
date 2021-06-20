import styled from '@emotion/styled';
import React from 'react';
import ReactMarkdown from 'react-markdown'

export default function Markdown({ children }: { children: string }) {
  return (
    <Root>
      <ReactMarkdown children={children} />
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
    /* font-family: sans-serif; */
    font-weight: lighter;
    font-size: 13pt;
  }
`;
