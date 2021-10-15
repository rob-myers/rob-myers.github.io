import Router from 'next/router';
import { pause } from 'model/generic.model';
import { scrollFinish } from 'model/dom.model';

export default function Link(props: Props) {
  return (
    <a
      href={props.href}
      className={props.className}
      title={props.title}
      onClick={async (e) => {
        e.preventDefault();
        const { pathname, hash } = new URL(props.href, location.href);
        const changePage = pathname !== location.pathname;

        if (props.prePush) {
          await Router.push(props.prePush);
        }

        if (changePage) {
          await Router.push(pathname);
          window.scrollTo({ top: props.forward ? 0 : document.body.scrollHeight });
          await pause(50);
        }
        
        const el = document.getElementById(hash.slice(1));
        if (el) {
          const { top } = el.getBoundingClientRect();
          window.scrollBy({ top, behavior: 'smooth' });
          await scrollFinish();
        }

        if (props.prePush && !changePage) {
          // Push hash into history if we didn't change page,
          // otherwise we'll overwrite the prePrush
          Router.push(hash);
        } else {
          Router.replace(hash);
        }
      }}
    >
      {props.children}
    </a>
  );
}

type Props = React.PropsWithChildren<{
  href: string;
  title?: string;
  className?: string;
  /** Optional path to push before navigating, so can return afterwards */
  prePush?: string;
  /**
   * Scroll to start of next page, then smooth scroll down.
   * Scroll to end of next page, then smooth scroll up.
   */
  forward?: boolean;
}>
