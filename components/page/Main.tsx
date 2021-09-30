import { css } from "goober";
import Title from "./Title";

export default function Main({ children }: React.PropsWithChildren<{}>) {
  return (
    <main className={rootCss}>
      <Title />
      {children}
    </main>
  )
}

export const rootCss = css`
  padding: 48px 64px;
  @media(max-width: 1024px) {
    padding: 32px 64px;
    margin: 0;
  }
  @media(max-width: 800px) {
    padding: 32px 8px;
  }
  @media(max-width: 500px) {
    padding: 0;
  }
`;