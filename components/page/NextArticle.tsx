import { css } from "goober";
import { ArticleMeta, getArticleHref } from "articles/index";
import Link from "./Link";

export default function NextArticle(props: Props) {
  const id = `next-article--${props.article?.key}`;
  return props.article ? (
    <div className={nextArticleCss}>
      <Link
        href={getArticleHref(props.article)}
        title="Continue to next article"
        id={id}
        prePush={`#${id}`}
      >
        Next
      </Link>
    </div>
  ) : null;
}

interface Props {
  article: null | ArticleMeta;
}

const nextArticleCss = css`
  height: 64px;
  font-size: 1.1rem;
  margin-top: -64px;
  @media(max-width: 800px) {
    margin-top: 0;
    font-size: 1rem;
  }

  display: flex;
  justify-content: center;
  align-items: center;

  a {
    color: #555;
    border: 1px solid #666;
    background: #fff;
    padding: 8px 16px;
    border-radius: 4px;
  }
`;
