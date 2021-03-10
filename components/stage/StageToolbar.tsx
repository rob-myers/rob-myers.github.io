import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useState } from 'react';

const StageToolbar: React.FC<Props> = ({ stageKey }) => {
  const [enabled, setEnabled] = useState(true);

  return (
    <Toolbar>
      <span>
        @{stageKey}
      </span>
      <Button enabled={enabled} onClick={() => setEnabled(!enabled)}>
        camera
      </Button>
    </Toolbar>
  );
};

interface Props {
  stageKey: string;
}

const Toolbar = styled.section`
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  background-color: #edefff;
  display: grid;
  padding: 4px;
  grid-template-columns: auto 60px;
  gap: 8px;
`;

const Button = styled.span<{ enabled: boolean }>`
  cursor: pointer;
  ${({ enabled }) => css`
    color: ${enabled ? '#000' : '#999'};
  `}
`;

export default StageToolbar;