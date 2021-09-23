import classNames from 'classnames';
import { css } from 'goober';
import Sep from './Sep';

export default function Article(props: React.PropsWithChildren<{
  className?: string;
  dateTime: string;
  dateText: string;
  title?: boolean;
}>) {
  return <>
    <article className={classNames('blog', props.className, blogCss)}>
      <time dateTime={props.dateTime}>
        {props.dateText}
      </time>
      {props.children}
    </article>
    <Sep/>
  </>;
}

const blogCss = css`
  position: relative;
  > time {
    position: absolute;
    right: -10px;
    top: -50px;
    background: var(--border-bg);
    color: #555;
    border-radius: 6px 6px 0 0;
    padding: 12px;
    font-size: 1rem;

    @media(max-width: 800px) {
      top: 16px;
      right: 0;
      border-radius: 0 0 0 4px;
      background: none;
      font-size: 1.1rem;
    }
  }

  line-height: 1.6;
  font-size: 1.2rem;
  background: var(--focus-bg);
  padding: 48px 96px 96px 96px;
  border: var(--blog-border-width) solid var(--border-bg);

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
    margin: 24px 0;
    @media(max-width: 800px) {
      margin: 8px 0;
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
