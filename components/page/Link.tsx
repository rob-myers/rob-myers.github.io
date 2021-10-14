import Router from 'next/router';
import zenscroll from 'zenscroll';
import { pause } from 'model/generic.model';

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

        if (zenscroll.moving()) {
          return zenscroll.stop();
        }

        if (props.prePush) {
          await Router.push(props.prePush);
        }

        if (changePage) {
          await Router.push(pathname);
          if (!props.forward) {
            window.scrollTo({ top: document.body.scrollHeight });
          }
        }

        const el = document.getElementById(hash.slice(1));
        if (el) {// Browser-independent, controllable, smooth scroll
          const delta = Math.min(500, Math.abs(zenscroll.getTopOf(el) - scrollY));
          const ms = delta < 500 && !changePage
            ? 100 + 400 * (delta / 400) : 600;
          await new Promise<void>((resolve) => zenscroll.to(el, ms, resolve));
        }

        if (props.prePush && !changePage) {
          // Push hash into history if we didn't change page,
          // otherwise we'll overwrite the prePrush
          Router.push(hash)
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
