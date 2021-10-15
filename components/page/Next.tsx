import { css } from "goober";
import { ArticleMeta, getArticleHref } from "articles/index";
import Link from "./Link";

export default function NextArticle(props: Props) {
  return props.article ? (
    <div className={nextArticleCss}>
      <Link href={getArticleHref(props.article)} forward>
        continue
      </Link>
    </div>
  ) : null;
}

interface Props {
  article: null | ArticleMeta;
}

const nextArticleCss = css`
  cursor: pointer;
  font-family: sans-serif;
  letter-spacing: 4px;
  
  height: 64px;
  display: flex;
  margin-top: -64px;
  font-size: 1.3rem;
  @media(max-width: 800px) {
    font-size: 1.1rem;
    margin-top: 0px;
  }

  a {
    color: #555;
    width: 100%;
    height: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;
