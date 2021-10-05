import { articlesMeta } from "articles";
import { css } from "goober";
import useSiteStore from "store/site.store";

const navItems = Object.values(articlesMeta).filter(x => x.page !== null);

export default function NavItems() {
  const articleKey = useSiteStore(x => x.articleKey);

  return (
    <section className={rootCss}>
      <h3>
        <a href="/">
          Rogue Markup
        </a>
      </h3>
      <ul>
        {navItems.map(({ key, label, href }) =>
          <li
            className={key === articleKey ? 'current' : undefined}
          >
            <a href={href}>
              {label}
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}

const rootCss = css`
  padding: 0 0 0 20px;
  color: #aaa;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 400;
    margin: 16px 0;
    a {
      color: #aaa;
    }
  }
  
  ul {
    font-size: 1.2rem;
    padding: 0;
    margin: 0;
    a {
      color: #888;
      &:hover {
        color: #ccc;
      }
    }
    li {
      list-style: none;
      list-style-position: inside;
      padding: 6px 0;
    }
    li.current {
      a {
        color: white;
      }
    }
  }
`;