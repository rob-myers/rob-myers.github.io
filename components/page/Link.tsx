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
        props.onBefore?.();
        const { pathname, hash } = new URL(props.href, location.href);

        if (pathname !== location.pathname) {
          await Router.push(pathname);
          window.scrollTo({ top: props.forward ? 0 : document.body.scrollHeight });
          await pause(100);
        }

        const el = document.getElementById(hash.slice(1));
        if (el) {
          // Browser-independent, controllable, smooth scroll
          const delta = Math.min(500, Math.abs(zenscroll.getTopOf(el) - scrollY));
          const ms = delta < 500 ? 100 + 400 * (delta / 400) : 1000;
          await new Promise<void>(
            (resolve) => zenscroll.to(el, ms, resolve)
          );
        }
        Router.replace(hash);
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
  onBefore?: () =>  void; 
  /**
   * Scroll to start of next page, then smooth scroll down.
   * Scroll to end of next page, then smooth scroll up.
   */
  forward?: boolean;
}>
