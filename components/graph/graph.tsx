import Cytoscape from "./cytoscape";
import { demoElements } from "./util";
import css from './graph.scss';

const Graph: React.FC = () => {

  return (
    <div className={css.root}>
      <Cytoscape elements={demoElements} />
    </div>
  );
};

export default Graph;

