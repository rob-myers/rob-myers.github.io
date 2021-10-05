import Link from 'next/link'
import { css } from "goober";
import { articlesMeta } from "articles/index";
import useSiteStore from "store/site.store";

const navItems = Object.values(articlesMeta)
  .filter((x) => x.page > 0 && x.href);

export default function NavItems() {
  const articleKey = useSiteStore(x => x.articleKey);

  return (
    <section className={rootCss}>
      <h3>
        <Link href="/" scroll={false}>
          <a>
            Rogue Markup
          </a>
        </Link>
      </h3>
      <ul>
        {navItems.map(({ key, label, info, href, page }) =>
          <li
            className={key === articleKey ? 'current' : undefined}
          >
            <Link
              href={href}
              scroll={!articleKey || articlesMeta[articleKey]?.page !== page}
            >
              <a 
                onClick={() => {
                  setTimeout(() => useSiteStore.setState({ lastNavKey: key }));
                }}
                title={info}
              >
                {label}
              </a>
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}

const rootCss = css`
  padding: 0;
  color: #aaa;
  
  h3 {
    padding: 0 12px;
    font-size: 1.8rem;
    font-weight: 300;
    margin: 16px 0;
    a {
      color: #aaa;
    }
  }
  
  ul {
    font-size: 1.2rem;
    padding: 0;
    margin: 0;

    li {
      list-style: none;
      list-style-position: inside;
      padding: 8px 12px;
      display: flex;
      background: #111;
    }
    li.current {
      a {
        color: white;
      }
    }
    a {
      width: 100%;
      color: #888;
      &:hover {
        color: #ccc;
      }
    }
  }
`;