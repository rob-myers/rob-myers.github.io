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
    enableUi && useStage.api.updateSelection(stageKey, ({ enabled }) => ({ enabled: !enabled }));
  }, [enableUi]);

  const toggleSelectionAdditive = useCallback((_: React.MouseEvent<HTMLDivElement>) => {
    enableSelUi && useStage.api.updateSelection(stageKey, ({ additive }) => ({ additive: !additive }));
  }, [enableSelUi]);

  const toggleSelectionLocked = useCallback((_: React.MouseEvent<HTMLDivElement>) => {
    enableSelUi && useStage.api.updateSelection(stageKey, ({ locked }) => ({ locked: !locked }));
  }, [enableSelUi]);

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
        <SelectionToolbar>
          <Icon
            greyed={!enableSelUi}
            onClick={toggleSelectionEnabled}
            title={enableSelUi
              ? 'selection enabled'
              : 'selection disabled'}
          >
            ✓
          </Icon>
          <Icon
            greyed={!(enableSelUi && selection.additive)}
            onClick={toggleSelectionAdditive}
            {...enableSelUi && {
              title: selection.additive
                ? 'selecting additively'
                : 'selecting non-additively'
            }}
          >
            +
          </Icon>
          <LockedButton
            greyed={!(enableSelUi && selection.locked)}
            onClick={toggleSelectionLocked}
            {...enableSelUi && {
              title: selection.locked
                ? 'selection locked'
                : 'selection unlocked'
            }}
          >
            locked
          </LockedButton>
        </SelectionToolbar>
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
  padding: 0px 4px 0 8px;

  background-color: #222;
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
`;

const StageKey = styled.div`
  font-size: 10pt;
`;

const PauseButton = styled.div<{ emphasis?: boolean; }>`
  font-size: 10pt;
  cursor: pointer;
  outline: none;
  color: #dfd;
  font-style: ${({ emphasis = false }) => emphasis ? 'italic' : ''};
`;

const SelectionToolbar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #444;
  padding: 0 4px;
`;

const Icon = styled.div<{ greyed?: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0 4px 2px 4px;
  color: ${({ greyed }) => greyed ? '#aaa' : '#fff'};
`;

const LockedButton = styled.div<{ greyed?: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: center;
  font-size: small;
  padding: 0 4px 0px 4px;
  color: ${({ greyed }) => greyed ? '#aaa' : '#fff'};
`;

const RightToolbar = styled.section`
  display: grid;
  grid-template-columns: auto 68px;
  gap: 6px;
`;

const PanZoomButton = styled.div<{ greyed?: boolean; emphasis?: boolean; }>`
  cursor: pointer;
  background: #222;
  font-size: 10pt;
  outline: none;
  ${({ greyed = false }) => css`
    color: ${greyed ? '#777' : '#ddd'};
  `}
`;

export default StageToolbar;