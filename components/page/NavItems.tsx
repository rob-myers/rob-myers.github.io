import Link from 'next/link'
import { css } from "goober";
import { getArticleHref, navGroups, pagePrefix } from "articles/index";
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
          {navItems.map((meta) =>
            <li key={meta.key} className={meta.key === articleKey ? 'current' : undefined} >
              <Link
                href={getArticleHref(meta)}
                scroll={false}
              >
                <a title={meta.info}>
                  {meta.index} {meta.label}
                </a>
              </Link>
            </li>
          )}
        </ul>
      )}

    </section>
  );
}

const rootCss = css`
  padding: 0;
  color: #aaa;
  
  h3 {
    padding: 20px 12px;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
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
    font-size: 1.1rem;
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