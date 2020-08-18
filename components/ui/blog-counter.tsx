import css from './blog-counter.scss';

const BlogCounter: React.FC<Props> = ({ date, number }) => {
  return (
    <div className={css.root}>
      <div className={css.date}>
        {date}
      </div>
      <div className={css.number}>
        #{number}
        &nbsp;
      </div>
    </div>
  )
};

interface Props {
  date: string;
  number: number;
}

export default BlogCounter;
