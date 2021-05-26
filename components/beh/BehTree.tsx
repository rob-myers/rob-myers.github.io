import styled from "@emotion/styled";

export default function BehTree() {
  return (
    <Root>
      Behaviour tree
    </Root>
  );
}

const Root = styled.section<{}>`
  grid-area: beh;
  background: red;
`;
