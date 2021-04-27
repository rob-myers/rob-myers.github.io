import { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { StageOpts, StageSelection } from "model/stage/stage.model";
import useStage from "store/stage.store";

const StageToolbar: React.FC<Props> = ({ stageKey, opts, selection }) => {
  const [canToggleRunning, setCanToggleRunning] = useState(true);

  const toggleRunning = useCallback(() => {
    if (canToggleRunning) {
      useStage.api.updateOpts(stageKey, { enabled: !opts.enabled });
      setCanToggleRunning(false);
      setTimeout(() => setCanToggleRunning(true), 1000);
    }
  }, [opts.enabled, canToggleRunning]);

  const enableUi = opts.enabled && canToggleRunning;
  const enableSelUi = enableUi && selection.enabled;

  const toggleSelectionEnabled = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    enableUi && useStage.api.updateSel(stageKey, ({ enabled }) => ({ enabled: !enabled }));
  }, [enableUi]);

  const toggleCam = useCallback(() => {
    enableUi && useStage.api.updateOpts(stageKey, ({ panZoom }) => ({ panZoom: !panZoom }));
  }, [enableUi]);

  return (
    <Toolbar>
      <LeftToolbar>
        <Slot>
          <StageKey>
            @{stageKey}
          </StageKey>
        </Slot>
        <Slot>
          <PauseButton
            onClick={toggleRunning}
            emphasis={!canToggleRunning}
          >
            {opts.enabled ? 'running' : 'paused'}
          </PauseButton>
        </Slot>
        <Slot>
          <SelectButton
            greyed={!enableSelUi}
            onClick={toggleSelectionEnabled}
            title={enableSelUi
              ? 'selection enabled'
              : 'selection disabled'}
          >
            select
          </SelectButton>
        </Slot>
      </LeftToolbar>
      <RightToolbar>
        <Slot />
        <Slot>
          <PanZoomButton
            greyed={!(enableUi && opts.panZoom)}
            {...enableUi && {
              onClick: toggleCam,
              ...opts.panZoom && { title: 'click to disable' },
            }}
          >
            panzoom
          </PanZoomButton>
        </Slot>
      </RightToolbar>
    </Toolbar>
  );
};

interface Props {
  stageKey: string;
  opts: StageOpts;
  selection: StageSelection;
}

const Toolbar = styled.section`
  display: flex;
  justify-content: space-between;
  user-select: none;

  height: 26px;
  min-height: 26px;
  font-size: 16px;
  padding: 0 4px 2px 8px;

  background-color: #222;
  border-radius: 2px 2px 0 0;
  color: #ddd;
`;

const Slot = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LeftToolbar = styled.section`
  display: grid;
  grid-template-columns: 38px 50px auto;
  gap: 10px;
  font-size: 10pt;
`;

const StageKey = styled.div``;

const PauseButton = styled.div<{ emphasis?: boolean; }>`
  cursor: pointer;
  outline: none;
  color: #dfd;
  font-style: ${({ emphasis = false }) => emphasis ? 'italic' : ''};
`;

const SelectButton = styled.div<{ greyed?: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: center;
  color: ${({ greyed }) => greyed ? '#aaa' : '#fff'};
`;

const RightToolbar = styled.section`
  display: grid;
  grid-template-columns: auto 68px;
  gap: 6px;
  font-size: 10pt;
`;

const PanZoomButton = styled.div<{ greyed?: boolean; emphasis?: boolean; }>`
  cursor: pointer;
  background: #222;
  outline: none;
  ${({ greyed = false }) => css`
    color: ${greyed ? '#777' : '#ddd'};
  `}
`;

export default StageToolbar;