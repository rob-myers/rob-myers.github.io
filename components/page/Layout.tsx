import styled from "@emotion/styled";

export const Main = styled.main<{}>`
  display: flex;
  flex-direction: column;
  padding-bottom: 2rem;
  margin: 0 auto;
  
  max-width: 1000px;

  @media(max-width: 700px) {
    margin: 0;
  }
`;

export const Section = styled.section<{}>`
  padding: 32px 120px;
  margin: 48px 0;
  font-size: 20px;
  background: white;
  
  @media(max-width: 1024px) {
    margin: 0;
  }
  @media(max-width: 800px) {
    border: 0;
    padding: 0 16px 16px 16px;
  }
`;
