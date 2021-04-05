import { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { StageMeta } from "model/stage/stage.model";
import useStage from "store/stage.store";

const StageToolbar: React.FC<Props> = ({ stage }) => {
  const [canToggleRunning, setCanToggleRunning] = useState(true);

  const toggleRunning = useCallback(() => {
    if (canToggleRunning && stage) {
      useStage.api.updateOpts(stage.key, { enabled: !stage.opts.enabled });
      setCanToggleRunning(false);
      setTimeout(() => setCanToggleRunning(true), 1000);
    }
  }, [canToggleRunning, stage]);

  const toggleCam = useCallback(() => {
    stage?.opts.enabled && useStage.api.updateOpts(stage.key, {
      panZoom: !stage.opts.panZoom,
    });
  }, [stage]);

  return (
    <Toolbar>
      {stage && <>
        <LeftToolbar>
          <span>@<strong>{stage.key}</strong></span>
          <Button
            enabled
            onClick={toggleRunning}
            title={stage.opts.enabled ? 'click to pause' : 'click to resume'}
          >
            {stage.opts.enabled ? 'running' : 'paused'}
          </Button>
        </LeftToolbar>
        <span/>
        <Button
          enabled={stage.opts.enabled && stage.opts.panZoom}
          onClick={toggleCam}
          title={stage.opts.panZoom ? 'click to disable' : ''}
        >
          panzoom
        </Button>
      </>}
    </Toolbar>
  );
};

interface Props {
  stage: StageMeta | null;
}

const Toolbar = styled.section`
  display: grid;
  grid-template-columns: 100px auto 70px;
  gap: 8px;

  height: 28px;
  user-select: none;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding: 4px;
  background-color: white;
`;

const LeftToolbar = styled.section`
  display: grid;
  grid-template-columns: 42px auto;
  gap: 8px;
`;

const Button = styled.span<{ enabled: boolean }>`
  cursor: pointer;
  ${({ enabled }) => css`
    color: ${enabled ? '#000' : '#999'};
  `}
`;

export default StageToolbar;