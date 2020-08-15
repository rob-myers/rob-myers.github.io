import css from './blog-header.scss';

const BlogHeader: React.FC<Props> = ({ date, number }) => {
  return (
    <div className={css.root}>
      <div className={css.topBorder} />
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
}

export default BlogHeader;
