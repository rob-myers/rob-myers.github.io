import { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { StageOpts } from "model/stage/stage.model";
import useStage from "store/stage.store";

const StageToolbar: React.FC<Props> = ({ stageKey, opts }) => {
  const [canToggleRunning, setCanToggleRunning] = useState(true);

  const toggleRunning = useCallback(() => {
    if (canToggleRunning) {
      useStage.api.updateOpts(stageKey, { enabled: !opts.enabled });
      setCanToggleRunning(false);
      setTimeout(() => setCanToggleRunning(true), 1000);
    }
  }, [opts.enabled, canToggleRunning]);

  const enableUi = opts.enabled && canToggleRunning;
  
  const onSelectSpawn = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    enableUi && useStage.api.spawnMesh(stageKey, e.currentTarget.value);
  }, [enableUi]);

  const toggleCam = useCallback(() => {
    enableUi && useStage.api.updateOpts(stageKey, { panZoom: !opts.panZoom });
  }, [enableUi, opts.panZoom]);

  return (
    <Toolbar>
        <LeftToolbar>
          <Slot>
            @<strong>{stageKey}</strong>
          </Slot>
          <Slot background="#eee">
            <Button
              emphasis={!canToggleRunning}
              onClick={toggleRunning}
              {...opts.enabled && { title: 'click to pause' }}
              style={{
                color: opts.enabled ?  '#030' : '#300'
              }}
            >
              {opts.enabled ? 'running' : 'paused'}
            </Button>
          </Slot>
          <Slot>
            <SelectSpawn
              disabled={!enableUi}
              value="disabled"
              onChange={onSelectSpawn}
            >
              <option key="disabled" value="disabled" disabled>spawn</option>
              <option key="Crate" value="Crate">Crate</option>
              <option key="Barrel" value="Barrel">Barrel</option>
              <option key="MainFrame" value="MainFrame">MainFrame</option>
            </SelectSpawn>
          </Slot>
        </LeftToolbar>

        <RightToolbar>
          <Slot />
          <Slot>
            <Button
              greyed={!(enableUi && opts.panZoom)}
              {...enableUi && {
                onClick: toggleCam,
                ...opts.panZoom && { title: 'click to disable' },
              }}
            >
              panzoom
            </Button>
          </Slot>
        </RightToolbar>
    </Toolbar>
  );
};

interface Props {
  stageKey: string;
  opts: StageOpts;
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

const Button = styled.div<{ greyed?: boolean; emphasis?: boolean; }>`
  cursor: pointer;
  font-size: 11pt;

  ${({ greyed = false }) => css`
    color: ${greyed ? '#999' : '#000'};
  `}
  ${({ emphasis = false }) => emphasis && css`
    font-style: italic;
  `}
`;

export default StageToolbar;