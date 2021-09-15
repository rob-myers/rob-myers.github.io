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
  @media(max-width: 600px) {
    padding-left: 8px;
    margin-top: 12px;
  }
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;

  h1 {
    font-size: 6rem;
    font-weight: 300;
    cursor: pointer;
    color: #333;
    margin: 0;
    
    @media(max-width: 800px) {
      font-size: 5rem;
    }
    @media(max-width: 600px) {
      font-size: 3.6rem;
    }
  }
  
  p {/** Site subtitle */
    color: #444;
    letter-spacing: 2px;
    font-size: 1.1rem;
    margin: 0;
    padding: 32px 0;
    
    @media(max-width: 600px) {
      padding: 20px 0;
    }
  }
`;

const blogCss = css`
  line-height: 1.5;
  font-size: 1.2rem;

  @media(max-width: 600px) {
    padding: 8px;
    font-size: 1.1rem;
  }

  h1, h2, h3, h4 {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-weight: 500;
  }
  h2 {
    font-size: 2rem;
    @media(max-width: 600px) {
      margin: 0;
      font-size: 1.8rem;
    }
  }

  ul li, ol li {
    margin: 4px 0;
  }

  code {
    font-family: sans-serif;
    letter-spacing: 1px;
    color: #444;
  }
  a code {
    color: unset;
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
    transition: 0.5s background-color ease;
    background: var(--body-bg);
    &:hover, &:active {
      background: var(--focus-bg);
    }

    padding: 8px;
    border: 1px solid #bbb;
    width: 100%;

    th, td {
      text-align: left;
      vertical-align: top;
      padding: 8px;
      @media(max-width: 540px) {
        padding: 4px 2px;
      }
    }
  }
`;
