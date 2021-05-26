import styled from "@emotion/styled";

export const Section = styled.section<{}>`
  border-radius: 0 0 12px 12px;
  border: 1px solid #aaa;
  padding: 0 16px 16px 24px;
  margin-bottom: 24px;
  font-size: 20px;

  @media(max-width: 800px) {
    padding: 0 12px 4px 4px;
  }
`;