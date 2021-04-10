import { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { StageMeta } from "model/stage/stage.model";
import useStage from "store/stage.store";

// TODO provide stageKey, opts and ready

const StageToolbar: React.FC<Props> = ({ stage }) => {
  const [canToggleRunning, setCanToggleRunning] = useState(true);

  const toggleRunning = useCallback(() => {
    if (canToggleRunning && stage) {
      useStage.api.updateOpts(stage.key, { enabled: !stage.opts.enabled });
      setCanToggleRunning(false);
      setTimeout(() => setCanToggleRunning(true), 1000);
    }
  }, [canToggleRunning, stage?.opts.enabled]);

  const uiEnabled = stage?.opts.enabled && canToggleRunning;

  const onSelectSpawn = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    stage && useStage.api.spawnMesh(stage.key, e.currentTarget.value);
  }, [stage?.key]);

  const toggleCam = useCallback(() => {
    stage && uiEnabled && useStage.api.updateOpts(stage!.key, {
      panZoom: !stage!.opts.panZoom,
    });
  }, [uiEnabled, stage?.opts.panZoom]);


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
              disabled={!uiEnabled}
              value="disabled"
              onChange={onSelectSpawn}
            >
              <option key="disabled" value="disabled" disabled>spawn</option>
              <option key="Crate" value="Crate">Crate</option>
            </SelectSpawn>
          </Slot>
        </LeftToolbar>

        <RightToolbar>
          <Slot>
            
          </Slot>
          <Slot>
            <Button
              disabled={!(uiEnabled && stage.opts.panZoom)}
              onClick={toggleCam}
              {...uiEnabled && {
                title: stage.opts.panZoom ? 'click to disable' : '',
              }}
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
  gap: 6px;
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
  font-size: 11pt;

  ${({ disabled = false }) => css`
    color: ${disabled ? '#999' : '#000'};
  `}
  ${({ emphasis = false }) => emphasis && css`
    font-style: italic;
  `}
`;

export default StageToolbar;