import { css } from "goober";
import Title from "./Title";
import Sep from "./Sep";

export default function Main({ children }: React.PropsWithChildren<{}>) {
  return (
    <main className={rootCss}>
      <section>
        <Title />
        {children}
      </section>
    </main>
  )
}

export const rootCss = css`
  display: flex;
  flex-direction: column;
  padding-bottom: 2rem;
  max-width: 880px;  
  margin: 0 auto;
  
  @media(max-width: 700px) {
    margin: 0;
  }

  > section {
    padding: 48px 64px;
    @media(max-width: 1024px) {
      padding: 32px 64px;
      margin: 0;
    }
    @media(max-width: 800px) {
      padding: 32px 64px;
    }
    @media(max-width: 600px) {
      padding: 0;
    }
  }
`;