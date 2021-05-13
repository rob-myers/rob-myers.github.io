import PrismEditor from "./prism-editor"
import styled from "@emotion/styled";

const CodeEditor: React.FC = () => {
  return (
    <Root>
      <PrismEditor />
    </Root>
  );
};

export default CodeEditor;

const Root = styled.section<{}>`
  grid-area: code;
  background: #000;
  overflow: scroll;
  /* max-height: 100; */
`;
