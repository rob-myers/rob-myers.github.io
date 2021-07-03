import styled from "@emotion/styled";

export function Header() {
  return <>
    <Title>
      Hot modules
    </Title>
    <Subtitle>
      Modern web development illustrated via Game AI
    </Subtitle>
  </>;
}

const Title = styled.h1<{}>`
  margin-bottom: 2rem;
  line-height: 1;
  font-size: 7rem;
  color: #222;

  @media(max-width: 800px) {
    font-size: 5rem;
    padding-left: 10px;
  }
`;

const Subtitle = styled.h4<{}>`
  font-weight: normal;
  letter-spacing: 1px;

  margin: 0;
  padding: 24px 16px;
  background: #eee;
  color: #555;

  a {
    color: #000;
  }

  @media(max-width: 800px) {
    border-radius: 0;
    border-width: 1px 0;
    padding: 18px 12px;
  }
`;

export const Main = styled.main<{}>`
  display: flex;
  flex-direction: column;
  padding-bottom: 2rem;
  max-width: 1000px;
  margin: 0 auto;

  @media(max-width: 1024px) {
    margin: 0 1rem;
  }
  @media(max-width: 700px) {
    margin: 0;
  }
`;


export const Section = styled.section<{}>`
  border-radius: 0 0 12px 12px;
  border: 1px solid #ddd;
  padding: 0 16px 16px 24px;
  margin-bottom: 24px;
  font-size: 20px;

  @media(max-width: 800px) {
    border: 0;
    padding: 0 12px 16px 12px;
  }
`;
