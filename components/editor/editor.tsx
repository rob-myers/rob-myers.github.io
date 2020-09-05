import World from '@components/3d/world';
import Terminal from '@components/shell/terminal'

const Editor: React.FC = () => {
  return (
    <div>
      <World envName="first" high />
      <Terminal alias="test" />
    </div>
  )
};

export default Editor;
