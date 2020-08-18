import css from './blog-header.scss';

const BlogHeader: React.FC<Props> = ({ date, number, border }) => {
  return (
    <div className={css.root}>
      {border && <div className={css.topBorder} />}
      <div className={css.rightMeta}>
        <div className={css.dateAndNumber}>
          {date} #{number}
        </div>
      </div>
    </div>
  )
};

interface Props {
  date: string;
  number: number;
  border?: boolean;
}

export default BlogHeader;
