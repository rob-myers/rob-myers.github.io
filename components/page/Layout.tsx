import styled from "@emotion/styled";

export function Header() {
  return <>
    <Title>
      esc the base
    </Title>
    <Subtitle>
      building a topdown game using web dev
    </Subtitle>
  </>;
}

const Title = styled.h1<{}>`
  margin-top: 0;
  margin-bottom: 0;
  padding: 32px 12px;

  line-height: 1;
  font-size: 7rem;
  color: #222;
  background: #eee;

  @media(max-width: 800px) {
    padding: 24px 8px;
    font-size: 5rem;
  }
`;

const Subtitle = styled.h4<{}>`
  font-weight: normal;
  font-size: larger;
  letter-spacing: 1px;
  margin: 0;
  padding: 24px;
  background: #ddd;
  color: #555;
  
  @media(max-width: 800px) {
    font-size: unset;
    border-radius: 0;
    border-width: 1px 0;
    padding: 16px;
  }
`;

export const Main = styled.main<{}>`
  display: flex;
  flex-direction: column;
  padding-bottom: 2rem;
  max-width: 1000px;
  margin: 0 auto;

  @media(max-width: 700px) {
    margin: 0;
  }
`;

export const Section = styled.section<{}>`
  border: 1px solid #ddd;
  /* border-width: 1px 0 0 1px; */
  padding: 0 16px 16px 24px;
  margin-bottom: 24px;
  font-size: 20px;
  background: white;

  @media(max-width: 800px) {
    border: 0;
    padding: 0 12px 16px 12px;
  }
`;
