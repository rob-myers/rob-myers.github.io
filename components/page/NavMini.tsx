import Link from "next/link";
import { css } from "goober";
import { articlesMeta, getArticleHref } from "articles";
import useSiteStore from "store/site.store";
import { barHeight } from "./Nav";

export default function NavMini() {
  const meta = useSiteStore(x => x.articleKey ? articlesMeta[x.articleKey] : null);
  const prev = meta?.prev ? articlesMeta[meta.prev] : null;
  const next = meta?.next ? articlesMeta[meta.next] : null;

  return meta?.index ? (
    <div className={rootCss}>
      <nav>
        <Link href={getArticleHref(prev || meta)}>
          <a>prev</a>
        </Link>
        <Link href={getArticleHref(meta)}>
          <a className="primary">{meta.index}</a>
        </Link>
        <Link href={getArticleHref(next || meta)}>
          <a>next</a>
        </Link>
      </nav>
    </div>
  ) : null;
}

const width = 136;

const rootCss = css`
  position: absolute;
  z-index: 20;
  right: ${width}px;

  top: -48px;
  @media(max-width: 1024px) {
    top: -32px;
  }
  @media(max-width: 600px) {
    top: 0;
  }

  > nav {
    position: fixed;
    width: ${width}px;
    height: ${barHeight}px;
    background: rgba(0, 0, 0, 0.5);
    
    @media(min-width: 600px) {
      font-size: 1.1rem;
      background: rgba(0, 0, 0, 0.2);
      &:hover {
        background: rgba(0, 0, 0, 0.5);
      }
    }
    display: grid;
    grid-template-columns: 40% 20% 40%;

    a {
      color: #ccc;
      /* border: 1px solid #ddd; */
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 2px;
    }

    a.primary {
      color: #fff;
    }
  }
`;
