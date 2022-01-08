import { css } from "goober";
import { articlesMeta, getArticleHref } from "articles/index";
import useSiteStore from "store/site.store";
import Link from "./Link";
import { barHeight } from "./Nav";

export default function NavMini() {
  const meta = useSiteStore(x => x.articleKey ? articlesMeta[x.articleKey] : null);
  const prev = meta?.prev ? articlesMeta[meta.prev] : null;
  const next = meta?.next ? articlesMeta[meta.next] : null;

  return meta?.index ? (
    <nav className={rootCss}>
      <ul>
        <li>
          <Link href={getArticleHref(prev || meta)} backward>
            <span className="prev">prev</span>
          </Link>
        </li>
        <li>
          <Link href={getArticleHref(meta)}>
            <a className="primary">{meta.index}</a>
          </Link>
        </li>
        <li>
          <Link href={getArticleHref(next || meta)}>
            <span className="next">next</span>
          </Link>
        </li>
      </ul>
    </nav>
  ) : null;
}

const width = 140;

const rootCss = css`
  position: absolute;
  z-index: 10;
  right: ${width}px;
  top: -48px;
  @media(max-width: 1024px) { top: -32px; }
  @media(max-width: 600px) { top: 0; }

  font-size: 1rem;

  > ul {
    background: #000;
    position: fixed;
    width: ${width}px;
    height: ${barHeight}px;

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;

    li {
      list-style: none;
      list-style-position: inside;
      padding: 0 5px;
    }
    a {
      color: #ccc;
    }
    a.primary {
      color: #fff;
    }
  }
`;
