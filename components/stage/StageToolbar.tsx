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
  }, [canToggleRunning, stage?.opts.enabled]);

  const toggleCam = useCallback(() => {
    stage && useStage.api.updateOpts(stage.key, {
      panZoom: !stage.opts.panZoom,
    });
  }, [stage?.opts.panZoom]);

  const onSelectSpawn = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    stage && useStage.api.spawnMesh(stage.key, e.currentTarget.value);
  }, [stage]);

  const cancelSelection = useCallback(() => {
    stage?.opts.canCancelUi && useStage.api.deselectBrush(stage.key);
  }, [stage?.opts.canCancelUi]);

  return (
    <Toolbar>
      {stage && <>

        <LeftToolbar>
          <Slot>
            @<strong>{stage.key}</strong>
          </Slot>
          <Slot background="#eee">
            <Button
              emphasis={!canToggleRunning}
              onClick={toggleRunning}
              {...stage.opts.enabled && {
                title: 'click to pause',
              }}
              style={{
                color: stage.opts.enabled ?  '#030' : '#300'
              }}
            >
              {stage.opts.enabled ? 'running' : 'paused'}
            </Button>
          </Slot>
          <Slot>
            <SelectSpawn
              disabled={!stage.opts.enabled || !canToggleRunning}
              value="disabled"
              onChange={onSelectSpawn}
            >
              <option key="disabled" value="disabled" disabled>spawn</option>
              <option key="Crate" value="Crate">Crate</option>
            </SelectSpawn>
          </Slot>
        </LeftToolbar>

        <RightToolbar>
          <Slot background="#eee">
            <Button
              disabled={!stage.opts.canCancelUi}
              onClick={cancelSelection}
            >
              cancel
            </Button>
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
        </RightToolbar>
      </>}
    </Toolbar>
  );
};

interface Props {
  stage: StageMeta | null;
}

const Toolbar = styled.section`
  display: flex;
  justify-content: space-between;
  user-select: none;

  height: 28px;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding: 4px 8px;
  background-color: white;
`;

const LeftToolbar = styled.section`
  display: grid;
  grid-template-columns: 42px 60px auto;
  gap: 8px;
`;

const SelectSpawn = styled.select`
  display: flex;
`;

const RightToolbar = styled.section`
  display: grid;
  grid-template-columns: auto 66px;
  gap: 4px;
`;

const Slot = styled.div<{ background?: string }>`
  display: flex;
  justify-content: center;
  ${({ background }) => css`
    background: ${background};
  `}
`;

const Button = styled.div<{ disabled?: boolean; emphasis?: boolean }>`
  cursor: pointer;
  padding: 0 4px;
  font-size: 11pt;

  ${({ disabled = false }) => css`
    color: ${disabled ? '#999' : '#000'};
  `}
  ${({ emphasis = false }) => emphasis && css`
    font-style: italic;
  `}
`;

export default StageToolbar;