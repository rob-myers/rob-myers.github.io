import Link from 'next/link'
import { css } from "goober";
import { ArticleKey, articlesMeta, navGroups } from "articles/index";
import useSiteStore from "store/site.store";

export default function NavItems() {
  const articleKey = useSiteStore(x => x.articleKey);

  return (
    <section className={rootCss}>

      <h3>
        <Link href="/" scroll={false}>
          <a>Rogue Markup</a>
        </Link>
      </h3>

      {navGroups.map((navItems, i) =>
        <ul key={i}>
          {navItems.map(({ key, label, info, href, page }) =>
            <li key={key} className={key === articleKey ? 'current' : undefined} >
              <Link
                href={`${href}#${key}`}
                scroll={!articleKey || articlesMeta[articleKey]?.page !== page}
              >
                <a title={info}>
                  {label}
                </a>
              </Link>
            </li>
          )}
        </ul>
      )}

    </section>
  );
}

function triggerScroll(navKey: ArticleKey) {
  setTimeout(() => useSiteStore.setState({ targetNavKey: navKey, navAt: Date.now() }));
}

const rootCss = css`
  padding: 0;
  color: #aaa;
  
  h3 {
    padding: 20px 12px;
    font-size: 1.8rem;
    font-weight: 300;
    margin: 0;
    a {
      color: #aaa;
    }
    border: 0 solid #aaa;
    border-width: 0 0 2px;
  }
  
  ul {
    font-size: 1.2rem;
    padding: 6px 0;
    margin: 0;
    border: 0 solid #aaa;
    border-width: 0 0 2px;

    li {
      list-style: none;
      list-style-position: inside;
      display: flex;
    }
    li.current {
      a {
        color: white;
      }
    }
    a {
      padding: 10px 12px;
      width: 100%;
      color: #888;
      &:hover {
        color: #ccc;
      }
    }
  }
`;