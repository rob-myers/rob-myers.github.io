import { css } from "goober";
import Title from "./Title";

export default function Main({ children }: React.PropsWithChildren<{}>) {
  return (
    <section className={rootCss}>
      <Title />
      <main>
        {children}
      </main>
    </section>
  );
}

export const rootCss = css`
  max-width: 1280px;
  width: 100%;

  padding: 32px 0 32px 40px;
  margin: 0;
  @media(max-width: 600px) {
    padding: 0;
  }
`;
