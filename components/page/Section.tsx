import styled from "@emotion/styled";

export const Section = styled.section<{}>`
  border-radius: 5px;
  border: 1px solid #ddd;
  padding: 0 16px 16px 16px;
  margin-bottom: 24px;
  font-size: 20px;

  @media(max-width: 800px) {
    padding: 0 12px 4px 4px;
  }
`;