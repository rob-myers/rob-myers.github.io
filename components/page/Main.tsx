import { css } from "goober";
import Title from "./Title";

export default function Main({ children }: React.PropsWithChildren<{}>) {
  return (
    <section className={rootCss}>
      <Title />
      <main>
        {children}
        <div style={{ height: 400, background: 'red', position: 'fixed' }}>Hi</div>
      </main>
    </section>
  );
}

export const rootCss = css`
  max-width: 1024px;
  width: 100%;

  padding: 40px 64px;
  @media(max-width: 1024px) {
    padding: 32px 0 32px 40px;
    margin: 0;
  }
  @media(max-width: 600px) {
    padding: 0;
  }
`;
