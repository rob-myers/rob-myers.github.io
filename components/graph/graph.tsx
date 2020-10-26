import Cytoscape from "./cytoscape";
import { demoElements, demoStylesheet } from "./util";
import css from './graph.scss';

const Graph: React.FC = () => {

  return (
    <div className={css.root}>
      <Cytoscape
        elements={demoElements}
        stylesheet={demoStylesheet}
      />
    </div>
  );
};

export default Graph;

