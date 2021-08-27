import { useRouter } from 'next/router';
import React from 'react';
import { css } from 'goober';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';

export default function Markdown(
  props: ReactMarkdown.ReactMarkdownOptions & {
    title?: boolean
  }
) {
  return (
    <div className={props.title ? titleRootCss : rootCss} >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]} // Permit html
        remarkPlugins={[gfm]}
        components={props.title ? titleComponents : components}
        {...props}
      />
    </div>
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

const components = {
  a({node, href, title, children, ...props}: any) {
    return (
      <a
        href={href}
        {...['@new-tab'].includes(title) && {
          className: 'new-tab-link',
          target: '_blank',          
        }}
        title={title}
        {...href === '#command' && {
          onClick: (e) => {
            e.preventDefault();
            console.warn('link triggered command:', title);
          }
        }}
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

const rootCss = css`
  font-size: 1.2rem;
  @media(max-width: 540px) {
    font-size: 1.1rem;
  }
  
  p {
    line-height: 1.5;
  }
  code {
    font-size: 12pt;
    font-family: Courier, monospace;
    color: #444;
    background: #eee;
  }
  ul, ol {
    margin: 20px 0;
    line-height: 1.4;
    padding-left: var(--list-indent);

    li {
      margin: 8px 0;
      ul, ol {
        line-height: 1.2;
      }
    }
  }
  ul.contains-task-list {
    padding-left: 12px;
    li.task-list-item {
      list-style: none;
    }
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

const titleRootCss = css`
  h1 {
    margin: 48px 0 24px;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-size: 7.5rem;
    font-weight: 300;
    cursor: pointer;
    
    @media(max-width: 1024px) {
      margin: 12px 0 24px;
      font-size: 6rem;
    }
    @media(max-width: 800px) {
      font-size: 5rem;
    }
    @media(max-width: 400px) {
      font-size: 3.3rem;
    }
  }
  
  p {// Site subtitle
    color: #444;
    margin: 0 0 32px 0;
    padding-top: 16px;
    letter-spacing: 1px;
    font-size: 1rem;
    font-family: monospace;
   
    @media(max-width: 800px) {
      padding-top: 0;
    }
    @media(max-width: 400px) {
      font-size: 0.8rem;
    }
  }
`;
