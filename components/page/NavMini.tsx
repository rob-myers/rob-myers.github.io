import { css } from "goober";
import { articlesMeta, getArticleHref } from "articles/index";
import Link from "components/page/Link";
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
          {'<'}
        </Link>
        <Link href={getArticleHref(meta)}>
          <a className="primary">{meta.index}</a>
        </Link>
        <Link href={getArticleHref(next || meta)} bottom>
          {'>'}
        </Link>
      </nav>
    </div>
  ) : null;
}

const width = 96;

const rootCss = css`
  position: absolute;
  z-index: 10;
  right: ${width}px;
  top: -48px;
  @media(max-width: 1024px) { top: -32px; }
  @media(max-width: 600px) { top: 0; }

  > nav {
    position: fixed;
    width: ${width}px;
    height: ${barHeight}px;

    display: grid;
    grid-template-columns: 40% 20% 40%;

    a {
      color: #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 1px;
    }

    a.primary {
      color: #fff;
    }
  }
`;
