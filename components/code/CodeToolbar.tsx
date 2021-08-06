import { useCallback } from "react";
import { styled } from "goober";
import useCode, { CodeMeta } from "store/code.store";

export default function CodeToolbar({ code }: Props) {
  const reset = useCallback(() => {
    // if (code) {
    //   useCode.api.updateCode(code.key, ({ original }) => ({
    //     current: original,
    //     updateEditorAt: Date.now(),
    //   }));
    //   useCode.api.persist(code.key);
    // }
  }, [code]);

  return (
    <>
      <Root>
        <div>{code?.key}</div>
        <RightToolbar>
          <div/>
          <ResetButton onClick={reset}>
            reset
          </ResetButton>
        </RightToolbar>
      </Root>
    </>
  );
}

interface Props {
  code?: CodeMeta | null;
}

const Root = styled('section')`
  font-size: 10pt;
  background: #222;
  color: #fff;
  height: 28px;
  padding: 0 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
`;

const RightToolbar = styled('div')`
  display: grid;
  grid-template-columns: auto auto auto;
  > * {
    margin-left: 10px;
  }
`;

const ResetButton = styled('div')<{}>`
  outline: none;
  cursor: pointer;
  color: #ddd;
`;
