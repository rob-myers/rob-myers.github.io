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
  }, [canToggleRunning, stage?.opts]);

  const toggleCam = useCallback(() => {
    stage && useStage.api.updateOpts(stage.key, {
      panZoom: !stage.opts.panZoom,
    });
  }, [stage?.opts]);

  const onSelectSpawn = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    stage && useStage.api.spawnMesh(stage.key, e.currentTarget.value);
  }, [stage?.opts]);

  return (
    <Toolbar>
      {stage && <>

        <LeftToolbar>
          <div>
            @<strong>{stage.key}</strong>
          </div>
          <Slot background="#eee">
            <Button
              emphasis={!canToggleRunning}
              onClick={toggleRunning}
              {...stage.opts.enabled && {
                title: 'click to pause',
              }}
            >
              {stage.opts.enabled ? 'running' : 'paused'}
            </Button>
          </Slot>
        </LeftToolbar>
        
        <Slot>
          <select
            disabled={!stage.opts.enabled || !canToggleRunning}
            value="disabled"
            onChange={onSelectSpawn}
          >
            <option key="disabled" value="disabled" disabled>spawn</option>
            <option key="Crate" value="Crate">Crate</option>
          </select>
        </Slot>

        <Slot>
          <Button
            disabled={!stage.opts.enabled || !canToggleRunning || !stage.opts.panZoom}
            onClick={toggleCam}
            title={stage.opts.panZoom ? 'click to disable' : ''}
          >
            panzoom
          </Button>
        </Slot>
      </>}
    </Toolbar>
  );
};

interface Props {
  stage: StageMeta | null;
}

const Toolbar = styled.section`
  display: grid;
  grid-template-columns: calc(42px + 64px) auto 70px;
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

const Slot = styled.div<{ background?: string }>`
  display: flex;
  ${({ background }) => css`
    background: ${background};
  `}
`;

const Button = styled.div<{ disabled?: boolean; emphasis?: boolean }>`
  cursor: pointer;
  display: flex;
  padding: 0 2px;

  ${({ disabled = false }) => css`
    color: ${disabled ? '#999' : '#000'};
  `}
  ${({ emphasis = false }) => emphasis && css`
    font-style: italic;
  `}
`;

export default StageToolbar;