import Link from "next/link";
import { css } from "goober";
import { articlesMeta, getArticleHref } from "articles";
import useSiteStore from "store/site.store";

export default function NavMini() {
  const meta = useSiteStore(x => x.articleKey ? articlesMeta[x.articleKey] : null);

  return (
    <div className={rootCss}>
      <nav>
        {meta && (
          <Link href={getArticleHref(meta)}>
            <a>{meta.index}</a>
          </Link>
        )}
      </nav>
    </div>
  );
}

const rootCss = css`
  position: absolute;
  z-index: 20;
  right: 64px;

  top: -48px;
  @media(max-width: 1024px) {
    top: -32px;
  }
  @media(max-width: 600px) {
    top: 0;
  }

  nav {
    position: fixed;
    width: 64px;
    height: 32px;
    padding: 6px;
    background: black;
    color: white;
    display: flex;
    justify-content: center;
  }
  a {
    color: white;
  }
`;
