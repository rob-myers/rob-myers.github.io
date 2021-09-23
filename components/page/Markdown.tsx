import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';
import useSiteStore from 'store/site.store';

export default function Markdown(
  props: ReactMarkdown.ReactMarkdownOptions
) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]} // Permit html
      remarkPlugins={[gfm]}
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
};
