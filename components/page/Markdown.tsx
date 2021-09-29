import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import useSiteStore from 'store/site.store';
import Tabs from './Tabs';

export default function Markdown(
  props: ReactMarkdown.ReactMarkdownOptions
) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]} // Permit html
      remarkPlugins={[remarkGfm]}
      components={props.components || blogComponents}
      {...props}
    />
  );
}

const blogComponents = {
  a({ node, href, title, children, ...props}: any) {
    return (
      <a
        href={href}
        title={title}
        {...['@new-tab'].includes(title) && {
          className: 'new-tab-link',
          target: '_blank',
          rel: 'noopener',
        }}
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

  div(props: any) {
    switch (props.className) {
      case 'tabs': {
        const height = Number(props.height || 100);
        const def = Function(`return ${props.tabs || '[]'}`)();
        // console.log({ height, def });
        return (
          <Tabs
            height={height}
            tabs={def}
            enabled={!!props.enabled}
            storeKey={props.storeKey}
          />
        );
      }
      default:
        return <div {...props} />;
    }
  }
};
