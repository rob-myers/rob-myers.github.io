import Router from 'next/router';
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

        if (pathname === location.pathname) {
          if (hash) {
            document.getElementById(hash.slice(1))
              ?.scrollIntoView({ behavior: 'smooth' });
            await pause(800);
            props.onBefore?.();
            Router.push(hash);
          }
        } else if (props.forward) {
          if (window.scrollY + 32 < document.body.scrollHeight - window.innerHeight) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            await pause(800);
          }
          props.onBefore?.();
          await Router.push(pathname);
          window.scrollTo({ top: 0 });
          if (hash) {
            await pause(100);
            document.getElementById(hash.slice(1))
              ?.scrollIntoView({ behavior: 'smooth' });
            await pause(800);
            Router.replace(hash);
          }
        } else {
          if (window.scrollY > 32) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            await pause(800);
          }
          props.onBefore?.();
          if (hash) {
            await Router.push(pathname);
            window.scrollTo({ top: document.body.scrollHeight });
            document.getElementById(hash.slice(1))
              ?.scrollIntoView({ behavior: 'smooth' });
            await pause(800);
            Router.replace(hash);
          } else {
            Router.push(props.href);
          }
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
  onBefore?: () =>  void; 
  /** Scroll to bottom first */
  forward?: boolean;
}>