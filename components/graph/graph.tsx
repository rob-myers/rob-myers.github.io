import Cytoscape from "./cytoscape";
import { demoElements } from "./util";

const Graph: React.FC = () => {

  return (
    <Cytoscape
      style={ { width: '100%', height: '300px', border: '1px solid #999' } }
      elements={demoElements}
    />
  );
};

export default Graph;
