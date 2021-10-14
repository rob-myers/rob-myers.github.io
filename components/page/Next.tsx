import { css } from "goober";
import { ArticleMeta, getArticleHref } from "articles/index";
import Link from "./Link";

export default function NextArticle(props: Props) {
  return props.article ? (
    <div className={nextArticleCss}>
      <Link href={getArticleHref(props.article)} forward>
        Next
      </Link>
    </div>
  ) : null;
}

interface Props {
  article: null | ArticleMeta;
}

const nextArticleCss = css`
  font-size: 1.1rem;
  cursor: pointer;
  background: #666;
  
  height: 64px;
  display: flex;
  @media(min-width: 600px) {
    margin-top: 16px;
  }
  @media(min-width: 800px) {
    margin-top: -32px;
  }

  a {
    color: white;
    width: 100%;
    height: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;
