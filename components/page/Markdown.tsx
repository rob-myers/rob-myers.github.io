import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';
import { styled } from 'goober';
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

  img({ children, ...props }: any) {
    return (
      <Figure>
        <img {...props}>{children}</img>
        {props['large-src'] && (
          <ZoomButton title="see larger image">
            zoom
          </ZoomButton>
        )}
      </Figure>
    );
  }
};

const Figure = styled('figure')`
  position: relative;
`;

const ZoomButton = styled('div')`
  position: absolute;
  top: calc(50% - 30px);
  left: calc(50% - 36px);
  width: 72px;
  padding: 6px 12px;
  font-size: 18px;

  text-align: center;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  background: rgba(0, 0, 0, 1);
  color: white;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid white;

  opacity: 0.4;
  &:hover {
    opacity: 0.6;
  }
`;