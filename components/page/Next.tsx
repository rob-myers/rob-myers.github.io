import { css } from "goober";
import { ArticleMeta, getArticleHref } from "articles/index";
import Link from "./Link";

export default function NextArticle(props: Props) {
  return props.article ? (
    <div className={nextArticleCss}>
      <Link
        href={getArticleHref(props.article)}
        forward
        title="Continue to next article"
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
  }

  display: flex;
  justify-content: center;
  align-items: center;
  a {
    color: #444;
  }
`;
