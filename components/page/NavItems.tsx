import { css } from "goober";

export default function NavItems() {
  return (
    <section className={rootCss}>
      <h3>
        <a href="/">
          Rogue Markup
        </a>
      </h3>
      <ul>
        {navItems.map(({ label, href }) =>
          <li><a href={href}>{label}</a></li>
        )}
      </ul>
    </section>
  );
}

const navItems = [
  { label: 'objective', href: '/blog/1#objective'  },
  { label: 'constraints', href: '/blog/1#constraints'  },
  { label: 'technology', href: '/blog/2#technology'  },
  { label: 'technology (2)', href: '/blog/2#tech-2'  },
  { label: 'technology (3)', href: '/blog/2#tech-3'  },
  { label: 'geomorphs', href: '/blog/3'  },
];

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
  }
`;