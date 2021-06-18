import styled from "@emotion/styled";

export const Section = styled.section<{}>`
  border-radius: 0 0 12px 12px;
  border: 1px solid #ddd;
  padding: 0 16px 16px 24px;
  margin-bottom: 24px;
  font-size: 20px;

  @media(max-width: 800px) {
    padding: 0 12px 4px 4px;
    border: 0;
  }
`;

export const SideBySide = styled.section<{ height: number }>`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: 100%;
  height: ${props => props.height}px;

  @media(max-width: 800px) {
    grid-template-columns: 100%;
    grid-template-rows: 50% 50%;
    height: ${props => 2 * props.height}px;
  }
`;
