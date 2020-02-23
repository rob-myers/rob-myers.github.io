import css from './box.scss';

export const dim = 80;
/** Wall thickness. */
const wt = 4;
// const wt = 8;
/** Wall length */
const wl = dim - 2 * wt;

export const Box: React.FC<Props> = (props) => {
  const { all, n, e, s, w } = props;
  const N = all ? !n : n;
  const E = all ? !e : e;
  const S = all ? !s : s;
  const W = all ? !w : w;

  return (
    <div className={`navigable ${css.root}`}>
      {(N || W || props.nw) && <div className={css.tileBase} />}
      {N && <div className={css.tileBase} style={{ left: wt, width: wl }} />}
      {(N || E || props.ne) && <div className={css.tileBase} style={{ right: 0 }} />}

      {W && <div className={css.tileBase} style={{ top: wt, height: wl }} />}
      {E && <div className={css.tileBase} style={{ top: wt, right: 0, height: wl }} />}

      {(S || W || props.sw) && <div className={css.tileBase} style={{ bottom: 0 }} />}
      {S && <div className={css.tileBase} style={{ bottom: 0, left: wt, width: wl }} />}
      {(S || E || props.se) && <div className={css.tileBase} style={{ bottom: 0, right: 0 }} />}
    </div>
  );
};

interface Props {
  all?: boolean;
  n?: boolean;
  e?: boolean;
  s?: boolean;
  w?: boolean;
  ne?: boolean;
  se?: boolean;
  sw?: boolean;
  nw?: boolean;
}

export const Row: React.FC<
  Pick<React.CSSProperties, 'width' | 'justifyContent'>
> = ({ children, width, justifyContent }) => (
  <div
    className={`navigable ${css.row}`}
    style={{ width, justifyContent }}
  >
    {children}
  </div>
);

export const Col: React.FC<
  Pick<React.CSSProperties, (
    | 'height'
    | 'justifyContent'
    | 'position'
  )>
> = ({ children, height, justifyContent, position }) =>
  <div
    className={`navigable ${css.column}`}
    style={{ height, justifyContent, position }}
  >
    {children}
  </div>;  