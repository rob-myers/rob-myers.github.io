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
  
  const changeEditMode = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    enableUi && useStage.api.updateSelection(stageKey, { editMode: e.currentTarget.value as any });
  }, [enableUi]);

  const toggleSelectorLocked = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    enableUi && useStage.api.updateSelection(stageKey, ({ locked }) => ({ locked: !locked }));
  }, [enableUi]);

  const toggleCam = useCallback(() => {
    enableUi && useStage.api.updateOpts(stageKey, { panZoom: !opts.panZoom });
  }, [enableUi, opts.panZoom]);

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
            <SelectMode
              disabled={!enableUi}
              value={selection.editMode}
              onChange={changeEditMode}
            >
              <option key="disabled" value="disabled" disabled>
                select
              </option>
              <option key="hide" value="hide">hide</option>
              <option key="rect" value="rect">rect</option>
              <option key="paint" value="paint">paint</option>
            </SelectMode>
            <LockedButton
              greyed={!(enableUi && selection.locked)}
              onClick={toggleSelectorLocked}
            >
              locked
            </LockedButton>
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

  height: 28px;
  font-size: 16px;
  border-top: 1px solid #777;
  padding: 0px 8px;

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
  grid-template-columns: 42px 60px auto;
  gap: 10px;
`;

const StageKey = styled.div`
  font-size: 11pt;
  padding-bottom: 3px;
`;

const PauseButton = styled.button<{ greyed?: boolean; emphasis?: boolean; }>`
  cursor: pointer;
  background: #222;
  border-width: 1px;
  outline: none;
  color: #dfd;
  ${({ emphasis = false }) => emphasis && css`
    font-style: italic;
  `}
`;

const SelectMode = styled.select`
  display: flex;
  width: fit-content;
  border-radius: 3px 0 0 3px;
  border-color: #999;
  outline: none;
  background-color: #dde;
  font-size: 10pt;
`;

const LockedButton = styled.div<{ greyed?: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: center;
  font-size: small;
  padding: 0 4px 2px 6px;
  border-radius: 1px 3px 3px 1px;
  color: ${({ greyed }) => greyed ? '#aaa' : '#fff'};
`;

const RightToolbar = styled.section`
  display: grid;
  grid-template-columns: auto 68px;
  gap: 6px;
`;

const PanZoomButton = styled.button<{ greyed?: boolean; emphasis?: boolean; }>`
  cursor: pointer;
  background: #222;
  border-width: 1px;
  outline: none;

  ${({ greyed = false }) => css`
    color: ${greyed ? '#777' : '#ddd'};
  `}
`;

export default StageToolbar;