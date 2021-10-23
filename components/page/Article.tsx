import React from 'react';
import { NextRouter, useRouter } from 'next/router';
import classNames from 'classnames';
import { css } from 'goober';

import { getTabsId } from 'model/tabs/tabs.model';
import { ArticleKey, articlesMeta } from 'articles/index';
import useSiteStore from 'store/site.store';
import Link from './Link';
import Sep from './Sep';
import Markdown from './Markdown';
import Tabs from './Tabs';

export default function Article(props: React.PropsWithChildren<{
  className?: string;
  dateTime: string;
  articleKey: ArticleKey;
  children: string;
}>) {

  const router = useRouter();

  const dateText = React.useMemo(() => {
    const d = new Date(props.dateTime);
    return `${d.getDate()}${dayth(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, [props.dateTime]);

  const components = React.useMemo(
    () => articleComponents(props.articleKey, router),
    [props.articleKey],
  );

  return <>
    <article
      className={classNames(props.className, articleCss)}
    >
      <span className="anchor" id={props.articleKey} />
      <time dateTime={props.dateTime}>
        {dateText}
      </time>
      <Markdown
        children={props.children}
        components={components}
      />
    </article>
    <Sep/>
  </>;
}

const articleCss = css`
  line-height: 1.6;
  background: var(--focus-bg);
  border: var(--blog-border-width) solid var(--border-bg);
  font-size: 1.1rem;
  
  padding: 64px 128px 96px 128px;
  @media(max-width: 800px) {
    padding: 32px 64px 48px 64px;
  }
  @media(max-width: 600px) {
    padding: 8px 12px;
    font-size: 1.1rem;
    border: none;
    line-height: 1.7;
  }

  a {
    code {
      color: unset;
    }
    position: relative;
    > span.anchor {
      position: absolute;
      top: -96px;
    }
  }
  a.new-tab-link::after {
    display: inline-block;
    content: '';
    background-image: url('/icon/ext-link-icon.svg');
    background-size: 13px 13px;
    height: 13px;
    width: 13px;
    margin-left: 2px;
  }
  a.anchor-link::after {
    display: inline-block;
    content: '';
    background-image: url('/icon/anchor-icon.svg');
    background-size: 13px 13px;
    height: 13px;
    width: 13px;
    margin: 0 2px 0 4px;
  }

  aside {
    margin: 32px 0;
    padding: 8px 32px;
    border-radius: 8px;
    border: 2px dashed #ccc;
    font-size: 1rem;
    @media(max-width: 600px) {
      margin: 8px 0;
      padding: 0 16px;
    }

    p {
      margin: 20px 0;
    }
    > blockquote {
      margin: 0;
    }
    > figure.tabs {
      @media(max-width: 600px) {
        padding: 8px 0 12px;
      }
    }
  }

  blockquote {
    margin: 32px 0;
    border-left: 10px solid #ddd;
    padding-left: 30px;
    
    @media(max-width: 600px) {
      margin: 20px 0;
      padding-left: 20px;
    }
  }
  
  code {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    letter-spacing: 1px;
    color: #444;
    letter-spacing: 2px;
    padding: 0 2px;
  }

  div.small-print {
    font-size: smaller;
  }

  figure {
    margin: 0;
  }
  
  figure.tabs {
    border: 10px solid #333;
    border-radius: 8px;
    margin: 48px 0;
    @media(max-width: 600px) {
      margin: 32px 0;
    }

    position: relative;
    > span.anchor {
      position: absolute;
      top: -96px;
    }
  }

  h1, h2, h3, h4 {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-weight: 400;
    a {
      color: #008;
    }
  }
  h2 {
    font-size: 2.4rem;
    @media(max-width: 600px) {
      margin: 16px 0 24px;
      font-size: 2rem;
    }
    @media(max-width: 800px) {
      font-size: 2.2rem;
    }
  }
  h3 {
    font-size: 1.7rem;
    @media(max-width: 600px) {
      font-size: 1.3em;
    }
    @media(max-width: 800px) {
      font-size: 1.4em;
    }

    position: relative;
    > span.anchor {
      position: absolute;
      top: -48px;
    }
  }

  p {
   margin: 32px 0;
   @media(max-width: 600px) {
     margin: 16px 0;
   }

   code {
     font-size: 1rem;
   }
  }

  span.cmd {
    color: #555;
    background: #ddd;
    font-family: monospace;
    letter-spacing: 1px;
    font-size: smaller;
    padding: 2px 4px;
    @media(max-width: 600px) {
      user-select: all;
    }
  }

  > span.anchor {
    position: absolute;
    top: -48px;
  }

  table {
    padding: 8px;
    border: 1px solid #bbb;
    width: 100%;
    margin: 40px 0;
    @media(max-width: 600px) {
      margin: 20px 0;
    }
    th, td {
      padding: 6px;
      text-align: left;
      vertical-align: top;
      font-size: 1.1rem;
      @media(max-width: 600px) {
        font-size: 1rem;
        padding: 4px 2px;
      }
    }
  }

  position: relative;
  > time {
    position: absolute;
    right: -10px;
    top: -50px;
    width: 136px;

    background: var(--border-bg);
    text-align: center;
    color: #555;
    border-radius: 6px 6px 0 0;
    padding: 12px;
    font-size: 1rem;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;

    @media(max-width: 600px) {
      top: 16px;
      right: 0;
      border-radius: 0 0 0 4px;
      background: none;
      font-size: 1.1rem;
      width: unset;
      margin-top: 8px;
    }
  }

  ul, ol {
    @media(max-width: 600px) {
      padding-left: 20px;
    }
    + p {
      padding-top: 6px;
    }
  }

  ul li, ol li {
    margin: 4px 0;
  }

`;

const articleComponents = (articleKey: ArticleKey, router: NextRouter) => ({

  a({ node, href, title, children, ...props}: any) {

    // Relative link with added auto-anchor
    if (title === '@anchor') {
      const id = getArticleLinkId(articleKey, children);
      const part = Number((href || '').split('#')[0]) || null;
      return (
        <Link
          href={href}
          className="anchor-link"
          id={id}
          title={title}
          prePush={`#${id}`}
          backward={!!part && (part < articlesMeta[articleKey].part)}
        >
          {children}
        </Link>
      );
    }

    // New tab link
    if (title === '@new-tab') {
      return (
        <a
          href={href}
          title={title}
          className="new-tab-link"
          target="_blank"
          rel="noopener"
        >
          {children}
        </a>
      );
    }

    // Command link
    if (href === '#command') {
      return (
        <a
          href={href}
          title={title}
          onClick={async (e) => {
            e.preventDefault();
            const [cmd, ...args] = title.split(' ');

            switch (cmd) {
              case 'open-tab': {
                const [tabsName, tabKey] = args;
                const tabsKey = getTabsId(articleKey, tabsName);
                const tabs = useSiteStore.getState().tabs[tabsKey];
                tabs?.selectTab(tabKey);
                tabs?.scrollTo();
                break;
              }
              case 'sigkill': {
                import('store/session.store').then(({ default: useSessionStore }) => {
                  const { ttyShell } = useSessionStore.api.getSession(args[0])
                  ttyShell.xterm.sendSigKill();
                });
                break;
              }
              default:
                console.warn('link triggered unrecognised command:', title);
            }
          }}
        >
          {children}
        </a>
      );
    }

    // Otherwise, external link or relative link sans auto-anchor
    return (
      <Link
        href={href}
        title={title}
        id={getArticleLinkId(articleKey, children)}
      >
        {children}
      </Link>
    );

  },

  div({ node, ...props }: any) {
    switch (props.class) {
      case 'tabs': {
        const height = Number(props.height || 100);
        const def = React.useMemo(() => Function(`return ${props.tabs || '[]'}`)(), [props.tabs]);

        return (
          <Tabs
            height={height}
            tabs={def}
            enabled={props.enabled === 'true'}
            id={props.name ? getTabsId(articleKey, props.name) : ''}
          />
        );
      }
      default:
        return <div {...props} />;
    }
  },

  h2({ node, children, ...props }: any) {
    return (
      <h2 {...props}>
        <Link href={`#${articleKey}`}>
          <a>{children}</a>
        </Link>
      </h2>
    );
  },

  h3({ node, children, ...props }: any) {
    const id = React.useMemo(() => `${articleKey}--${
      React.Children.toArray(children)[0]
        .toString().toLowerCase().replace(/\s/g, '-')
    }`
  , []);

    return (
      <h3 {...props}>
        <span id={id} className="anchor" />
        <Link href={`#${id}`}>
          <a>{children}</a>
        </Link>
      </h3>
    );
  }

});

function childrenToKebabText(children: React.ReactChildren) {
  return React.Children.toArray(children)[0]
    .toString().toLowerCase().replace(/\s/g, '-');
}

const months = [
  'Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
];

function dayth(x: number) {
  if (x > 3) {
    return 'th';
  } else if (x === 1) {
    return 'st'
  } else if (x === 2) {
    return 'nd';
  } else if (x === 3) {
    return 'rd';
  }
}

/**
 * Hacky e.g. does not support markdown `[_foo_](bar)`.
 */
function getArticleLinkId(
  articleKey: string,
  children: React.ReactChildren,
) {
  return `${articleKey}--link--${childrenToKebabText(children)}`;
}
