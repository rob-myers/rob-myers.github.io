import css from './citation.scss';

const Citation: React.FC<Props> = ({
  children,
  hash,
  label,
}) => (
  <div className={css.root}>
    <strong>[{label}]</strong>
    &nbsp;
    {
    //@ts-ignore
    <a name={hash}/>
    }
    {children}
  </div>
);

interface Props {
  /** e.g. `tur-50` */
  hash: string;
  /** e.g. `Tur50` */
  label: string;
}

export default Citation
