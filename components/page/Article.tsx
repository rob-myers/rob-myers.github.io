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
  @media(max-width: 1024px) {
    padding: 64px 128px 64px 128px;
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
    padding: 36px 48px;
    font-size: 0.9rem;
    border: 0 solid #ddd;
    background: #eee;

    p {
      margin: 12px 0;
    }
    p + blockquote, blockquote + p {
      margin-top: 0px;
    }
    
    @media(max-width: 600px) {
      line-height: 2;
      padding: 24px;
    }

    blockquote {
      margin: 0;
      border-left: 8px solid #ccc;
    }
    figure.tabs {
      @media(min-width: 600px) {
        margin: 40px 0;
      }
    }

    position: relative;
    .anchor {
      position: absolute;
      top: -48px;
    }
  }

  blockquote {
    margin: 32px 0;
    border-left: 8px solid #ddd;
    padding-left: 30px;
    
    @media(max-width: 600px) {
      margin: 20px 0;
      padding-left: 20px;
    }
  }
  blockquote + p {
    margin-top: -12px;
    @media(max-width: 600px) {
      margin-top: 0;
    }
  }
  
  code {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    letter-spacing: 1px;
    color: #444;
    letter-spacing: 2px;
    padding: 0 2px;
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
    font-size: 3rem;
    @media(max-width: 1024px) {
      font-size: 2.8rem;
    }
    @media(max-width: 600px) {
      margin: 16px 0 24px;
      font-size: 2rem;
    }
  }
  h2 + time {
    display: block;
    margin-top: -24px;
    margin-bottom: 32px;
    font-family: monospace;
    font-size: 0.9rem;
    > span {
      margin-right: 16px;
      > span {
        padding: 4px 6px;
        background: #eee;
        border: 1px solid #ddd;
        color: #666;
      }
    }
    @media(max-width: 600px) {
      font-size: 0.8rem;
      margin-top: 0px;
      > span {
        padding: 3px 0px;
      }
    }
  }
  h2 + time + div.tags {
    margin-top: -12px;
    display: flex;
    flex-wrap: wrap;
    font-size: 0.7rem;
    font-family: sans-serif;
    letter-spacing: 2px;
    color: #fff;
    span {
      padding: 4px 8px;
      margin-right: 4px;
      margin-bottom: 4px;
      background: #99a;
      border-radius: 3px;
      border: 2px solid rgba(0, 0, 0, 0.1);
    }
    @media(max-width: 600px) {
      font-size: 0.65rem;
      span {
        padding: 3px 8px;
      }
    }
  }
  h3 {
    font-size: 1.7rem;
    @media(max-width: 600px) {
      font-size: 1.3rem;
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

  p + blockquote {
    margin-top: -20px;
    @media(max-width: 600px) {
      margin-top: -4px;
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
          prePush={`#${id}`}
          title={title}
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
      <time dateTime={meta.dateTime}>
        {meta.dateText.split(' ').map(
          (word) => <span>
            {Array.from(word).map(letter => <span>{letter}</span>)}
          </span>
        )}
      </time>
      <div className="tags" title="tags">
        {meta.tags.map(tag => <span>{tag}</span>)}
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
