import { useRouter } from 'next/router';
import React from 'react';
import { css } from 'goober';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';
import classNames from 'classnames';
import useSiteStore from 'store/site.store';

export default function Markdown(
  props: ReactMarkdown.ReactMarkdownOptions & {
    title?: boolean;
  }
) {
  return (
    <div
      className={classNames(
        props.className,
        props.title ? 'title' : 'blog',
        props.title ? titleCss : blogCss,
      )}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]} // Permit html
        remarkPlugins={[gfm]}
        components={props.title ? titleComponents : blogComponents}
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

const blogComponents = {
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
            const [cmd, ...args] = title.split(' ');
            switch (cmd) {
              case 'open-tab': {
                const [tabsKey, tabKey] = args;
                const tabs = useSiteStore.getState().tabs[tabsKey];
                if (tabs) {// in case tabs not enabled yet 
                  tabs.selectTab(tabKey),
                  tabs.scrollIntoView();
                }
                break;
              }
              default:
                console.warn('link triggered unrecognised command:', title);
            }
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

const titleCss = css`
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;

  @media(max-width: 800px) {
    padding-left: 8px;
    margin-top: 12px;
    border-bottom: 1px solid #999;
  }

  h1 {
    font-size: 6rem;
    font-weight: 300;
    cursor: pointer;
    color: #333;
    margin: 0;
    
    @media(max-width: 800px) {
      font-size: 5rem;
    }
    @media(max-width: 800px) {
      font-size: 3.4rem;
    }
  }
  
  /** Site subtitle */
  p {
    color: #444;
    letter-spacing: 2px;
    font-size: 1.4rem;
    margin: 0;
    padding: 48px 0 64px;
    
    @media(max-width: 800px) {
      font-size: 1.1rem;
      padding: 20px 0 24px;
    }
  }
`;

const blogCss = css`
  line-height: 1.6;
  font-size: 1.2rem;
  background: var(--focus-bg);
  padding: 64px 96px 96px 96px;
  border: var(--blog-border-width) solid #ccc;

  @media(min-width: 800px) {
    &.bot-sm {
      padding-bottom: 24px;
      border-bottom: none;
    }
    &.top-sm {
      padding-top: 24px;
      border-top: none;
    }
  }
  
  @media(max-width: 800px) {
    padding: 8px 12px;
    font-size: 1.1rem;
    border: none;
  }

  h1, h2, h3, h4 {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-weight: 400;
  }
  h2 {
    font-size: 2.4rem;
    @media(max-width: 800px) {
      margin: 16px 0 0 0;
      font-size: 1.8rem;
    }
  }
  h3 {
    font-size: 1.6rem;
    @media(max-width: 800px) {
      font-size: 1.3em;
    }
  }

  a code {
    color: unset;
  }

  blockquote {
    @media(max-width: 800px) {
      margin-left: 16px;
    }
  }

  code {
    font-family: sans-serif;
    letter-spacing: 1px;
    color: #444;
  }

  > img {
    margin: 12px 0 8px;
    @media(max-width: 800px) {
      margin: 8px 0;
    }
  }

  span.float {
    float: right;
    color: #555;
    user-select: none;
    @media(max-width: 480px) {
      float: unset;
      display: block;
      margin-top: 8px;
    }
  }

  table {
    padding: 8px;
    border: 1px solid #bbb;
    width: 100%;
    @media(min-width: 800px) {
      margin: 32px 0;
    }

    th, td {
      text-align: left;
      vertical-align: top;
      padding: 8px;
      @media(max-width: 540px) {
        padding: 4px 2px;
      }
    }
  }

  ul, ol {
    @media(max-width: 800px) {
      padding-left: 32px;
    }
    + p {
      padding-top: 6px;
    }
  }

  ul li, ol li {
    margin: 4px 0;
  }
`;
