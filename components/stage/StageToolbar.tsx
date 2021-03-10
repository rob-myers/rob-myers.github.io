import styled from '@emotion/styled';
import { css } from '@emotion/react';
import useStage, { StoredStage } from 'store/stage.store';
import { useCallback } from 'react';

const StageToolbar: React.FC<Props> = ({ stage }) => {

  const toggleCam = useCallback(() => stage &&
    useStage.api.updateStage(stage.key, { camEnabled: !stage.camEnabled }),
  [stage?.camEnabled]);

  return (
    <Toolbar>
      {stage && <>
        <section>
          @<Title>{stage.key}</Title>
        </section>
        <Button
          enabled={stage.camEnabled}
          onClick={toggleCam}
        >
          camera
        </Button>
      </>}
    </Toolbar>
  );
};

interface Props {
  stage: StoredStage | null;
}

const Toolbar = styled.section`
  height: 28px;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  background-color: #edefff;
  display: grid;
  padding: 4px;
  grid-template-columns: auto 60px;
  gap: 8px;
`;

const Title = styled.span`
  font-weight: bold;
`;

const Button = styled.span<{ enabled: boolean }>`
  cursor: pointer;
  ${({ enabled }) => css`
    color: ${enabled ? '#000' : '#999'};
  `}
`;

export default StageToolbar;