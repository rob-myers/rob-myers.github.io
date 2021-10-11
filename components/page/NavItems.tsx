import Link from 'next/link'
import { css } from "goober";
import { navGroups, pagePrefix } from "articles/index";
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
          {navItems.map(({ key, label, info, part }, i) =>
            <li key={key} className={key === articleKey ? 'current' : undefined} >
              <Link
                href={`${pagePrefix}${part}#article-${key}`}
                scroll={false}
              >
                <a title={info}>
                  {part}{String.fromCharCode(97 + i)} {label}
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