import styled from "@emotion/styled";
import { css } from "@emotion/react";

export default function CodeToolbar({ codeKey }: Props) {
  return (
    <Root>
      <div>{codeKey}</div>
      <RightToolbar>
        <ResetButton>
          reset
        </ResetButton>
        <LazyloadButton greyed={false}>
          lazyload
        </LazyloadButton>
      </RightToolbar>
    </Root>
  );
}

interface Props {
  codeKey: string;
}

const Root = styled.section`
  font-size: 10pt;
  background: #222;
  color: #ddd;
  height: 28px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(100, 100, 100, 0.5);
`;

const RightToolbar = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  gap: 12px;
`;

const ResetButton = styled.div<{}>`
  outline: none;
  cursor: pointer;
  color: #ddd;
`;

const LazyloadButton = styled.div<{ greyed: boolean }>`
  outline: none;
  cursor: pointer;
  ${({ greyed = false }) => greyed
    && css`color: #777;`
    || css`color: #ddd;`}
`;