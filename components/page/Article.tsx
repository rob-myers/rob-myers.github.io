import React from 'react';
import classNames from 'classnames';
import { css } from 'goober';

import { getTabsId } from 'model/tabs/tabs.model';
import { ArticleKey, articlesMeta } from 'articles/index';
import useSiteStore from 'store/site.store';
import Link from './Link';
import Sep from './Sep';
import Markdown from './Markdown';
import Tabs from './Tabs';
import { iconCss } from './Icons';

export default function Article(props: React.PropsWithChildren<{
  className?: string;
  dateTime: string;
  articleKey: ArticleKey;
  children: string;
  tags: string[];
}>) {

  const dateText = React.useMemo(() => {
    const d = new Date(props.dateTime);
    return `${d.getDate()}${dayth(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, [props.dateTime]);

  const components = React.useMemo(
    () => articleComponents(props.articleKey, { dateTime: props.dateTime, dateText, tags: props.tags }),
    [props.articleKey],
  );

  return <>
    <article className={classNames(props.className, articleCss)}>
      <span className="anchor" id={props.articleKey} />
      <Markdown
        children={props.children}
        components={components}
      />
    </article>
    <Sep/>
  </>;
}

const articleCss = css`
  line-height: 2.2;
  background: var(--focus-bg);
  border: var(--blog-border-width) solid var(--border-bg);
  font-size: 1rem;
  overflow-wrap: break-word;
  position: relative; /** For anchors */
  
  padding: 64px 164px 96px 164px;
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

  aside {
    margin: 24px 0;
    padding: 20px 36px;
    font-size: 0.96rem;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #aaa;
    p {
      margin: 12px 0;
    }
    
    @media(max-width: 600px) {
      margin: 16px 0;
      padding: 16px;
      border-radius: 8px;
      p {
        margin: 8px 0;
      }
    }

    blockquote {
      margin: 0;
      border-left: 10px solid #ccc;
    }
    figure.tabs {
      @media(min-width: 600px) {
        margin: 40px 0;
      }
    }
    
    &:hover, &:active {
      background-color: #eee;
    }

    position: relative;
    .anchor {
      position: absolute;
      top: -48px;
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

  figure {
    margin: 0;
  }
  
  figure.tabs {
    border: 10px solid #444;
    margin:  64px 0;
    @media(max-width: 600px) {
      margin: 40px 0 32px 0;
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
      color: #444;
    }
    letter-spacing: 2px;
  }
  h2 {
    font-size: 2.6rem;
    @media(max-width: 600px) {
      margin: 16px 0 24px;
      font-size: 1.9rem;
    }
  }
  h2 + div.subtitle {
    margin-top: -16px;
    padding: 4px 8px;
    display: flex;
    flex-wrap: wrap;
    font-size: 0.75rem;
    
    time {
      color: #533;
    }
    
    ul.tags {
      font-family: monospace;
      display: inline-block;
      padding: 0;
      color: #777;
    }
    @media(max-width: 600px) {
      ul.tags {
        font-size: 0.8rem;
      }
    }
    ul.tags li {
      display: inline;
      margin: 0;
    }
    ul.tags li:not(:last-child):after {
      content: " | ";
    }

    @media(max-width: 600px) {
      background: none;
      padding: 0 0 8px;
      margin-top: -16px;
    }
  }
  h3 {
    font-size: 1.6rem;
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

  h2 + p, h3 + p {
    margin-top: 0px;
  }

  li blockquote {
    margin: 0;
    p {
      margin: 16px 0;
    }
  }

  p {
   margin: 40px 0;
   @media(max-width: 600px) {
     margin: 16px 0;
   }

   code {
     font-size: 1rem;
   }
  }

  span.cmd {
    color: #555;
    background: #eee;
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
      @media(max-width: 600px) {
        padding: 4px 2px;
      }
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

const articleComponents = (
  articleKey: ArticleKey,
  meta: {
    dateTime: string;
    dateText: string;
    tags: string[];
  },
) => ({

  a({ node, href, title, children, ...props}: any) {

    // Relative link with added auto-anchor
    if (title === '@anchor') {
      const id = getArticleLinkId(articleKey, children);
      const part = Number((href || '').split('#')[0]) || null;
      return (
        <Link
          href={href}
          className={classNames("anchor-link", iconCss('anchor-icon', '0 2px 0 4px'))}
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
          className={classNames("new-tab-link", iconCss('ext-link-icon', '0 2px 0 4px'))}
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

  aside({ node, children, title, ...props }: any) {
    const id = getAsideId(articleKey, title);
    return (
      <aside {...props}>
        <span {...title && { id }} className="anchor" />
        {children}
      </aside>
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

  // Occurs once in each article
  h2({ node, children, ...props }: any) {
    return <>
      <h2 {...props}>
        <Link href={`#${articleKey}`}>
          <a>{children}</a>
        </Link>
      </h2>
      <div className="subtitle">
        <ul className="tags">
          <li>
            <time dateTime={meta.dateTime}>
              {meta.dateText}
            </time>
          </li>
          {meta.tags.map(tag => <li>{tag}</li>)}
        </ul>
      </div>
    </>;
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
  
function getAsideId(
  articleKey: string,
  asideName: string,
) {
  return `${articleKey}--aside--${asideName}`;
}
